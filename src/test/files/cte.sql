SELECT
    1
FROM
    a.b;
WITH
    CTE
    AS
    (
        SELECT
            *
        FROM
            a CROSS JOIN b
    )
SELECT
    *
FROM
    cte
