from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID, uuid4

import random
from faker import Faker
from producer.generator.helper import (
    pick_payment_status,
    pick_payment_mode,
    get_dynamic_event_weights,
)

from producer.app.state import (
    users,
    product_views,
    orders,
    open_orders,
    payments,
    product_stock,
    user_product_views,
    PRODUCTS,
    SHIPPING_LOCATIONS,
)

from producer.app.schemas import (
    UserCreatedEvent,
    ProductViewedEvent,
    OrderCreatedEvent,
    PaymentCompletedEvent,
    SignupMethod,
    DeviceType,
    PaymentMode,
    PaymentStatus,
    PaymentProvider,
)

from producer.app.config import (
    DEFAULT_CURRENCY,
    MIN_ORDER_QUANTITY,
    MAX_ORDER_QUANTITY,
)

fake = Faker("en_IN")


def now_utc():
    return datetime.now(timezone.utc)


# User Created Event
def generate_user_created_event():
    event = UserCreatedEvent(
        event_id=uuid4(),
        event_timestamp=now_utc(),
        user_id=uuid4(),
        username=fake.user_name(),
        email=fake.email(),
        phone=f"9{random.randint(100000000, 999999999)}",
        signup_method=random.choice(list(SignupMethod)),
        device_type=random.choice(list(DeviceType)),
    )

    users.append(event)

    return event


# Product Viewed Event
def generate_product_viewed_event():
    if not users:
        generate_user_created_event()

    user = random.choice(users)
    product = random.choice(PRODUCTS)

    product_id = product["product_id"]

    event = ProductViewedEvent(
        event_id=uuid4(),
        event_timestamp=now_utc(),
        user_id=user.user_id,
        session_id=uuid4(),
        product_id=UUID(product_id),
        product_name=product["product_name"],
        category=product["category"],
        price_at_view=Decimal(str(product["price"])),
        stock_quantity_at_view=product_stock[product_id],
    )

    product_views.append(event)

    user_product_views.setdefault(
        str(user.user_id),
        [],
    ).append(event)

    return event


# Order Created Event
def generate_order_created_event():
    if not product_views:
        generate_product_viewed_event()

    max_attempts = 20
    selected_view = None

    for _ in range(max_attempts):
        view = random.choice(product_views)
        product_id = str(view.product_id)
        available_stock = product_stock[product_id]

        if available_stock > 0:
            selected_view = view
            break

    if selected_view is None:
        raise ValueError("No viewed products available with stock")

    view = selected_view
    product_id = str(view.product_id)
    available_stock = product_stock[product_id]

    quantity = min(
        random.randint(
            MIN_ORDER_QUANTITY,
            MAX_ORDER_QUANTITY,
        ),
        available_stock,
    )

    location = random.choice(SHIPPING_LOCATIONS)

    unit_price = view.price_at_view
    total_amount = unit_price * quantity

    event = OrderCreatedEvent(
        event_id=uuid4(),
        event_timestamp=now_utc(),
        order_id=uuid4(),
        user_id=view.user_id,
        product_id=view.product_id,
        quantity=quantity,
        unit_price=unit_price,
        total_amount=total_amount,
        currency=DEFAULT_CURRENCY,
        shipping_city=location["city"],
        shipping_state=location["state"],
    )

    # Reserve stock at order creation.
    product_stock[product_id] -= quantity

    orders.append(event)
    open_orders.append(event)

    return event


# Payment Completed Event
def generate_payment_completed_event():
    if not open_orders:
        generate_order_created_event()

    order = random.choice(open_orders)

    event = PaymentCompletedEvent(
        event_id=uuid4(),
        event_timestamp=now_utc(),
        payment_id=uuid4(),
        order_id=order.order_id,
        user_id=order.user_id,
        product_id=order.product_id,
        amount=order.total_amount,
        currency=order.currency,
        payment_mode=pick_payment_mode(),
        payment_status=pick_payment_status(),
        payment_provider=random.choice(list(PaymentProvider)),
    )

    payments.append(event)

    product_id = str(order.product_id)

    if event.payment_status == PaymentStatus.success:
        # Stock was already reserved during order creation.
        # Payment success confirms the sale.
        open_orders.remove(order)

    elif event.payment_status == PaymentStatus.failed:
        # Release reserved stock back into available inventory.
        product_stock[product_id] += order.quantity
        open_orders.remove(order)

    elif event.payment_status == PaymentStatus.pending:
        # Keep stock reserved.
        # Keep order open because payment is not finalized yet.
        pass

    return event


# Continuous Event Generator


def generate_random_event():
    weights = get_dynamic_event_weights()

    event_type = random.choices(
        population=list(weights.keys()),
        weights=list(weights.values()),
        k=1,
    )[0]

    try:
        if event_type == "user_created":
            return generate_user_created_event()

        if event_type == "product_viewed":
            return generate_product_viewed_event()

        if event_type == "order_created":
            return generate_order_created_event()

        if event_type == "payment_completed":
            return generate_payment_completed_event()

    except ValueError:
        # Fallback if order/payment generation fails due to stock/state issues.
        raise ValueError(f"Unsupported event type: {event_type}")
