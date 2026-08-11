from airflow.sdk import DAG
from airflow.providers.standard.operators.bash import BashOperator
from datetime import datetime


DBT_PROJECT_DIR = "/opt/project/dbt/ecommerce_pipeline"


with DAG(
    dag_id="ecommerce_dbt_pipeline",
    start_date=datetime(2026, 8, 11),
    schedule="*/15 * * * *",
    catchup=False,
    tags=["ecommerce", "dbt"],
) as dag:

    dbt_silver = BashOperator(
        task_id="dbt_silver",
        bash_command=(
            f"cd {DBT_PROJECT_DIR} && "
            "dbt run --select silver"
        ),
    )

    dbt_gold = BashOperator(
        task_id="dbt_gold",
        bash_command=(
            f"cd {DBT_PROJECT_DIR} && "
            "dbt run --select gold --full-refresh"
        ),
    )

    dbt_silver >> dbt_gold