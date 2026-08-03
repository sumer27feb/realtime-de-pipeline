"""
Creates Bronze Delta tables if they do not already exist.

Responsibilities
----------------
- Ensure all required Bronze Delta tables exist.
- Execute only DDL statements.
- Raise immediately if table creation fails.

This module intentionally does NOT:
- Write event data
- Read event data
- Perform transformations
- Contain Kafka logic
"""

from pyspark.sql import SparkSession

from consumer.databricks.constants import (
    BRONZE_ORDERS_TABLE,
    BRONZE_PAYMENTS_TABLE,
    BRONZE_PRODUCT_VIEWS_TABLE,
    BRONZE_USERS_TABLE,
)

BRONZE_TABLE_DDL: dict[str, str] = {
    BRONZE_USERS_TABLE: f"""
        CREATE TABLE IF NOT EXISTS {BRONZE_USERS_TABLE} (
            event_id STRING,
            event_type STRING,
            event_timestamp TIMESTAMP,

            user_id STRING,
            username STRING,
            email STRING,
            phone STRING,
            signup_method STRING,
            device_type STRING
        )
        USING DELTA
    """,
    BRONZE_PRODUCT_VIEWS_TABLE: f"""
        CREATE TABLE IF NOT EXISTS {BRONZE_PRODUCT_VIEWS_TABLE} (
            event_id STRING,
            event_type STRING,
            event_timestamp TIMESTAMP,

            user_id STRING,
            session_id STRING,
            product_id STRING,
            product_name STRING,
            category STRING,
            price_at_view DOUBLE,
            stock_quantity_at_view INT
        )
        USING DELTA
    """,
    BRONZE_ORDERS_TABLE: f"""
        CREATE TABLE IF NOT EXISTS {BRONZE_ORDERS_TABLE} (
            event_id STRING,
            event_type STRING,
            event_timestamp TIMESTAMP,

            order_id STRING,
            user_id STRING,
            product_id STRING,
            quantity INT,
            unit_price DOUBLE,
            total_amount DOUBLE,
            currency STRING,
            shipping_city STRING,
            shipping_state STRING
        )
        USING DELTA
    """,
    BRONZE_PAYMENTS_TABLE: f"""
        CREATE TABLE IF NOT EXISTS {BRONZE_PAYMENTS_TABLE} (
            event_id STRING,
            event_type STRING,
            event_timestamp TIMESTAMP,

            payment_id STRING,
            order_id STRING,
            user_id STRING,
            product_id STRING,
            amount DOUBLE,
            currency STRING,
            payment_mode STRING,
            payment_status STRING,
            payment_provider STRING
        )
        USING DELTA
    """,
}


def _create_table_if_not_exists(
    spark: SparkSession,
    table_name: str,
    ddl: str,
) -> None:
    """
    Creates a Bronze Delta table if it does not already exist.
    """

    spark.sql(ddl)

    print(f"[TableManager] Ready: {table_name}")


def ensure_bronze_tables(
    spark: SparkSession,
) -> None:
    """
    Ensures that all Bronze Delta tables required by the
    ingestion pipeline exist.

    Raises
    ------
    Exception
        Propagates any Spark SQL exception immediately.
    """

    print("Ensuring Bronze Delta tables exist...")

    for table_name, ddl in BRONZE_TABLE_DDL.items():
        _create_table_if_not_exists(
            spark=spark,
            table_name=table_name,
            ddl=ddl,
        )

    print("Bronze table initialization complete.")
