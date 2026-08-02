from databricks.connect import DatabricksSession

from consumer.config import (
    DATABRICKS_HOST,
    DATABRICKS_TOKEN,
)


def create_spark_session():
    spark = (
        DatabricksSession.builder.host(DATABRICKS_HOST)
        .token(DATABRICKS_TOKEN)
        .serverless()
        .getOrCreate()
    )

    return spark


def test_databricks_connection() -> None:
    spark = create_spark_session()

    print("=" * 80)
    print("CONNECTED TO DATABRICKS")
    print(f"Spark Version : {spark.version}")
    print("=" * 80)

    # ------------------------------------------------------------------
    # Test 1 : Catalogs & Schemas
    # ------------------------------------------------------------------

    print("\n===== AVAILABLE CATALOGS =====")
    spark.sql("SHOW CATALOGS").show(truncate=False)

    print("\n===== AVAILABLE SCHEMAS =====")
    spark.sql("SHOW SCHEMAS").show(truncate=False)

    # ------------------------------------------------------------------
    # Test 2 : Create DataFrame
    # ------------------------------------------------------------------

    print("\n===== CREATING TEST DATAFRAME =====")

    data = [
        (1, "Alice"),
        (2, "Bob"),
        (3, "Charlie"),
    ]

    df = spark.createDataFrame(
        data,
        schema=["id", "name"],
    )

    df.show()

    # ------------------------------------------------------------------
    # Test 3 : Write Delta Table
    # ------------------------------------------------------------------

    table_name = "workspace.default.connection_test"

    print(f"\n===== WRITING TO DELTA TABLE : {table_name} =====")

    (df.write.mode("overwrite").saveAsTable(table_name))

    print("Write successful.")

    # ------------------------------------------------------------------
    # Test 4 : Read Back
    # ------------------------------------------------------------------

    print(f"\n===== READING TABLE : {table_name} =====")

    spark.read.table(table_name).show()

    print("\n===== ROW COUNT =====")

    count = spark.read.table(table_name).count()

    print(f"Rows in table : {count}")

    print("\nALL TESTS PASSED")


if __name__ == "__main__":
    test_databricks_connection()
