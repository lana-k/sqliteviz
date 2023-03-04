WITH diff_all AS (
    SELECT
        record_id,
        ts,
        stat_pid,
        stat_utime + stat_stime - LAG(stat_utime + stat_stime) OVER (
            PARTITION BY stat_pid
            ORDER BY record_id
        ) tick_diff,
        ts - LAG(ts) OVER (
            PARTITION BY stat_pid
            ORDER BY record_id
        ) ts_diff
    FROM record
), diff AS (
    SELECT * FROM diff_all WHERE tick_diff IS NOT NULL
), one_time_pid_condition AS (
    SELECT stat_pid
    FROM record
    GROUP BY 1
    ORDER BY SUM(stat_utime + stat_stime) DESC
    LIMIT 2
)
SELECT
    ts,
    stat_pid pid,
    100.0 * tick_diff / (SELECT value FROM meta WHERE key = 'clock_ticks') / ts_diff value
FROM diff
JOIN one_time_pid_condition USING(stat_pid)
