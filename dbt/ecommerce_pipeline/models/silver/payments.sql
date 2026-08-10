WITH bronze_payments AS (

    SELECT
        event_id,
        event_type,
        event_timestamp,
        payment_id,
        order_id,
        user_id,
        product_id,
        amount,
        currency,
        payment_mode,
        payment_status,
        payment_provider
    FROM {{ source('bronze', 'payments') }}

),

silver_payments AS (

    SELECT
        event_id,
        event_type,
        event_timestamp,

        payment_id,
        order_id,
        user_id,
        product_id,

        amount,

        UPPER(TRIM(currency)) AS currency,

        LOWER(TRIM(payment_mode)) AS payment_mode,

        LOWER(TRIM(payment_status)) AS payment_status,

        LOWER(TRIM(payment_provider)) AS payment_provider

    FROM bronze_payments

)

SELECT
    event_id,
    event_type,
    event_timestamp,
    payment_id,
    order_id,
    user_id,
    product_id,
    amount,
    currency,
    payment_mode,
    payment_status,
    payment_provider
FROM silver_payments