DEFAULT_CURRENCY = "INR"

MIN_ORDER_QUANTITY = 1
MAX_ORDER_QUANTITY = 5

PRODUCTS_FILE = "producer/data/products.json"
SHIPPING_LOCATIONS_FILE = "producer/data/shipping_locations.json"

KAFKA_BOOTSTRAP_SERVERS = "localhost:9092"

KAFKA_TOPIC_MAP = {
    "user_created": "ecommerce.user.created",
    "product_viewed": "ecommerce.product.viewed",
    "order_created": "ecommerce.order.created",
    "payment_completed": "ecommerce.payment.completed",
}

KAFKA_PRODUCER_CONFIG = {
    "bootstrap.servers": KAFKA_BOOTSTRAP_SERVERS,
    # Reliability
    "acks": "all",
    "enable.idempotence": True,
    "retries": 5,
    # Performance
    "linger.ms": 10,
    "batch.num.messages": 1000,
    "compression.type": "snappy",
    # Safety
    "message.timeout.ms": 30000,
}
