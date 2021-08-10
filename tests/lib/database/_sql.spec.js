import chai from 'chai'
import sinon from 'sinon'
import chaiAsPromised from 'chai-as-promised'
import initSqlJs from 'sql.js'
import Sql from '@/lib/database/_sql'
chai.use(chaiAsPromised)
const expect = chai.expect
chai.should()

const getSQL = initSqlJs()

describe('_sql.js', () => {
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
    expect(result[0]).to.eql({
      columns: ['id', 'name', 'faculty'],
      values: {
        id: [1, 2],
        name: ['Harry Potter', 'Draco Malfoy'],
        faculty: ['Griffindor', 'Slytherin']
      }
    })
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
      values: {
        id: [1, 2, 3, 4],
        name: [
          'Harry Potter',
          'Draco Malfoy',
          'Hermione Granger',
          'Ron Weasley'
        ]
      }
    }
    const progressCallback = sinon.stub()
    const progressCounterId = 1
    const sql = await Sql.build()
    sql.import('foo', data, progressCounterId, progressCallback, 2)
    const result = sql.exec('SELECT * from foo')
    expect(result).to.have.lengthOf(1)
    expect(result[0]).to.eql(data)

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
    expect(result[0].values).to.eql({
      id: [1, 2],
      name: ['Harry Potter', 'Draco Malfoy'],
      faculty: ['Griffindor', 'Slytherin']
    })
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

  it('adds', async () => {
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
    expect(result[0].values).to.eql({
      id: [1, 2],
      name: ['foo', 'bar']
    })

    const data = {
      columns: ['id', 'name'],
      values: {
        id: [1, 2, 3, 4],
        name: [
          'Harry Potter',
          'Draco Malfoy',
          'Hermione Granger',
          'Ron Weasley'
        ]
      }
    }
    // import adds table
    sql.import('foo', data, 1, sinon.stub(), 2)
    result = sql.exec('SELECT * from foo')
    expect(result[0]).to.eql(data)
    result = sql.exec('SELECT * from test')
    expect(result[0].values).to.eql({
      id: [1, 2],
      name: ['foo', 'bar']
    })
  })
})
