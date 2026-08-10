WITH bronze_product_views AS (

    SELECT
        event_id,
        event_type,
        event_timestamp,
        user_id,
        session_id,
        product_id,
        product_name,
        category,
        price_at_view,
        stock_quantity_at_view
    FROM {{ source('bronze', 'product_views') }}

),

silver_product_views AS (

    SELECT
        event_id,
        event_type,
        event_timestamp,

        user_id,
        session_id,
        product_id,

        TRIM(product_name) AS product_name,

        TRIM(category) AS category,

        price_at_view,

        stock_quantity_at_view

    FROM bronze_product_views

)

SELECT
    event_id,
    event_type,
    event_timestamp,
    user_id,
    session_id,
    product_id,
    product_name,
    category,
    price_at_view,
    stock_quantity_at_view
FROM silver_product_views