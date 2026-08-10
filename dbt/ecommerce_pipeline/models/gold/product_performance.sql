WITH product_view_metrics AS (

    SELECT
        product_id,
        product_name,
        category,

        COUNT(*) AS views,

        COUNT(DISTINCT user_id) AS unique_viewers

    FROM {{ ref('product_views') }}

    GROUP BY
        product_id,
        product_name,
        category

),

product_order_metrics AS (

    SELECT
        product_id,

        COUNT(DISTINCT order_id) AS orders,

        SUM(quantity) AS units_sold,

        SUM(total_amount) AS order_value

    FROM {{ ref('orders') }}

    GROUP BY
        product_id

),

product_payment_metrics AS (

    SELECT
        product_id,

        SUM(
            CASE
                WHEN payment_status = 'success'
                THEN amount
                ELSE 0
            END
        ) AS successful_revenue

    FROM {{ ref('payments') }}

    GROUP BY
        product_id

),

product_performance AS (

    SELECT
        view_metrics.product_id,
        view_metrics.product_name,
        view_metrics.category,

        view_metrics.views,
        view_metrics.unique_viewers,

        COALESCE(
            order_metrics.orders,
            0
        ) AS orders,

        COALESCE(
            order_metrics.units_sold,
            0
        ) AS units_sold,

        COALESCE(
            order_metrics.order_value,
            0
        ) AS order_value,

        COALESCE(
            payment_metrics.successful_revenue,
            0
        ) AS successful_revenue

    FROM product_view_metrics AS view_metrics

    LEFT JOIN product_order_metrics AS order_metrics
        ON view_metrics.product_id = order_metrics.product_id

    LEFT JOIN product_payment_metrics AS payment_metrics
        ON view_metrics.product_id = payment_metrics.product_id

)

SELECT
    product_id,
    product_name,
    category,

    views,
    unique_viewers,
    orders,
    units_sold,
    order_value,
    successful_revenue,

    CASE
        WHEN views > 0
        THEN orders / views
        ELSE 0
    END AS conversion_rate

FROM product_performance