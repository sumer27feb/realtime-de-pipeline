import json, random
from functools import lru_cache
from pathlib import Path
from producer.app.schemas import PaymentStatus, PaymentMode
import producer.app.state as state

PRODUCTS_FILE = Path(__file__).resolve().parent.parent / "data" / "products.json"
SHIPPING_LOCATIONS_FILE = (
    Path(__file__).resolve().parent.parent / "data" / "shipping_locations.json"
)


@lru_cache(maxsize=1)
def load_products() -> list[dict]:
    with open(PRODUCTS_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


@lru_cache(maxsize=1)
def load_shipping_locations() -> list[dict]:
    with open(SHIPPING_LOCATIONS_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def pick_payment_status():
    return random.choices(
        population=[
            PaymentStatus.success,
            PaymentStatus.failed,
            PaymentStatus.pending,
        ],
        weights=[78, 14, 8],
        k=1,
    )[0]


def pick_payment_mode():
    return random.choices(
        population=[
            PaymentMode.upi,
            PaymentMode.card,
            PaymentMode.cod,
            PaymentMode.wallet,
            PaymentMode.net_banking,
        ],
        weights=[45, 22, 18, 10, 5],
        k=1,
    )[0]


def get_dynamic_event_weights():
    weights = {
        "user_created": 8,
        "product_viewed": 68,
        "order_created": 12,
        "payment_completed": 12,
    }

    open_orders_count = len(state.open_orders)

    if len(state.users) < 50:
        weights["user_created"] += 20
        weights["product_viewed"] -= 10

    if open_orders_count > 50:
        weights["payment_completed"] += 25
        weights["order_created"] -= 5
        weights["product_viewed"] -= 10

    if open_orders_count > 150:
        weights["payment_completed"] += 45
        weights["order_created"] -= 8
        weights["product_viewed"] -= 20

    return weights
