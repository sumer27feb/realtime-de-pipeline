import json
from typing import Any


def event_to_dict(event: Any) -> dict[str, Any]:
    """
    Convert a Pydantic event model into a JSON-safe dictionary.

    Handles:
    - UUID
    - datetime
    - Decimal
    - Enum
    """

    if hasattr(event, "model_dump"):
        return event.model_dump(mode="json")

    return event.dict()


def serialize_event(event: Any) -> bytes:
    """
    Convert event object into JSON bytes for Kafka.

    Kafka message value must be bytes.
    """

    event_dict = event_to_dict(event)

    event_json = json.dumps(
        event_dict,
        ensure_ascii=False,
        separators=(",", ":"),
        default=str,
    )

    return event_json.encode("utf-8")
