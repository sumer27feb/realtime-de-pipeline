from typing import Any


def get_key_for_event(event: Any) -> str:
    """
    Select Kafka message key.

    Kafka uses key to decide partition.
    Related events with the same key usually go to the same partition.
    """

    if event.event_type in {"user_created", "product_viewed"}:
        return str(event.user_id)

    if event.event_type in {"order_created", "payment_completed"}:
        return str(event.order_id)

    return str(event.event_id)


def serialize_key(key: str) -> bytes:
    """
    Convert Kafka key string into bytes.
    """

    return key.encode("utf-8")
