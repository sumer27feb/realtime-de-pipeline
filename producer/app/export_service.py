import csv
import json
from datetime import datetime
from pathlib import Path
from typing import Any

from producer.app import state

EXPORT_BASE_DIR = Path("exports") / "producer_runs"


def event_to_dict(event: Any) -> dict[str, Any]:
    """
    Converts Pydantic model to JSON-safe dictionary.
    Works for Pydantic v2.
    """
    if hasattr(event, "model_dump"):
        return event.model_dump(mode="json")

    # fallback for Pydantic v1
    return event.dict()


def write_csv(file_path: Path, events: list[Any]) -> None:
    if not events:
        file_path.write_text("", encoding="utf-8")
        return

    rows = [event_to_dict(event) for event in events]

    with open(file_path, "w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(
            file,
            fieldnames=rows[0].keys(),
        )

        writer.writeheader()
        writer.writerows(rows)


def export_state_to_csv() -> dict[str, Any]:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    run_dir = EXPORT_BASE_DIR / f"run_{timestamp}"
    run_dir.mkdir(parents=True, exist_ok=True)

    files = {
        "users": run_dir / "users.csv",
        "product_views": run_dir / "product_views.csv",
        "orders": run_dir / "orders.csv",
        "payments": run_dir / "payments.csv",
    }

    write_csv(files["users"], state.users)
    write_csv(files["product_views"], state.product_views)
    write_csv(files["orders"], state.orders)
    write_csv(files["payments"], state.payments)

    summary = {
        "exported_at": datetime.now().isoformat(),
        "users": len(state.users),
        "product_views": len(state.product_views),
        "orders": len(state.orders),
        "open_orders": len(state.open_orders),
        "payments": len(state.payments),
        "total_available_stock": sum(state.product_stock.values()),
        "files": {name: str(path) for name, path in files.items()},
    }

    summary_file = run_dir / "summary.json"

    with open(summary_file, "w", encoding="utf-8") as file:
        json.dump(summary, file, indent=2)

    return {
        "message": "State exported successfully",
        "export_dir": str(run_dir),
        "summary_file": str(summary_file),
        **summary,
    }
