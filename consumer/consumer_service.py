"""
Kafka Consumer Orchestration Service.

Responsibilities
----------------
- Initialize all infrastructure.
- Coordinate Kafka, buffering and Databricks.
- Trigger batch flushes.
- Handle graceful shutdown.

This module intentionally does NOT:
- Deserialize Kafka messages.
- Partition events.
- Write Spark DataFrames.
- Create Kafka clients.
- Create Spark sessions.

It orchestrates those modules.
"""

from __future__ import annotations

import time

from confluent_kafka import Consumer, KafkaError, TopicPartition
from pyspark.sql import SparkSession

from consumer.config import (
    BUFFER_FLUSH_INTERVAL_SECONDS,
    BUFFER_MAX_SIZE,
    RETRY_SLEEP_SECONDS,
    POLL_TIMEOUT_SECONDS,
)
from consumer.databricks.bronze_writer import write_bronze_batch
from consumer.databricks.session import create_spark_session
from consumer.databricks.table_manager import ensure_bronze_tables
from consumer.kafka.batch_processor import partition_events
from consumer.kafka.client import create_kafka_consumer
from consumer.kafka.buffer import EventBuffer
from consumer.kafka.deserializer import deserialize_message_value


def initialize_consumer() -> tuple[
    SparkSession,
    Consumer,
    EventBuffer,
]:
    """
    Initializes every infrastructure dependency required by
    the ingestion service.
    """

    print("Initializing Databricks Spark session...")

    spark = create_spark_session()

    print("Ensuring Bronze Delta tables exist...")

    ensure_bronze_tables(spark)

    print("Creating Kafka consumer...")

    consumer = create_kafka_consumer()

    print("Creating event buffer...")

    event_buffer = EventBuffer(
        max_size=BUFFER_MAX_SIZE,
        flush_interval_seconds=BUFFER_FLUSH_INTERVAL_SECONDS,
    )

    print("Consumer initialization complete.\n")

    return (
        spark,
        consumer,
        event_buffer,
    )


def flush_event_buffer(
    spark: SparkSession,
    event_buffer: EventBuffer,
) -> None:
    """
    Flushes the current buffer into Bronze Delta tables.

    Note
    ----
    This function DOES NOT clear the buffer.

    The caller is responsible for clearing the buffer only
    after Kafka offsets have been committed successfully.
    """

    if event_buffer.is_empty():
        return

    buffered_events = event_buffer.get_batch()

    grouped_events = partition_events(
        buffered_events,
    )

    write_bronze_batch(
        spark=spark,
        grouped_events=grouped_events,
    )


def wait_before_retry() -> None:
    """
    Sleeps briefly before retrying after a recoverable failure.
    """

    time.sleep(RETRY_SLEEP_SECONDS)


def shutdown_consumer(
    consumer: Consumer,
) -> None:
    """
    Gracefully shuts down the Kafka consumer.
    """

    print("\nShutting down consumer...")

    consumer.close()

    print("Kafka consumer closed.")


def commit_batch_offsets(
    consumer: Consumer,
    event_buffer: EventBuffer,
) -> None:
    """
    Commits the highest processed offset for every Kafka partition
    present in the current batch.
    """

    if event_buffer.is_empty():
        return

    latest_offsets: dict[tuple[str, int], int] = {}
    batch = event_buffer.get_batch()
    for buffered_event in batch:

        key = (
            buffered_event.topic,
            buffered_event.partition,
        )

        latest_offsets[key] = max(
            latest_offsets.get(key, -1),
            buffered_event.offset,
        )

    topic_partitions = [
        TopicPartition(
            topic,
            partition,
            offset + 1,
        )
        for (topic, partition), offset in latest_offsets.items()
    ]

    consumer.commit(
        offsets=topic_partitions,
        asynchronous=False,
    )

    print(f"Committed offsets for {len(topic_partitions)} partition(s).")


def run_consumer() -> None:
    """
    Starts the Kafka → Bronze ingestion service.

    The Kafka polling loop and batch offset commit logic
    will be implemented in Part 2.
    """

    spark, consumer, event_buffer = initialize_consumer()

    try:

        #
        # ======================================================
        # Kafka polling loop
        #
        # Part 2 begins here.
        # ======================================================
        #

        print("Kafka Bronze ingestion service started.\n")

        while True:

            message = consumer.poll(POLL_TIMEOUT_SECONDS)

            if message is None:
                continue

            if message.error():

                if message.error().code() == KafkaError._PARTITION_EOF:
                    continue

                print(f"Kafka Error : {message.error()}")

                continue

            try:

                event = deserialize_message_value(
                    message.value(),
                )

                event_buffer.add(
                    event=event,
                    message=message,
                )

                if not event_buffer.should_flush():
                    continue

                batch_size = len(event_buffer)

                print(f"\nFlushing batch ({batch_size} events)...")

                flush_event_buffer(
                    spark=spark,
                    event_buffer=event_buffer,
                )

                commit_batch_offsets(
                    consumer=consumer,
                    event_buffer=event_buffer,
                )

                event_buffer.clear()

                print(f"Batch persisted successfully " f"({batch_size} events).\n")

            except Exception as error:

                print("Batch processing failed.\n" f"Reason : {error}")

                wait_before_retry()

    except KeyboardInterrupt:

        print("\nShutdown requested.")

        try:

            if not event_buffer.is_empty():

                print(f"Flushing remaining " f"{len(event_buffer)} buffered events...")

                flush_event_buffer(
                    spark=spark,
                    event_buffer=event_buffer,
                )

                commit_batch_offsets(
                    consumer=consumer,
                    event_buffer=event_buffer,
                )

                event_buffer.clear()
                print("Remaining buffer cleared.")
                print("Final batch persisted successfully.")

        except Exception as error:

            print("Failed to flush final batch during shutdown.\n" f"Reason : {error}")

    finally:

        shutdown_consumer(
            consumer,
        )
