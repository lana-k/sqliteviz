WITH one_time_pid_condition AS (
    SELECT stat_pid
    FROM record
    GROUP BY 1
    ORDER BY SUM(stat_rss) DESC
    LIMIT 2
)
SELECT
    ts,
    stat_pid pid,
    stat_rss / 1024.0 / 1024 * (SELECT value FROM meta WHERE key = 'page_size') value
FROM record
JOIN one_time_pid_condition USING(stat_pid)
