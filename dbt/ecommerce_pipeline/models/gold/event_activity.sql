WITH all_events AS (

    SELECT
        event_timestamp,
        event_type,
        user_id
    FROM {{ ref('users') }}

    UNION ALL

    SELECT
        event_timestamp,
        event_type,
        user_id
    FROM {{ ref('product_views') }}

    UNION ALL

    SELECT
        event_timestamp,
        event_type,
        user_id
    FROM {{ ref('orders') }}

    UNION ALL

    SELECT
        event_timestamp,
        event_type,
        user_id
    FROM {{ ref('payments') }}

),

windowed_events AS (

    SELECT
        window(event_timestamp, '5 minutes') AS event_window,
        event_type,
        user_id

    FROM all_events

),

activity_metrics AS (

    SELECT
        event_window.start AS window_start,
        event_window.end AS window_end,
        event_type,

        COUNT(*) AS event_count,

        COUNT(DISTINCT user_id) AS unique_users

    FROM windowed_events

    GROUP BY
        event_window,
        event_type

)

SELECT
    window_start,
    window_end,
    event_type,
    event_count,
    unique_users,

    CASE
        WHEN unique_users > 0
        THEN event_count / unique_users
        ELSE 0
    END AS events_per_active_user

FROM activity_metrics