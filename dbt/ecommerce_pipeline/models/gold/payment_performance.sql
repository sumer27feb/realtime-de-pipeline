WITH payment_metrics AS (

    SELECT
        payment_mode,
        payment_provider,

        COUNT(DISTINCT payment_id) AS total_attempts,

        COUNT(
            DISTINCT CASE
                WHEN payment_status = 'success'
                THEN payment_id
            END
        ) AS successful_attempts,

        COUNT(
            DISTINCT CASE
                WHEN payment_status = 'failed'
                THEN payment_id
            END
        ) AS failed_attempts,

        COUNT(
            DISTINCT CASE
                WHEN payment_status = 'pending'
                THEN payment_id
            END
        ) AS pending_attempts,

        SUM(amount) AS total_payment_amount,

        SUM(
            CASE
                WHEN payment_status = 'success'
                THEN amount
                ELSE 0
            END
        ) AS successful_payment_amount

    FROM {{ ref('payments') }}

    GROUP BY
        payment_mode,
        payment_provider

)

SELECT
    payment_mode,
    payment_provider,

    total_attempts,
    successful_attempts,
    failed_attempts,
    pending_attempts,

    total_payment_amount,
    successful_payment_amount,

    CASE
        WHEN total_attempts > 0
        THEN successful_attempts / total_attempts
        ELSE 0
    END AS success_rate,

    CASE
        WHEN total_attempts > 0
        THEN failed_attempts / total_attempts
        ELSE 0
    END AS failure_rate,

    CASE
        WHEN total_attempts > 0
        THEN pending_attempts / total_attempts
        ELSE 0
    END AS pending_rate

FROM payment_metrics