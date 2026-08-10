WITH bronze_users AS (

    SELECT
        event_id,
        event_type,
        event_timestamp,
        user_id,
        username,
        email,
        phone,
        signup_method,
        device_type
    FROM {{ source('bronze', 'users') }}

),

silver_users AS (

    SELECT
        event_id,
        event_type,
        event_timestamp,

        user_id,

        TRIM(username) AS username,

        LOWER(TRIM(email)) AS email,

        TRIM(phone) AS phone,

        LOWER(TRIM(signup_method)) AS signup_method,

        LOWER(TRIM(device_type)) AS device_type

    FROM bronze_users

)

SELECT
    event_id,
    event_type,
    event_timestamp,
    user_id,
    username,
    email,
    phone,
    signup_method,
    device_type
FROM silver_users