WITH bronze_orders AS (

    SELECT
        event_id,
        event_type,
        event_timestamp,
        order_id,
        user_id,
        product_id,
        quantity,
        unit_price,
        total_amount,
        currency,
        shipping_city,
        shipping_state
    FROM {{ source('bronze', 'orders') }}

),

silver_orders AS (

    SELECT
        event_id,
        event_type,
        event_timestamp,

        order_id,
        user_id,
        product_id,

        quantity,
        unit_price,
        total_amount,

        UPPER(TRIM(currency)) AS currency,

        TRIM(shipping_city) AS shipping_city,

        TRIM(shipping_state) AS shipping_state

    FROM bronze_orders

)

SELECT
    event_id,
    event_type,
    event_timestamp,
    order_id,
    user_id,
    product_id,
    quantity,
    unit_price,
    total_amount,
    currency,
    shipping_city,
    shipping_state
FROM silver_orders