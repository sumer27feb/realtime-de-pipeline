from pathlib import Path
from decimal import Decimal

import pandas as pd

RUN_DIR = Path("../exports/producer_runs/run_20260618_212337")
PRODUCTS_FILE = Path("../producer/data/products.json")


def read_csv(name: str) -> pd.DataFrame:
    path = RUN_DIR / name

    if not path.exists():
        raise FileNotFoundError(f"Missing file: {path}")

    return pd.read_csv(path)


def add_error(errors: list[str], message: str):
    errors.append(message)


def validate_required_columns(
    df: pd.DataFrame, required: list[str], name: str, errors: list[str]
):
    missing = [col for col in required if col not in df.columns]

    if missing:
        add_error(errors, f"{name}: missing columns {missing}")


def validate_no_duplicates(df: pd.DataFrame, column: str, name: str, errors: list[str]):
    if column in df.columns:
        duplicated = df[df[column].duplicated()][column].tolist()

        if duplicated:
            add_error(
                errors, f"{name}: duplicate {column} values found: {duplicated[:5]}"
            )


def validate_allowed_values(
    df: pd.DataFrame,
    column: str,
    allowed: set[str],
    name: str,
    errors: list[str],
):
    if column not in df.columns:
        return

    invalid = set(df[column].dropna()) - allowed

    if invalid:
        add_error(errors, f"{name}: invalid {column} values: {invalid}")


