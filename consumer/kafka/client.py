from confluent_kafka import Consumer

from consumer.config import KAFKA_CONSUMER_CONFIG, KAFKA_TOPICS


def create_kafka_consumer() -> Consumer:
    consumer = Consumer(KAFKA_CONSUMER_CONFIG)

    consumer.subscribe(KAFKA_TOPICS)

    return consumer