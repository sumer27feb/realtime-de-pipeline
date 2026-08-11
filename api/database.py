from databricks import sql

from api.config import (
    DATABRICKS_HOST,
    DATABRICKS_HTTP_PATH,
    DATABRICKS_TOKEN,
)


def get_connection():
    return sql.connect(
        server_hostname=DATABRICKS_HOST,
        http_path=DATABRICKS_HTTP_PATH,
        access_token=DATABRICKS_TOKEN,
    )


def fetch_all(query: str):
    connection = get_connection()

    try:
        cursor = connection.cursor()

        try:
            cursor.execute(query)

            columns = [column[0] for column in cursor.description]
            rows = cursor.fetchall()

            return [dict(zip(columns, row)) for row in rows]

        finally:
            cursor.close()

    finally:
        connection.close()