def validate_run():
    errors: list[str] = []

    users = read_csv("users.csv")
    views = read_csv("product_views.csv")
    orders = read_csv("orders.csv")
    payments = read_csv("payments.csv")

    required_users = [
        "event_id",
        "event_type",
        "event_timestamp",
        "user_id",
        "username",
        "email",
        "phone",
        "signup_method",
        "device_type",
    ]

    required_views = [
        "event_id",
        "event_type",
        "event_timestamp",
        "user_id",
        "session_id",
        "product_id",
        "product_name",
        "category",
        "price_at_view",
        "stock_quantity_at_view",
    ]

    required_orders = [
        "event_id",
        "event_type",
        "event_timestamp",
        "order_id",
        "user_id",
        "product_id",
        "quantity",
        "unit_price",
        "total_amount",
        "currency",
        "shipping_city",
        "shipping_state",
    ]

    required_payments = [
        "event_id",
        "event_type",
        "event_timestamp",
        "payment_id",
        "order_id",
        "user_id",
        "product_id",
        "amount",
        "currency",
        "payment_mode",
        "payment_status",
        "payment_provider",
    ]

    validate_required_columns(users, required_users, "users.csv", errors)
    validate_required_columns(views, required_views, "product_views.csv", errors)
    validate_required_columns(orders, required_orders, "orders.csv", errors)
    validate_required_columns(payments, required_payments, "payments.csv", errors)

    validate_no_duplicates(users, "event_id", "users.csv", errors)
    validate_no_duplicates(views, "event_id", "product_views.csv", errors)
    validate_no_duplicates(orders, "event_id", "orders.csv", errors)
    validate_no_duplicates(payments, "event_id", "payments.csv", errors)

    validate_no_duplicates(users, "user_id", "users.csv", errors)
    validate_no_duplicates(orders, "order_id", "orders.csv", errors)
    validate_no_duplicates(payments, "payment_id", "payments.csv", errors)

    validate_allowed_values(
        users,
        "signup_method",
        {"email", "google", "phone"},
        "users.csv",
        errors,
    )

    validate_allowed_values(
        users,
        "device_type",
        {"android", "ios", "web"},
        "users.csv",
        errors,
    )

    validate_allowed_values(
        payments,
        "payment_mode",
        {"upi", "card", "net_banking", "wallet", "cod"},
        "payments.csv",
        errors,
    )

    validate_allowed_values(
        payments,
        "payment_status",
        {"success", "failed", "pending"},
        "payments.csv",
        errors,
    )

    validate_allowed_values(
        payments,
        "payment_provider",
        {"razorpay", "phonepe", "paytm", "stripe"},
        "payments.csv",
        errors,
    )

    user_ids = set(users["user_id"])

    invalid_view_users = set(views["user_id"]) - user_ids
    if invalid_view_users:
        add_error(
            errors,
            f"product_views.csv: user_ids not found in users.csv: {list(invalid_view_users)[:5]}",
        )

    invalid_order_users = set(orders["user_id"]) - user_ids
    if invalid_order_users:
        add_error(
            errors,
            f"orders.csv: user_ids not found in users.csv: {list(invalid_order_users)[:5]}",
        )

    order_ids = set(orders["order_id"])

    invalid_payment_orders = set(payments["order_id"]) - order_ids
    if invalid_payment_orders:
        add_error(
            errors,
            f"payments.csv: order_ids not found in orders.csv: {list(invalid_payment_orders)[:5]}",
        )

    views["event_timestamp"] = pd.to_datetime(views["event_timestamp"], utc=True)
    orders["event_timestamp"] = pd.to_datetime(orders["event_timestamp"], utc=True)
    payments["event_timestamp"] = pd.to_datetime(payments["event_timestamp"], utc=True)

    views["price_at_view"] = views["price_at_view"].astype(float)
    orders["quantity"] = orders["quantity"].astype(int)
    orders["unit_price"] = orders["unit_price"].astype(float)
    orders["total_amount"] = orders["total_amount"].astype(float)
    payments["amount"] = payments["amount"].astype(float)

    bad_quantities = orders[orders["quantity"] <= 0]
    if not bad_quantities.empty:
        add_error(
            errors,
            f"orders.csv: found orders with quantity <= 0: {len(bad_quantities)}",
        )

    bad_amounts = orders[orders["total_amount"] < 0]
    if not bad_amounts.empty:
        add_error(
            errors, f"orders.csv: found negative total_amount rows: {len(bad_amounts)}"
        )

    orders["expected_total"] = orders["quantity"] * orders["unit_price"]
    mismatched_totals = orders[
        (orders["expected_total"] - orders["total_amount"]).abs() > 0.01
    ]

    if not mismatched_totals.empty:
        add_error(
            errors, f"orders.csv: total_amount mismatch rows: {len(mismatched_totals)}"
        )

    order_lookup = orders.set_index("order_id")

    for _, payment in payments.iterrows():
        order_id = payment["order_id"]

        if order_id not in order_lookup.index:
            continue

        order = order_lookup.loc[order_id]

        if payment["user_id"] != order["user_id"]:
            add_error(errors, f"payments.csv: user_id mismatch for order_id {order_id}")

        if payment["product_id"] != order["product_id"]:
            add_error(
                errors, f"payments.csv: product_id mismatch for order_id {order_id}"
            )

        if abs(payment["amount"] - order["total_amount"]) > 0.01:
            add_error(errors, f"payments.csv: amount mismatch for order_id {order_id}")

        if payment["event_timestamp"] < order["event_timestamp"]:
            add_error(
                errors, f"payments.csv: payment before order for order_id {order_id}"
            )

    view_pairs = set(zip(views["user_id"], views["product_id"]))

    for _, order in orders.iterrows():
        pair = (order["user_id"], order["product_id"])

        if pair not in view_pairs:
            add_error(
                errors,
                f"orders.csv: order created without prior product view for user_id={order['user_id']} product_id={order['product_id']}",
            )

    payment_counts = payments.groupby("order_id").size()

    duplicate_payment_orders = payment_counts[payment_counts > 1]

    if not duplicate_payment_orders.empty:
        for order_id in duplicate_payment_orders.index[:5]:
            order_payments = payments[payments["order_id"] == order_id].sort_values(
                "event_timestamp"
            )
            statuses = order_payments["payment_status"].tolist()

            if any(status != "pending" for status in statuses[:-1]):
                add_error(
                    errors,
                    f"payments.csv: order_id {order_id} has multiple payments but non-final payment is not pending: {statuses}",
                )

    metrics = {
        "users": len(users),
        "product_views": len(views),
        "orders": len(orders),
        "payments": len(payments),
        "unique_users_with_views": views["user_id"].nunique(),
        "unique_users_with_orders": orders["user_id"].nunique(),
        "view_to_order_rate": round(len(orders) / len(views), 4) if len(views) else 0,
        "payment_to_order_rate": (
            round(len(payments) / len(orders), 4) if len(orders) else 0
        ),
        "payment_status_distribution": payments["payment_status"]
        .value_counts()
        .to_dict(),
        "payment_mode_distribution": payments["payment_mode"].value_counts().to_dict(),
        "top_products_viewed": views["product_name"].value_counts().head(10).to_dict(),
        "top_products_ordered": orders["product_id"].value_counts().head(10).to_dict(),
        "revenue_from_successful_payments": float(
            payments[payments["payment_status"] == "success"]["amount"].sum()
        ),
    }

    print("\n===== PRODUCER RUN METRICS =====")
    for key, value in metrics.items():
        print(f"{key}: {value}")

    print("\n===== VALIDATION RESULT =====")
    if errors:
        print("FAILED")
        for error in errors:
            print(f"- {error}")
    else:
        print("PASSED")


if __name__ == "__main__":
    validate_run()
