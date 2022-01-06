# How to rename tables and columns after CSV import

## Rename columns

If sqliteviz parses CSV without `Use first row as column headers` option then
it will name the columns like `col1`, `col2` etc. You can easily rename the
columns after import with `ALTER TABLE` statements like this:

```sql
ALTER TABLE your_table_name
RENAME COLUMN current_column_name TO new_column_name;
```

### Column rename example

There is a table `dots` with columns `col1`, `col2`, `col3`. Here are the steps
to rename the columns to `x`, `y` and `z` respectively:

- Click `Create` in the top toolbar
- In the opened query editor write a script

```sql
ALTER TABLE dots
RENAME COLUMN col1 TO x;

ALTER TABLE dots
RENAME COLUMN col2 TO y;

ALTER TABLE dots
RENAME COLUMN col3 TO z;
```

- Click ![](./img/run.svg) to run the script


## Rename table

```sql
ALTER TABLE current_table_name
RENAME TO new_table_name;
```

### Table rename example

There is a table `dots`. Here are the steps to rename it to `point`:

- Click `Create` in the top toolbar
- In the opened query editor write a script

```sql
ALTER TABLE dots RENAME TO point
```

- Click ![](./img/run.svg) to run the script
