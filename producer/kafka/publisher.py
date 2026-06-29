from typing import Any

from confluent_kafka import Producer, KafkaException

from producer.app import state
from producer.app.config import KAFKA_PRODUCER_CONFIG
from producer.kafka.serializer import serialize_event
from producer.kafka.topic_router import get_topic_for_event
from producer.kafka.key_selector import get_key_for_event, serialize_key

kafka_producer = Producer(KAFKA_PRODUCER_CONFIG)


def delivery_report(error, message) -> None:
    """
    Kafka delivery callback.

    Called asynchronously when Kafka confirms whether message delivery
    succeeded or failed.
    """

    if error is not None:
        state.publish_failures += 1
        state.last_publish_error = str(error)
        return

    state.events_published += 1
    state.last_publish_error = None


def publish_event(event: Any) -> None:
    """
    Publish one generated event to Kafka.

    Steps:
    1. Select topic
    2. Select key
    3. Serialize event
    4. Produce to Kafka
    5. Poll to trigger callbacks
    """

    topic = get_topic_for_event(event)

    key = get_key_for_event(event)
    key_bytes = serialize_key(key)

    value_bytes = serialize_event(event)

    try:
        kafka_producer.produce(
            topic=topic,
            key=key_bytes,
            value=value_bytes,
            callback=delivery_report,
        )

        kafka_producer.poll(0)

    except BufferError as error:
        state.publish_failures += 1
        state.last_publish_error = f"Kafka producer queue full: {error}"

        kafka_producer.poll(1)

    except KafkaException as error:
        state.publish_failures += 1
        state.last_publish_error = str(error)

    except Exception as error:
        state.publish_failures += 1
        state.last_publish_error = str(error)


def flush_producer(timeout: int = 10) -> None:
    """
    Flush pending messages before shutdown.

    This waits for buffered messages to be delivered.
    """

    kafka_producer.flush(timeout)
