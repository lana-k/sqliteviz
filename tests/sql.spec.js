import chai from 'chai'
import sinon from 'sinon'
import chaiAsPromised from 'chai-as-promised'
import initSqlJs from 'sql.js'
import Sql from '@/sql'
chai.use(chaiAsPromised)
const expect = chai.expect
chai.should()

const getSQL = initSqlJs()

describe('sql.js', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('returns a query result', async () => {
    const SQL = await getSQL
    const tempDb = new SQL.Database()
    tempDb.run(`
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

    const data = tempDb.export()
    const sql = await Sql.build()
    sql.open(data)
    const result = sql.exec('SELECT * from test')
    expect(result).to.have.lengthOf(1)
    expect(result[0].columns).to.eql(['id', 'name', 'faculty'])
    expect(result[0].values).to.have.lengthOf(2)
    expect(result[0].values[0]).to.eql([1, 'Harry Potter', 'Griffindor'])
    expect(result[0].values[1]).to.eql([2, 'Draco Malfoy', 'Slytherin'])
  })

  it('throws an error if query is empty', async () => {
    const SQL = await getSQL
    const tempDb = new SQL.Database()
    tempDb.run(`
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

    const data = tempDb.export()
    const sql = await Sql.build()
    sql.open(data)
    expect(() => { sql.exec() }).to.throw('exec: Missing query string')
  })

  it('imports', async () => {
    const data = {
      columns: ['id', 'name'],
      values: [
        [1, 'Harry Potter'],
        [2, 'Draco Malfoy'],
        [3, 'Hermione Granger'],
        [4, 'Ron Weasley']
      ]
    }
    const progressCallback = sinon.stub()
    const progressCounterId = 1
    const sql = await Sql.build()
    sql.import(data.columns, data.values, progressCounterId, progressCallback, 2)
    const result = sql.exec('SELECT * from csv_import')
    expect(result).to.have.lengthOf(1)
    expect(result[0].columns).to.eql(['id', 'name'])
    expect(result[0].values).to.have.lengthOf(4)
    expect(result[0].values[0]).to.eql([1, 'Harry Potter'])
    expect(result[0].values[1]).to.eql([2, 'Draco Malfoy'])
    expect(result[0].values[2]).to.eql([3, 'Hermione Granger'])
    expect(result[0].values[3]).to.eql([4, 'Ron Weasley'])

    expect(progressCallback.calledThrice).to.equal(true)
    expect(progressCallback.getCall(0).args[0]).to.eql({ progress: 0, id: 1 })
    expect(progressCallback.getCall(1).args[0]).to.eql({ progress: 50, id: 1 })
    expect(progressCallback.getCall(2).args[0]).to.eql({ progress: 100, id: 1 })
  })

  it('exports', async () => {
    const sql = await Sql.build()
    sql.exec(`
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
    const data = sql.export()
    const anotherSql = await Sql.build()
    anotherSql.open(data)
    const result = anotherSql.exec('SELECT * from test')
    expect(result).to.have.lengthOf(1)
    expect(result[0].columns).to.eql(['id', 'name', 'faculty'])
    expect(result[0].values).to.have.lengthOf(2)
    expect(result[0].values[0]).to.eql([1, 'Harry Potter', 'Griffindor'])
    expect(result[0].values[1]).to.eql([2, 'Draco Malfoy', 'Slytherin'])
  })

  it('closes', async () => {
    const sql = await Sql.build()

    // nothing breaks if close empty db
    sql.close()

    sql.exec(`
      CREATE TABLE test (
        id integer,
        name varchar(100)
      );
      INSERT INTO test (id, name)
      VALUES
      ( 1, 'Harry Potter'),
      ( 2, 'Draco Malfoy');
    `)
    expect(sql.db.db).to.not.equal(null)
    sql.close()
    expect(sql.db.db).to.equal(null)
  })

  it('overwrites', async () => {
    const sql = await Sql.build()
    sql.exec(`
      CREATE TABLE test (
        id integer,
        name varchar(100)
      );
      INSERT INTO test (id, name)
      VALUES
      ( 1, 'foo'),
      ( 2, 'bar');
    `)

    let result = sql.exec('SELECT * from test')
    expect(result[0].values).to.have.lengthOf(2)

    const data = {
      columns: ['id', 'name'],
      values: [
        [1, 'Harry Potter'],
        [2, 'Draco Malfoy'],
        [3, 'Hermione Granger'],
        [4, 'Ron Weasley']
      ]
    }
    // rewrite the database by import
    sql.import(data.columns, data.values, 1, sinon.stub(), 2)
    result = sql.exec('SELECT * from csv_import')
    expect(result[0].values).to.have.lengthOf(4)

    // test table oesn't exists anymore: the db was overwritten
    expect(() => { sql.exec('SELECT * from test') }).to.throw('no such table: test')
  })
})
