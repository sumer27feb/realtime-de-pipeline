from datetime import datetime
from decimal import Decimal
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class SignupMethod(str, Enum):
    email = "email"
    google = "google"
    phone = "phone"


class DeviceType(str, Enum):
    android = "android"
    ios = "ios"
    web = "web"


class PaymentMode(str, Enum):
    upi = "upi"
    card = "card"
    net_banking = "net_banking"
    wallet = "wallet"
    cod = "cod"


class PaymentStatus(str, Enum):
    success = "success"
    failed = "failed"
    pending = "pending"


class PaymentProvider(str, Enum):
    razorpay = "razorpay"
    phonepe = "phonepe"
    paytm = "paytm"
    stripe = "stripe"


class BaseEvent(BaseModel):
    event_id: UUID
    event_type: str
    event_timestamp: datetime


class UserCreatedEvent(BaseEvent):
    event_type: str = Field(default="user_created")
    user_id: UUID
    username: str
    email: EmailStr
    phone: str
    signup_method: SignupMethod
    device_type: DeviceType


class ProductViewedEvent(BaseEvent):
    event_type: str = Field(default="product_viewed")
    user_id: UUID
    session_id: UUID
    product_id: UUID
    product_name: str
    category: str
    price_at_view: Decimal = Field(ge=0, max_digits=10, decimal_places=2)
    stock_quantity_at_view: int = Field(ge=0)


class OrderCreatedEvent(BaseEvent):
    event_type: str = Field(default="order_created")
    order_id: UUID
    user_id: UUID
    product_id: UUID
    quantity: int = Field(gt=0)
    unit_price: Decimal = Field(ge=0)
    total_amount: Decimal = Field(ge=0)
    currency: str = Field(default="INR", min_length=3, max_length=3)
    shipping_city: str
    shipping_state: str


class PaymentCompletedEvent(BaseEvent):
    event_type: str = Field(default="payment_completed")
    payment_id: UUID
    order_id: UUID
    user_id: UUID
    product_id: UUID
    amount: Decimal = Field(ge=0)
    currency: str = Field(default="INR", min_length=3, max_length=3)
    payment_mode: PaymentMode
    payment_status: PaymentStatus
    payment_provider: PaymentProvider


class ContinuousGenerationRequest(BaseModel):
    events_per_second: int = Field(default=1, ge=1, le=1000)
