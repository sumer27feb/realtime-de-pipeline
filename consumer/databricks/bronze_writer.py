"""
Bronze Delta Lake writer.

Responsibilities
----------------
- Receive grouped events from the batch processor.
- Convert each non-empty event group into a Spark DataFrame.
- Append DataFrames to their respective Bronze Delta tables.
- Raise immediately if any write fails.
"""

from pyspark.sql import SparkSession

from consumer.kafka.batch_processor import GroupedEvents

from consumer.databricks.constants import (
    BRONZE_USERS_TABLE,
    BRONZE_PRODUCT_VIEWS_TABLE,
    BRONZE_ORDERS_TABLE,
    BRONZE_PAYMENTS_TABLE,
)


def _write_table(
    spark: SparkSession,
    table_name: str,
    buffered_events: list,
) -> None:
    """
    Writes one event group to a Bronze Delta table.

    Parameters
    ----------
    spark:
        Active Databricks SparkSession.

    table_name:
        Destination Bronze Delta table.

    buffered_events:
        List of BufferedEvent objects belonging to the same
        business event type.

    Raises
    ------
    Exception
        Propagates any Spark write exception.
    """

    if not buffered_events:
        return

    payloads = [buffered_event.event for buffered_event in buffered_events]

    dataframe = spark.createDataFrame(payloads)

    (dataframe.write.mode("append").saveAsTable(table_name))

    print(f"[BronzeWriter] " f"{table_name} <- {len(payloads)} rows")


def write_bronze_batch(
    spark: SparkSession,
    grouped_events: GroupedEvents,
) -> None:
    """
    Writes an entire grouped event batch to Bronze Delta tables.

    Events are written table-by-table.

    If any write fails, execution stops immediately and the
    exception propagates back to the orchestrator.
    """

    _write_table(
        spark=spark,
        table_name=BRONZE_USERS_TABLE,
        buffered_events=grouped_events.users,
    )

    _write_table(
        spark=spark,
        table_name=BRONZE_PRODUCT_VIEWS_TABLE,
        buffered_events=grouped_events.product_views,
    )

    _write_table(
        spark=spark,
        table_name=BRONZE_ORDERS_TABLE,
        buffered_events=grouped_events.orders,
    )

    _write_table(
        spark=spark,
        table_name=BRONZE_PAYMENTS_TABLE,
        buffered_events=grouped_events.payments,
    )
