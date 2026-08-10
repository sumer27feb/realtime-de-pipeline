WITH user_metrics AS (

    SELECT
        COUNT(DISTINCT user_id) AS total_users
    FROM {{ ref('users') }}

),

view_metrics AS (

    SELECT
        COUNT(*) AS total_product_views,
        COUNT(DISTINCT user_id) AS unique_viewers
    FROM {{ ref('product_views') }}

),

order_metrics AS (

    SELECT
        COUNT(DISTINCT order_id) AS total_orders,
        SUM(total_amount) AS order_value
    FROM {{ ref('orders') }}

),

payment_metrics AS (

    SELECT
        COUNT(DISTINCT payment_id) AS total_payment_attempts,

        COUNT(
            DISTINCT CASE
                WHEN payment_status = 'success'
                THEN payment_id
            END
        ) AS successful_payments,

        SUM(
            CASE
                WHEN payment_status = 'success'
                THEN amount
                ELSE 0
            END
        ) AS successful_revenue

    FROM {{ ref('payments') }}

),

overview AS (

    SELECT
        user_metrics.total_users,

        view_metrics.total_product_views,
        view_metrics.unique_viewers,

        order_metrics.total_orders,
        order_metrics.order_value,

        payment_metrics.total_payment_attempts,
        payment_metrics.successful_payments,
        payment_metrics.successful_revenue

    FROM user_metrics

    CROSS JOIN view_metrics
    CROSS JOIN order_metrics
    CROSS JOIN payment_metrics

)

SELECT
    total_users,
    total_product_views,
    unique_viewers,
    total_orders,
    total_payment_attempts,
    successful_payments,
    order_value,
    successful_revenue,

    CASE
        WHEN total_orders > 0
        THEN order_value / total_orders
        ELSE 0
    END AS average_order_value,

    CASE
        WHEN total_product_views > 0
        THEN total_orders / total_product_views
        ELSE 0
    END AS view_to_order_rate,

    CASE
        WHEN total_payment_attempts > 0
        THEN successful_payments / total_payment_attempts
        ELSE 0
    END AS payment_success_rate

FROM overview