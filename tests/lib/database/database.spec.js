import chai from 'chai'
import sinon from 'sinon'
import chaiAsPromised from 'chai-as-promised'
import initSqlJs from 'sql.js'
import database from '@/lib/database'
import fu from '@/lib/utils/fileIo'

chai.use(chaiAsPromised)
const expect = chai.expect
chai.should()

const getSQL = initSqlJs()
let db

describe('database.js', () => {
  beforeEach(() => {
    db = database.getNewDatabase()
  })

  afterEach(() => {
    db.shutDown()
    sinon.restore()
  })

  it('creates schema', async () => {
    const SQL = await getSQL
    const tempDb = new SQL.Database()
    tempDb.run(`CREATE TABLE test (
      col1,
      col2 integer,
      col3 decimal(5,2),
      col4 varchar(30)
    )`)

    const data = tempDb.export()
    const buffer = new Blob([data])
    buffer.name = 'foo.sqlite'

    const { schema, dbName } = await db.loadDb(buffer)
    expect(dbName).to.equal('foo')
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

  it('creates schema with virtual table', async () => {
    const SQL = await getSQL
    const tempDb = new SQL.Database()
    tempDb.run(`
      CREATE VIRTUAL TABLE test_virtual USING fts4(
        col1, col2,
        notindexed=col1, notindexed=col2,
        tokenize=unicode61 "tokenchars=.+#")
    `)

    const data = tempDb.export()
    const buffer = new Blob([data])
    buffer.name = 'foo.sqlite'

    const { schema } = await db.loadDb(buffer)
    expect(schema[0].name).to.equal('test_virtual')
    expect(schema[0].columns[0].name).to.equal('col1')
    expect(schema[0].columns[0].type).to.equal('N/A')
    expect(schema[0].columns[1].name).to.equal('col2')
    expect(schema[0].columns[1].type).to.equal('N/A')
  })

  it('loadDb throws errors', async () => {
    const SQL = await getSQL
    const tempDb = new SQL.Database()
    tempDb.run('CREATE TABLE test (col1, col2)')

    const data = tempDb.export()
    const buffer = new Blob([data])
    buffer.name = 'foo.sqlite'

    sinon.stub(db.pw, 'postMessage').resolves({ error: new Error('foo') })

    await expect(db.loadDb(buffer)).to.be.rejectedWith('foo')
  })

  it('returns the last query result', async () => {
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
    const buffer = new Blob([data])
    buffer.name = 'foo.sqlite'

    await db.loadDb(buffer)
    const result = await db.execute('SELECT * from test limit 1; SELECT * from test;')
    expect(result.columns).to.have.lengthOf(3)
    expect(result.columns).to.eql(['id', 'name', 'faculty'])
    expect(result.values).to.have.lengthOf(2)
    expect(result.values[0]).to.eql([1, 'Harry Potter', 'Griffindor'])
    expect(result.values[1]).to.eql([2, 'Draco Malfoy', 'Slytherin'])
  })

  it('returns an error', async () => {
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
    const buffer = new Blob([data])
    buffer.name = 'foo.sqlite'
    await db.loadDb(buffer)
    await expect(db.execute('SELECT * from foo')).to.be.rejectedWith(/^no such table: foo$/)
  })

  it('creates db', async () => {
    const data = {
      columns: ['id', 'name', 'faculty'],
      values: [
        [1, 'Harry Potter', 'Griffindor'],
        [2, 'Draco Malfoy', 'Slytherin']
      ]
    }
    const progressHandler = sinon.spy()
    const progressCounterId = db.createProgressCounter(progressHandler)
    const { dbName, schema } = await db.importDb('foo', data, progressCounterId)
    expect(dbName).to.equal('foo')
    expect(schema).to.have.lengthOf(1)
    expect(schema[0].name).to.equal('csv_import')
    expect(schema[0].columns).to.have.lengthOf(3)
    expect(schema[0].columns[0]).to.eql({ name: 'id', type: 'real' })
    expect(schema[0].columns[1]).to.eql({ name: 'name', type: 'text' })
    expect(schema[0].columns[2]).to.eql({ name: 'faculty', type: 'text' })

    const result = await db.execute('SELECT * from csv_import')
    expect(result.columns).to.eql(data.columns)
    expect(result.values).to.eql(data.values)

    expect(progressHandler.calledTwice).to.equal(true)
    expect(progressHandler.firstCall.calledWith(0)).to.equal(true)
    expect(progressHandler.secondCall.calledWith(100)).to.equal(true)
  })

  it('importDb throws errors', async () => {
    const data = {
      columns: ['id', 'name'],
      values: [
        [1, 'Harry Potter', 'Griffindor'],
        [2, 'Draco Malfoy', 'Slytherin']
      ]
    }
    const progressHandler = sinon.stub()
    const progressCounterId = db.createProgressCounter(progressHandler)
    await expect(db.importDb('foo', data, progressCounterId))
      .to.be.rejectedWith('column index out of range')
  })

  it('progressCounters', () => {
    const firstHandler = sinon.stub()
    const firstId = db.createProgressCounter(firstHandler)
    db.worker.dispatchEvent(new MessageEvent('message', {
      data: {
        progress: 50,
        id: firstId
      }
    }))
    expect(firstHandler.calledOnceWith(50)).to.equal(true)

    const secondHandler = sinon.stub()
    const secondId = db.createProgressCounter(secondHandler)
    db.worker.dispatchEvent(new MessageEvent('message', {
      data: {
        progress: 70,
        id: secondId
      }
    }))
    expect(firstId).to.not.equals(secondId)
    expect(secondHandler.calledOnceWith(70)).to.equal(true)

    db.worker.dispatchEvent(new MessageEvent('message', {
      data: {
        progress: 80,
        id: firstId
      }
    }))
    expect(firstHandler.calledTwice).to.equal(true)
    expect(firstHandler.secondCall.calledWith(80)).to.equal(true)

    db.deleteProgressCounter(firstId)
    expect(db.importProgresses[firstId]).to.equal(undefined)
  })

  it('exports db', async () => {
    sinon.stub(fu, 'exportToFile').resolves()

    // create db with table foo
    const stmt = `
      CREATE TABLE foo(id, name);
      INSERT INTO foo VALUES (1, 'Harry Potter')
    `
    let result = await db.execute(stmt)

    // export db to a file
    await db.export('fooDb.sqlite')
    expect(fu.exportToFile.called).to.equal(true)

    // get data from export
    const data = fu.exportToFile.getCall(0).args[0]
    const file = new Blob([data])
    file.name = 'fooDb.sqlite'

    // loadDb from exported data
    const anotherDb = database.getNewDatabase()
    await anotherDb.loadDb(file)

    // check that new db works and has the same table and data
    result = await anotherDb.execute('SELECT * from foo')
    expect(result.columns).to.eql(['id', 'name'])
    expect(result.values).to.have.lengthOf(1)
    expect(result.values[0]).to.eql([1, 'Harry Potter'])
  })
})
