SELECT 1 FROM a.b;
WITH CTE AS (
SELECT * FROM a cross join b)
select * from cte