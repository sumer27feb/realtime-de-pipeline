import json
from typing import Any


def deserialize_message_value(value: bytes) -> dict[str, Any]:
    """
    Convert Kafka message bytes into Python dict.

    Producer side did:
        Pydantic event -> JSON bytes

    Consumer side does:
        JSON bytes -> Python dict
    """

    if value is None:
        raise ValueError("Kafka message value is empty")

    decoded_value = value.decode("utf-8")

    return json.loads(decoded_value)


def deserialize_message_key(key: bytes | None) -> str | None:
    if key is None:
        return None

    return key.decode("utf-8")
