import asyncio
from typing import Any

from producer.app import state
from producer.generator.functions import generate_random_event

generation_task: asyncio.Task | None = None


async def continuous_generation_loop(events_per_second: int) -> None:
    delay = 1 / events_per_second

    while state.is_generating:
        try:
            event = generate_random_event()

            state.last_generated_event = event
            state.last_error = None
            state.continuous_events_generated += 1

        except Exception as error:
            state.last_error = str(error)

        await asyncio.sleep(delay)


async def start_generation(events_per_second: int) -> dict[str, Any]:
    global generation_task

    if state.is_generating:
        return {
            "message": "Producer is already running",
            "events_per_second": state.current_events_per_second,
            "continuous_events_generated": state.continuous_events_generated,
        }

    state.is_generating = True
    state.current_events_per_second = events_per_second

    generation_task = asyncio.create_task(continuous_generation_loop(events_per_second))

    return {
        "message": "Continuous event generation started",
        "events_per_second": events_per_second,
    }


async def stop_generation() -> dict[str, Any]:
    global generation_task

    if not state.is_generating:
        return {
            "message": "Producer is not running",
            "continuous_events_generated": state.continuous_events_generated,
        }

    state.is_generating = False
    state.current_events_per_second = 0

    if generation_task:
        await generation_task
        generation_task = None

    return {
        "message": "Continuous event generation stopped",
        "continuous_events_generated": state.continuous_events_generated,
    }


def get_producer_status() -> dict[str, Any]:
    return {
        "is_generating": state.is_generating,
        "events_per_second": state.current_events_per_second,
        "continuous_events_generated": state.continuous_events_generated,
        "last_generated_event": state.last_generated_event,
        "last_error": state.last_error,
        **state.get_state_summary(include_stock=False),
    }
