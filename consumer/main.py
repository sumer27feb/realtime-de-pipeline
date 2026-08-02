import time

from confluent_kafka import KafkaError, TopicPartition

from consumer.kafka.client import create_kafka_consumer
from consumer.kafka.deserializer import (
    deserialize_message_key,
    deserialize_message_value,
)
from consumer.kafka.topic_router import route_and_insert_event
from consumer.db.connection import create_postgres_connection

POLL_TIMEOUT_SECONDS = 1.0
RETRY_SLEEP_SECONDS = 2


def build_kafka_metadata(message) -> dict:
    return {
        "kafka_topic": message.topic(),
        "kafka_partition": message.partition(),
        "kafka_offset": message.offset(),
        "kafka_key": deserialize_message_key(message.key()),
    }


def seek_to_current_message(consumer, message) -> None:
    """
    If DB insert fails, seek back to the same Kafka message.

    This prevents the running consumer from silently moving ahead.
    """

    topic_partition = TopicPartition(
        message.topic(),
        message.partition(),
        message.offset(),
    )

    consumer.seek(topic_partition)


def run_consumer() -> None:
    consumer = create_kafka_consumer()
    conn = create_postgres_connection()

    print("Kafka raw ingestion consumer started.")
    print("Subscribed to ecommerce topics.")

    try:
        while True:
            message = consumer.poll(POLL_TIMEOUT_SECONDS)

            if message is None:
                continue

            if message.error():
                if message.error().code() == KafkaError._PARTITION_EOF:
                    continue

                print(f"Kafka error: {message.error()}")
                continue

            try:
                event = deserialize_message_value(message.value())
                metadata = build_kafka_metadata(message)

                route_and_insert_event(
                    conn=conn,
                    topic=message.topic(),
                    event=event,
                    metadata=metadata,
                )

                conn.commit()

                consumer.commit(
                    message=message,
                    asynchronous=False,
                )

                print(
                    f"Inserted event_id={event.get('event_id')} "
                    f"topic={message.topic()} "
                    f"partition={message.partition()} "
                    f"offset={message.offset()}"
                )

            except Exception as error:
                conn.rollback()

                print(
                    f"Error processing message. "
                    f"topic={message.topic()} "
                    f"partition={message.partition()} "
                    f"offset={message.offset()} "
                    f"error={error}"
                )

                seek_to_current_message(consumer, message)

                time.sleep(RETRY_SLEEP_SECONDS)

    except KeyboardInterrupt:
        print("Consumer stopped by user.")

    finally:
        consumer.close()
        conn.close()
        print("Kafka consumer and Postgres connection closed.")


if __name__ == "__main__":
    run_consumer()
