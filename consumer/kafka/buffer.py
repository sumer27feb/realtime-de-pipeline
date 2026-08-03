"""
In-memory event buffer for Kafka consumer.

The buffer accumulates Kafka events and decides when they
should be flushed for batch processing.

Flush conditions:
1. Buffer reaches configured maximum size.
2. Flush interval expires.
"""

from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Any

from confluent_kafka import Message


@dataclass(slots=True)
class BufferedEvent:
    """
    Represents one event stored inside the in-memory buffer.

    Besides the deserialized event payload, it stores the
    minimum Kafka metadata required to commit offsets after
    successful batch persistence.
    """

    event: dict[str, Any]
    topic: str
    partition: int
    offset: int


class EventBuffer:
    def __init__(
        self,
        max_size: int,
        flush_interval_seconds: float,
    ) -> None:

        if max_size <= 0:
            raise ValueError("max_size must be positive.")

        if flush_interval_seconds <= 0:
            raise ValueError("flush_interval_seconds must be positive.")

        self._max_size = max_size
        self._flush_interval = flush_interval_seconds

        self._events: list[BufferedEvent] = []
        self._first_event_timestamp: float | None = None

    def add(
        self,
        event: dict[str, Any],
        message: Message,
    ) -> None:
        """
        Add one Kafka event to the buffer.
        """

        if not self._events:
            self._first_event_timestamp = time.monotonic()

        self._events.append(
            BufferedEvent(
                event=event,
                topic=message.topic(),
                partition=message.partition(),
                offset=message.offset(),
            )
        )

    def should_flush(self) -> bool:
        """
        Returns True if either flush condition is met.
        """

        if not self._events:
            return False

        if len(self._events) >= self._max_size:
            return True

        elapsed = time.monotonic() - self._first_event_timestamp

        return elapsed >= self._flush_interval

    def get_batch(self) -> list[BufferedEvent]:
        """
        Returns current batch without clearing it.
        """

        return self._events.copy()

    def clear(self) -> None:
        """
        Clears the buffer after successful persistence.
        """

        self._events.clear()
        self._first_event_timestamp = None

    def is_empty(self) -> bool:
        return not self._events

    def __len__(self) -> int:
        return len(self._events)
