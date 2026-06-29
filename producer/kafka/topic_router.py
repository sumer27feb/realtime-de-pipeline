from typing import Any

from producer.app.config import KAFKA_TOPIC_MAP


def get_topic_for_event(event: Any) -> str:
    """
    Select Kafka topic based on event_type.
    """

    event_type = event.event_type

    if event_type not in KAFKA_TOPIC_MAP:
        raise ValueError(f"No Kafka topic configured for event_type: {event_type}")

    return KAFKA_TOPIC_MAP[event_type]
