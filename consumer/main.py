"""
Application entry point for the Kafka Consumer.
"""

from consumer.consumer_service import run_consumer


def main() -> None:
    """
    Starts the Kafka → Bronze ingestion pipeline.
    """

    run_consumer()


if __name__ == "__main__":
    main()
