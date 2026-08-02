"""
Groups a batch of buffered Kafka events by event type.

This module performs no validation, transformation, or persistence.
Its sole responsibility is partitioning a mixed batch into
event-specific collections that can later be written to
their respective Bronze Delta tables.
"""

from dataclasses import dataclass, field

from consumer.kafka.buffer import BufferedEvent


@dataclass(slots=True)
class GroupedEvents:
    users: list[BufferedEvent] = field(default_factory=list)
    product_views: list[BufferedEvent] = field(default_factory=list)
    orders: list[BufferedEvent] = field(default_factory=list)
    payments: list[BufferedEvent] = field(default_factory=list)


_EVENT_TYPE_TO_BUCKET = {
    "user_created": "users",
    "product_viewed": "product_views",
    "order_created": "orders",
    "payment_completed": "payments",
}


def partition_events(
    events: list[BufferedEvent],
) -> GroupedEvents:
    """
    Partition a mixed batch of buffered events into
    event-specific groups.

    Parameters
    ----------
    events:
        List of buffered Kafka events.

    Returns
    -------
    GroupedEvents
        Buffered events grouped by business event type.

    Raises
    ------
    ValueError
        If an event contains an unsupported event_type.
    """

    grouped = GroupedEvents()

    for buffered_event in events:

        event_type = buffered_event.event.get("event_type")

        bucket_name = _EVENT_TYPE_TO_BUCKET.get(event_type)

        if bucket_name is None:
            raise ValueError(f"Unsupported event_type: {event_type}")

        getattr(
            grouped,
            bucket_name,
        ).append(buffered_event)

    return grouped
