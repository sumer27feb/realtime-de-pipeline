from datetime import datetime

from pydantic import BaseModel

# --------------------------------------------------
# 1. Ecommerce Overview
# --------------------------------------------------


class EcommerceOverview(BaseModel):
    total_users: int
    total_product_views: int
    unique_viewers: int
    total_orders: int
    total_payment_attempts: int
    successful_payments: int
    order_value: float
    successful_revenue: float
    average_order_value: float
    view_to_order_rate: float
    payment_success_rate: float


# --------------------------------------------------
# 2. Product Performance
# --------------------------------------------------


class ProductPerformance(BaseModel):
    product_id: str
    product_name: str
    category: str
    views: int
    unique_viewers: int
    orders: int
    units_sold: int
    order_value: float
    successful_revenue: float
    conversion_rate: float


# --------------------------------------------------
# 3. Payment Performance
# --------------------------------------------------


class PaymentPerformance(BaseModel):
    payment_mode: str
    payment_provider: str
    total_attempts: int
    successful_attempts: int
    failed_attempts: int
    pending_attempts: int
    total_payment_amount: float
    successful_payment_amount: float
    success_rate: float
    failure_rate: float
    pending_rate: float


# --------------------------------------------------
# 4. Conversion Funnel
# --------------------------------------------------


class ConversionFunnel(BaseModel):
    total_users: int
    total_product_views: int
    total_orders: int
    total_payment_attempts: int
    successful_payments: int
    views_per_user: float
    view_to_order_rate: float
    payment_attempts_per_order: float
    payment_success_rate: float
    view_to_successful_payment_rate: float


# --------------------------------------------------
# 5. Event Activity
# --------------------------------------------------


class EventActivity(BaseModel):
    window_start: datetime
    window_end: datetime
    event_type: str
    event_count: int
    unique_users: int
    events_per_active_user: float
