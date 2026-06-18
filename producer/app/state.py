from typing import Any

from producer.generator.helper import (
    load_products,
    load_shipping_locations,
)

PRODUCTS = load_products()
SHIPPING_LOCATIONS = load_shipping_locations()


users: list[Any] = []
product_views: list[Any] = []
user_product_views: dict[str, list[Any]] = {}

orders: list[Any] = []
open_orders: list[Any] = []
payments: list[Any] = []

product_stock: dict[str, int] = {}

is_generating: bool = False
continuous_events_generated: int = 0
current_events_per_second: int = 0
last_generated_event: Any = None
last_error: str | None = None


def reset_product_stock() -> None:
    product_stock.clear()
    product_stock.update(
        {product["product_id"]: product["stock_quantity"] for product in PRODUCTS}
    )


def clear_runtime_state() -> None:
    global continuous_events_generated
    global current_events_per_second
    global last_generated_event
    global last_error

    users.clear()
    product_views.clear()
    user_product_views.clear()

    orders.clear()
    open_orders.clear()
    payments.clear()

    reset_product_stock()

    continuous_events_generated = 0
    current_events_per_second = 0
    last_generated_event = None
    last_error = None


def get_state_summary(include_stock: bool = True) -> dict[str, Any]:
    summary = {
        "users": len(users),
        "product_views": len(product_views),
        "orders": len(orders),
        "open_orders": len(open_orders),
        "payments": len(payments),
        "products_loaded": len(PRODUCTS),
        "shipping_locations_loaded": len(SHIPPING_LOCATIONS),
        "total_available_stock": sum(product_stock.values()),
    }

    if include_stock:
        summary["product_stock"] = product_stock

    return summary


reset_product_stock()
