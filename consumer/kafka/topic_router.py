from typing import Any, Callable

from psycopg import Connection

from consumer.db.raw_inserts import (
    insert_user_created_event,
    insert_product_viewed_event,
    insert_order_created_event,
    insert_payment_completed_event,
)

InsertFunction = Callable[[Connection, dict[str, Any], dict[str, Any]], None]


TOPIC_INSERT_MAP: dict[str, InsertFunction] = {
    "ecommerce.user.created": insert_user_created_event,
    "ecommerce.product.viewed": insert_product_viewed_event,
    "ecommerce.order.created": insert_order_created_event,
    "ecommerce.payment.completed": insert_payment_completed_event,
}


def route_and_insert_event(
    conn: Connection,
    topic: str,
    event: dict[str, Any],
    metadata: dict[str, Any],
) -> None:
    insert_function = TOPIC_INSERT_MAP.get(topic)

    if insert_function is None:
        raise ValueError(f"No raw insert function configured for topic: {topic}")

    insert_function(conn, event, metadata)
