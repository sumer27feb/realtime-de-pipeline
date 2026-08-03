"""
Creates and manages the Databricks SparkSession.

Responsibilities:
- Configure Databricks Connect.
- Create a remote SparkSession.
- Return the SparkSession to the caller.
"""

from databricks.connect import DatabricksSession

from consumer.config import (
    DATABRICKS_HOST,
    DATABRICKS_TOKEN,
)


def create_spark_session():
    """
    Creates a SparkSession connected to the configured
    Databricks workspace using serverless compute.

    Returns
    -------
    SparkSession
        Remote Databricks SparkSession.
    """

    spark = (
        DatabricksSession.builder.host(DATABRICKS_HOST)
        .token(DATABRICKS_TOKEN)
        .serverless()
        .getOrCreate()
    )

    return spark
