import { expect } from 'chai'
import initSqlJs from 'sql.js'
import db from '@/database.js'
const config = {
  locateFile: filename => 'js/sql-wasm.wasm'
}

describe('database.js', () => {
  it('creates schema', () => {
    return initSqlJs(config)
      .then(SQL => {
        const database = new SQL.Database()
        database.run(`
        CREATE TABLE test (
          col1,
          col2 integer,
          col3 decimal(5,2),
          col4 varchar(30)
        )
      `)

        const data = database.export()
        const buffer = new Blob([data])
        return db.loadDb(buffer)
      })
      .then(({ dbName, schema }) => {
        expect(schema).to.have.lengthOf(1)
        expect(schema[0].name).to.equal('test')
        expect(schema[0].columns[0].name).to.equal('col1')
        expect(schema[0].columns[0].type).to.equal('N/A')
        expect(schema[0].columns[1].name).to.equal('col2')
        expect(schema[0].columns[1].type).to.equal('integer')
        expect(schema[0].columns[2].name).to.equal('col3')
        expect(schema[0].columns[2].type).to.equal('decimal(5, 2)')
        expect(schema[0].columns[3].name).to.equal('col4')
        expect(schema[0].columns[3].type).to.equal('varchar(30)')
      })
  })

  it('creates schema with virtual table', () => {
    return initSqlJs(config)
      .then(SQL => {
        const database = new SQL.Database()
        database.run(`
        CREATE VIRTUAL TABLE test_virtual USING fts4(
          col1, col2, 
          notindexed=col1, notindexed=col2,
          tokenize=unicode61 "tokenchars=.+#")
      `)

        const data = database.export()
        const buffer = new Blob([data])
        return db.loadDb(buffer)
      })
      .then(({ dbName, schema }) => {
        expect(schema[0].name).to.equal('test_virtual')
        expect(schema[0].columns[0].name).to.equal('col1')
        expect(schema[0].columns[0].type).to.equal('N/A')
        expect(schema[0].columns[1].name).to.equal('col2')
        expect(schema[0].columns[1].type).to.equal('N/A')
      })
  })

  it('returns a query result', () => {
    return initSqlJs(config)
      .then(SQL => {
        const database = new SQL.Database()
        database.run(`
        CREATE TABLE test (
          id integer,
          name varchar(100),
          faculty varchar(100)
        );
        INSERT INTO test (id, name, faculty)
        VALUES
        ( 1, 'Harry Potter', 'Griffindor'),
        ( 2, 'Draco Malfoy', 'Slytherin');
      `)

        const data = database.export()
        const buffer = new Blob([data])
        return db.loadDb(buffer)
      })
      .then(({ dbName, schema }) => {
        return db.execute('SELECT * from test')
      })
      .then(result => {
        expect(result.columns).to.have.lengthOf(3)
        expect(result.columns[0]).to.equal('id')
        expect(result.columns[1]).to.equal('name')
        expect(result.columns[2]).to.equal('faculty')
        expect(result.values).to.have.lengthOf(2)
        expect(result.values[0][0]).to.equal(1)
        expect(result.values[0][1]).to.equal('Harry Potter')
        expect(result.values[0][2]).to.equal('Griffindor')
        expect(result.values[1][0]).to.equal(2)
        expect(result.values[1][1]).to.equal('Draco Malfoy')
        expect(result.values[1][2]).to.equal('Slytherin')
      })
  })

  it('returns an error', () => {
    return initSqlJs(config)
      .then(SQL => {
        const database = new SQL.Database()
        database.run(`
        CREATE TABLE test (
          id integer,
          name varchar(100),
          faculty varchar(100)
        );
        INSERT INTO test (id, name, faculty)
        VALUES
        ( 1, 'Harry Potter', 'Griffindor'),
        ( 2, 'Draco Malfoy', 'Slytherin');
      `)

        const data = database.export()
        const buffer = new Blob([data])
        return db.loadDb(buffer)
      })
      .then(() => {
        return db.execute('SELECT * from foo')
      })
      .catch(result => {
        expect(result).to.equal('no such table: foo')
      })
  })
})
