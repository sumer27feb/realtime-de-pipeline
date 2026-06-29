import asyncio
from typing import Any

from producer.app import state
from producer.generator.functions import generate_random_event
from producer.kafka.publisher import publish_event, flush_producer

generation_task: asyncio.Task | None = None


async def continuous_generation_loop(
    events_per_second: int,
    publish_to_kafka: bool = False,
) -> None:
    delay = 1 / events_per_second

    while state.is_generating:
        try:
            event = generate_random_event()

            state.last_generated_event = event
            state.last_error = None
            state.continuous_events_generated += 1

            if publish_to_kafka:
                publish_event(event)

        except Exception as error:
            state.last_error = str(error)

        await asyncio.sleep(delay)


async def start_generation(
    events_per_second: int,
    publish_to_kafka: bool = False,
) -> dict[str, Any]:
    global generation_task

    if state.is_generating:
        return {
            "message": "Producer is already running",
            "producer_mode": state.producer_mode,
            "events_per_second": state.current_events_per_second,
            "continuous_events_generated": state.continuous_events_generated,
            "events_published": state.events_published,
            "publish_failures": state.publish_failures,
        }

    state.is_generating = True
    state.current_events_per_second = events_per_second
    state.producer_mode = "kafka" if publish_to_kafka else "local"

    generation_task = asyncio.create_task(
        continuous_generation_loop(
            events_per_second=events_per_second,
            publish_to_kafka=publish_to_kafka,
        )
    )

    return {
        "message": "Continuous event generation started",
        "producer_mode": state.producer_mode,
        "events_per_second": events_per_second,
        "publish_to_kafka": publish_to_kafka,
    }


async def stop_generation() -> dict[str, Any]:
    global generation_task

    if not state.is_generating:
        return {
            "message": "Producer is not running",
            "producer_mode": state.producer_mode,
            "continuous_events_generated": state.continuous_events_generated,
            "events_published": state.events_published,
            "publish_failures": state.publish_failures,
        }

    state.is_generating = False
    state.current_events_per_second = 0

    if generation_task:
        await generation_task
        generation_task = None

    if state.producer_mode == "kafka":
        flush_producer()

    return {
        "message": "Continuous event generation stopped",
        "producer_mode": state.producer_mode,
        "continuous_events_generated": state.continuous_events_generated,
        "events_published": state.events_published,
        "publish_failures": state.publish_failures,
        "last_publish_error": state.last_publish_error,
    }


def get_producer_status() -> dict[str, Any]:
    return {
        "is_generating": state.is_generating,
        "producer_mode": state.producer_mode,
        "events_per_second": state.current_events_per_second,
        "continuous_events_generated": state.continuous_events_generated,
        "events_published": state.events_published,
        "publish_failures": state.publish_failures,
        "last_generated_event": state.last_generated_event,
        "last_error": state.last_error,
        "last_publish_error": state.last_publish_error,
        **state.get_state_summary(include_stock=False),
    }
