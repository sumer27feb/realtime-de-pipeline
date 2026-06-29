from fastapi import FastAPI, HTTPException

from producer.app import state
from producer.app import producer_service
from producer.app.export_service import export_state_to_csv

from producer.generator.functions import (
    generate_user_created_event,
    generate_product_viewed_event,
    generate_order_created_event,
    generate_payment_completed_event,
    generate_random_event,
)

from producer.app.schemas import (
    UserCreatedEvent,
    ProductViewedEvent,
    OrderCreatedEvent,
    PaymentCompletedEvent,
    ContinuousGenerationRequest,
)

app = FastAPI(
    title="Real-Time E-commerce Event Producer",
    description="Dev API for generating fake e-commerce events",
    version="0.1.0",
)


@app.get("/")
def root():
    return {
        "message": "E-commerce Event Producer is running",
        "available_endpoints": [
            "POST /generate/user",
            "POST /generate/product-view",
            "POST /generate/order",
            "POST /generate/payment",
            "POST /generate/random",
            "POST /producer/start",
            "POST /producer/stop",
            "GET /producer/status",
            "GET /state/summary",
            "POST /state/clear",
        ],
    }


@app.post("/generate/user", response_model=UserCreatedEvent)
def generate_user():
    return generate_user_created_event()


@app.post("/generate/product-view", response_model=ProductViewedEvent)
def generate_product_view():
    return generate_product_viewed_event()


@app.post("/generate/order", response_model=OrderCreatedEvent)
def generate_order():
    try:
        return generate_order_created_event()

    except ValueError as error:
        raise HTTPException(
            status_code=409,
            detail=str(error),
        )


@app.post("/generate/payment", response_model=PaymentCompletedEvent)
def generate_payment():
    try:
        return generate_payment_completed_event()

    except ValueError as error:
        raise HTTPException(
            status_code=409,
            detail=str(error),
        )


@app.post("/generate/random")
def generate_random():
    try:
        return generate_random_event()

    except ValueError as error:
        raise HTTPException(
            status_code=409,
            detail=str(error),
        )


@app.get("/state/summary")
def get_state_summary():
    return state.get_state_summary(include_stock=True)


@app.post("/state/clear")
def clear_state():
    if state.is_generating:
        raise HTTPException(
            status_code=409,
            detail="Stop producer before clearing state",
        )

    state.clear_runtime_state()

    return {
        "message": "Runtime state cleared successfully",
        **state.get_state_summary(include_stock=False),
    }


@app.post("/producer/start")
async def start_producer(request: ContinuousGenerationRequest):
    return await producer_service.start_generation(
        events_per_second=request.events_per_second,
        publish_to_kafka=request.publish_to_kafka,
    )


@app.post("/producer/stop")
async def stop_producer():
    return await producer_service.stop_generation()


@app.get("/producer/status")
def producer_status():
    return producer_service.get_producer_status()


# ------------------------------------------------------------#
# Export to CSV
@app.post("/state/export")
def export_state():
    if state.is_generating:
        raise HTTPException(
            status_code=409,
            detail="Stop producer before exporting state",
        )

    return export_state_to_csv()


# Run from project root:
# uvicorn producer.app.main:app --reload
