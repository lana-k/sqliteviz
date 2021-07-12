import chai from 'chai'
import database from '@/lib/database'

const expect = chai.expect

describe('SQLite extensions', function () {
  let db

  beforeEach(() => {
    db = database.getNewDatabase()
  })

  afterEach(() => {
    db.shutDown()
  })

  it('supports contrib trigonometric functions', async function () {
    const actual = await db.execute(`
      SELECT
        abs(3.1415926 - pi())       < 0.000001,
        abs(1 - cos(2 * pi()))      < 0.000001,
        abs(0 - sin(pi()))          < 0.000001,
        abs(0 - tan(0))             < 0.000001,
        abs(0 - cot(pi() / 2))      < 0.000001,
        abs(1 - acos(cos(1)))       < 0.000001,
        abs(1 - asin(sin(1)))       < 0.000001,
        abs(1 - atan(tan(1)))       < 0.000001,
        abs(1 - cosh(0))            < 0.000001,
        abs(0 - sinh(0))            < 0.000001,
        abs(tanh(1) + tanh(-1))     < 0.000001,
        abs(coth(1) + coth(-1))     < 0.000001,
        abs(1 - acosh(cosh(1)))     < 0.000001,
        abs(1 - asinh(sinh(1)))     < 0.000001,
        abs(1 - atanh(tanh(1)))     < 0.000001,
        abs(180 - degrees(pi()))    < 0.000001,
        abs(pi() - radians(180))    < 0.000001,
        abs(pi() / 2 - atan2(1, 0)) < 0.000001
    `)
    expect(actual.values).to.eql([[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]])
  })

  it('supports contrib math functions', async function () {
    const actual = await db.execute(`
      SELECT
        exp(0),
        log(exp(1)),
        log10(10000),
        power(2, 3),
        sign(-10) + sign(20),
        sqrt(square(16)),
        ceil(-1.95) + ceil(1.95),
        floor(-1.95) + floor(1.95)
    `)
    expect(actual.values).to.eql([[1, 1, 4, 8, 0, 16, 1, -1]])
  })

  it('supports contrib string functions', async function () {
    const actual = await db.execute(`
      SELECT
        replicate('ab', 4),
        charindex('ab', 'foobarabbarfoo'),
        charindex('ab', 'foobarabbarfoo', 8),
        leftstr('foobar', 2),
        rightstr('foobar', 2),
        reverse('foobar'),
        proper('fooBar'),
        padl('foo', 5),
        padr('foo', 5),
        padc('foo', 5),
        strfilter('abcba', 'bc')
    `)
    expect(actual.values).to.eql([
      ['abababab', 7, 0, 'fo', 'ar', 'raboof', 'Foobar', '  foo', 'foo  ', ' foo ', 'bcb']
    ])
  })

  it('supports contrib aggregate functions', async function () {
    const actual = await db.execute(`
      WITH RECURSIVE series(x) AS (
          SELECT 1
        UNION ALL
          SELECT x + 1
          FROM series
          WHERE x + 1 <= 12
      )
      SELECT
        abs( 3.77406806 - stdev(x))    < 0.000001,
        abs(14.24358974 - variance(x)) < 0.000001,
        mode(x),
        median(x),
        lower_quartile(x),
        upper_quartile(x)
      FROM (
        SELECT x
        FROM series
        UNION ALL
        VALUES (1)
      )
    `)
    expect(actual.values).to.eql([[1, 1, 1, 6, 3, 9]])
  })

  it('supports generate_series', async function () {
    const actual = await db.execute(`
      SELECT value
      FROM generate_series(5, 20, 5)
    `)
    expect(actual.values).to.eql([[5], [10], [15], [20]])
  })

  it('supports transitive_closure', async function () {
    const actual = await db.execute(`
      CREATE TABLE node(
      node_id   INTEGER NOT NULL PRIMARY KEY,
      parent_id INTEGER,
      name      VARCHAR(127),
      FOREIGN KEY (parent_id) REFERENCES node(node_id)
    );
    CREATE INDEX node_parent_id_idx ON node(parent_id);

    CREATE VIRTUAL TABLE node_closure USING transitive_closure(
        tablename    = "node",
        idcolumn     = "node_id",
        parentcolumn = "parent_id"
      );

    INSERT INTO node VALUES
      (1,  NULL, 'tests'),
      (2,  1,    'lib'),
      (3,  2,    'database'),
      (4,  2,    'utils'),
      (5,  2,    'storedQueries.spec.js'),
      (6,  3,    '_sql.spec.js'),
      (7,  3,    '_statements.spec.js'),
      (8,  3,    'database.spec.js'),
      (9,  3,    'sqliteExtensions.spec.js'),
      (10, 4,    'fileIo.spec.js'),
      (11, 4,    'time.spec.js');

      SELECT name
      FROM node
      WHERE node_id IN (
        SELECT nc.id
        FROM node_closure AS nc
        WHERE nc.root = 2 AND nc.depth = 2
      );
    `)
    expect(actual.values).to.eql([
      ['_sql.spec.js'],
      ['_statements.spec.js'],
      ['database.spec.js'],
      ['sqliteExtensions.spec.js'],
      ['fileIo.spec.js'],
      ['time.spec.js']
    ])
  })

  it('supports UUID functions', async function () {
    const actual = await db.execute(`
      SELECT
        length(uuid()),
        uuid_str(uuid_blob('26a8349c8a7f4cbeb519bf792c3d7ac6'))
    `)
    expect(actual.values).to.eql([[36, '26a8349c-8a7f-4cbe-b519-bf792c3d7ac6']])
  })

  it('supports regexp', async function () {
    const actual = await db.execute(`
      SELECT
        regexp('=\\s?\\d+',  'const foo = 123; const bar = "bar"'),
        regexpi('=\\s?\\d+', 'const foo = 123; const bar = "bar"'),
        'const foo = 123; const bar = "bar"' REGEXP '=\\s?\\d+'
    `)
    expect(actual.values).to.eql([[1, 1, 1]])
  })

  it('supports pivot virtual table', async function () {
    const actual = await db.execute(`
      CREATE TABLE point(x REAL, y REAL, z REAL);
      INSERT INTO point VALUES
        (5,3,3.2),  (5,6,4.3),  (5,9,5.4),
        (10,3,4),   (10,6,3.8), (10,9,3.6),
        (15,3,4.8), (15,6,4),   (15,9,3.5);

      CREATE VIRTUAL TABLE pivot USING pivot_vtab(
        (SELECT y FROM point GROUP BY y),
        (SELECT x, x FROM point GROUP BY x),
        (SELECT z FROM point WHERE y = :y AND x = :x)
      );

      CREATE TEMPORARY TABLE surface AS
      SELECT xt.x, p.*
      FROM (
        SELECT row_number() OVER () rownum, *
        FROM pivot
      ) p
      JOIN (
        SELECT row_number() OVER () rownum, x
        FROM point
        GROUP BY x
      ) xt USING(rownum);
      ALTER TABLE surface DROP COLUMN rownum;
      SELECT * FROM surface;
    `)
    expect(actual.columns).to.eql(['x', 'y', '5.0', '10.0', '15.0'])
    expect(actual.values).to.eql([
      [5, 3, 3.2, 4, 4.8],
      [10, 6, 4.3, 3.8, 4],
      [15, 9, 5.4, 3.6, 3.5]
    ])
  })

  it('supports FTS5', async function () {
    const actual = await db.execute(`
      CREATE VIRTUAL TABLE email USING fts5(sender, title, body, tokenize = 'porter ascii');

      INSERT INTO email VALUES
        (
          'foo@localhost',
          'fts3/4',
          'FTS3 and FTS4 are SQLite virtual table modules that allows users to perform '
          || 'full-text searches on a set of documents.'
        ),
        (
          'bar@localhost',
          'fts4',
          'FTS5 is an SQLite virtual table module that provides full-text search '
          || 'functionality to database applications.'
        );

      SELECT sender
      FROM email
      WHERE body MATCH '"full-text" NOT document'
      ORDER BY rank;
    `)
    expect(actual.values).to.eql([['bar@localhost']])
  })
})
