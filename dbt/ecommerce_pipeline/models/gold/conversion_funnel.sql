WITH user_metrics AS (

    SELECT
        COUNT(DISTINCT user_id) AS total_users

    FROM {{ ref('users') }}

),

view_metrics AS (

    SELECT
        COUNT(*) AS total_product_views

    FROM {{ ref('product_views') }}

),

order_metrics AS (

    SELECT
        COUNT(DISTINCT order_id) AS total_orders

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
        ) AS successful_payments

    FROM {{ ref('payments') }}

),

funnel_metrics AS (

    SELECT
        user_metrics.total_users,
        view_metrics.total_product_views,
        order_metrics.total_orders,
        payment_metrics.total_payment_attempts,
        payment_metrics.successful_payments

    FROM user_metrics

    CROSS JOIN view_metrics
    CROSS JOIN order_metrics
    CROSS JOIN payment_metrics

)

SELECT
    total_users,
    total_product_views,
    total_orders,
    total_payment_attempts,
    successful_payments,

    CASE
        WHEN total_users > 0
        THEN total_product_views / total_users
        ELSE 0
    END AS views_per_user,

    CASE
        WHEN total_product_views > 0
        THEN total_orders / total_product_views
        ELSE 0
    END AS view_to_order_rate,

    CASE
        WHEN total_orders > 0
        THEN total_payment_attempts / total_orders
        ELSE 0
    END AS payment_attempts_per_order,

    CASE
        WHEN total_payment_attempts > 0
        THEN successful_payments / total_payment_attempts
        ELSE 0
    END AS payment_success_rate,

    CASE
        WHEN total_product_views > 0
        THEN successful_payments / total_product_views
        ELSE 0
    END AS view_to_successful_payment_rate

FROM funnel_metrics