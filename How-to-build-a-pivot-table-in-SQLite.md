# How to build a pivot table in SQLite

This how-to explores how to build pivot tables in SQLite, which doesn't have a
special constructs like `PIVOT` or `CROSSTAB` in its SQL dialect.

## Static-column pivot table

If the columns of a pivot table are known beforehand, it's possible to write a
standard, say SQL-92, query that would produce a pivot table in its result set.
This example uses World Bank [country indicators][1]. This query calculates
average fertility and life expectancy for a few country groups.

```sql
SELECT
  "Country Name",
  AVG(IIF(
    FLOOR(year / 10) = 196 AND "Indicator Name" LIKE 'Fertility rate%',
    value,
    NULL
  )) AS "FR 196x",
  AVG(IIF(
    FLOOR(year / 10) = 196 AND "Indicator Name" LIKE 'Life expectancy%',
    value,
    NULL
  )) AS "LE 196x",
  AVG(IIF(
    FLOOR(year / 10) = 197 AND "Indicator Name" LIKE 'Fertility rate%',
    value,
    NULL
  )) AS "FR 197x",
  AVG(IIF(
    FLOOR(year / 10) = 197 AND "Indicator Name" LIKE 'Life expectancy%',
    value,
    NULL
  )) AS "LE 197x",
  AVG(IIF(
    FLOOR(year / 10) = 198 AND "Indicator Name" LIKE 'Fertility rate%',
    value,
    NULL
  )) AS "FR 198x",
  AVG(IIF(
    FLOOR(year / 10) = 198 AND "Indicator Name" LIKE 'Life expectancy%',
    value,
    NULL
  )) AS "LE 198x",
  AVG(IIF(
    FLOOR(year / 10) = 199 AND "Indicator Name" LIKE 'Fertility rate%',
    value,
    NULL
  )) AS "FR 199x",
  AVG(IIF(
    FLOOR(year / 10) = 199 AND "Indicator Name" LIKE 'Life expectancy%',
    value,
    NULL
  )) AS "LE 199x",
  AVG(IIF(
    FLOOR(year / 10) = 200 AND "Indicator Name" LIKE 'Fertility rate%',
    value,
    NULL
  )) AS "FR 200x",
  AVG(IIF(
    FLOOR(year / 10) = 200 AND "Indicator Name" LIKE 'Life expectancy%',
    value,
    NULL
  )) AS "LE 200x"
FROM country_indicators
WHERE "Country Name" IN(
  'Arab World',
  'Central Europe and the Baltics',
  'East Asia & Pacific',
  'European Union',
  'Latin America & Caribbean',
  'High income',
  'Middle income',
  'Low income'
)
GROUP BY 1
ORDER BY
  CASE "Country Name"
    WHEN 'High income' THEN 1
    WHEN 'Middle income' THEN 2
    WHEN 'Low income' THEN 3
    WHEN 'European Union' THEN 4
    WHEN 'Central Europe and the Baltics' THEN 5
    WHEN 'East Asia & Pacific' THEN 6
    WHEN 'Latin America & Caribbean' THEN 7
    WHEN 'Arab World' THEN 8
    ELSE 99
  END
```

## Dynamic-column pivot table

SQLite in sqliteviz is built with [pivot_vtab][2] extension. The same result set
can be produced with this, arguably simpler and more maintainable, query.

```sql
CREATE VIRTUAL TABLE temp.pivot USING pivot_vtab(
  (
    WITH t(country_name) AS (VALUES
      ('High income'),
      ('Middle income'),
      ('Low income'),
      ('European Union'),
      ('Central Europe and the Baltics'),
      ('East Asia & Pacific'),
      ('Latin America & Caribbean'),
      ('Arab World')
    )
    SELECT country_name FROM t
  ),
  (
    SELECT
      FLOOR(year / 10) || '|' || "Indicator Name" column_key,
      CASE
        WHEN "Indicator Name" LIKE 'Fertility rate%' THEN 'FR'
        WHEN "Indicator Name" LIKE 'Life expectancy%' THEN 'LE'
      END || ' ' || FLOOR(year / 10) || 'x' column_name
    FROM country_indicators
    WHERE
      "Indicator Name" LIKE 'Fertility rate%'
      OR "Indicator Name" LIKE 'Life expectancy%'
    GROUP BY 1
  ),
  (
    SELECT AVG(value)
    FROM country_indicators
    WHERE
      "Country Name" = :country_name
      AND FLOOR(year / 10) || '|' || "Indicator Name" = :column_key
  )
);
SELECT * FROM pivot
```

[1]: https://github.com/plotly/datasets/blob/master/country_indicators.csv
[2]: https://github.com/jakethaw/pivot_vtab
