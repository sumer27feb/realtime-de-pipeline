from fastapi import APIRouter, HTTPException

from api.database import fetch_all
from api.schemas import (
    EcommerceOverview,
    EventActivity,
    ConversionFunnel,
    PaymentPerformance,
    ProductPerformance,
)

router = APIRouter(
    prefix="/api/metrics",
    tags=["metrics"],
)


# --------------------------------------------------
# 1. Ecommerce Overview
# --------------------------------------------------


@router.get(
    "/overview",
    response_model=EcommerceOverview,
)
def get_overview():

    query = """
        SELECT *
        FROM workspace.gold.ecommerce_overview
    """

    rows = fetch_all(query)

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="No overview metrics available",
        )

    return rows[0]


# --------------------------------------------------
# 2. Product Performance
# --------------------------------------------------


@router.get(
    "/products",
    response_model=list[ProductPerformance],
)
def get_product_performance():

    query = """
        SELECT *
        FROM workspace.gold.product_performance
        ORDER BY successful_revenue DESC
    """

    rows = fetch_all(query)

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="No product performance metrics available",
        )

    return rows


# --------------------------------------------------
# 3. Payment Performance
# --------------------------------------------------


@router.get(
    "/payments",
    response_model=list[PaymentPerformance],
)
def get_payment_performance():

    query = """
        SELECT *
        FROM workspace.gold.payment_performance
        ORDER BY total_attempts DESC
    """

    rows = fetch_all(query)

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="No payment performance metrics available",
        )

    return rows


# --------------------------------------------------
# 4. Conversion Funnel
# --------------------------------------------------


@router.get(
    "/conversion",
    response_model=ConversionFunnel,
)
def get_conversion_funnel():

    query = """
        SELECT *
        FROM workspace.gold.conversion_funnel
    """

    rows = fetch_all(query)

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="No conversion funnel metrics available",
        )

    return rows[0]


# --------------------------------------------------
# 5. Event Activity
# --------------------------------------------------


@router.get(
    "/activity",
    response_model=list[EventActivity],
)
def get_event_activity():

    query = """
        SELECT *
        FROM workspace.gold.event_activity
        ORDER BY window_start, event_type
    """

    rows = fetch_all(query)

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="No event activity metrics available",
        )

    return rows
