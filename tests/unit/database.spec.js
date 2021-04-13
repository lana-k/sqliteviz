import chai from 'chai'
import sinon from 'sinon'
import chaiAsPromised from 'chai-as-promised'
import initSqlJs from 'sql.js'
import database from '@/database.js'
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

    const { schema } = await db.loadDb(buffer)
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

    sinon.stub(db.pw, 'postMessage').resolves({ error: new Error('foo') })

    await expect(db.loadDb(buffer)).to.be.rejectedWith('foo')
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
    const buffer = new Blob([data])

    await db.loadDb(buffer)
    const result = await db.execute('SELECT * from test')
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
    const { dbName, schema } = await db.createDb('foo', data, progressCounterId)
    expect(dbName).to.equal('foo')
    expect(schema).to.have.lengthOf(1)
    expect(schema[0].name).to.equal('csv_import')
    expect(schema[0].columns).to.have.lengthOf(3)
    expect(schema[0].columns[0].name).to.equal('id')
    expect(schema[0].columns[0].type).to.equal('real')
    expect(schema[0].columns[1].name).to.equal('name')
    expect(schema[0].columns[1].type).to.equal('text')
    expect(schema[0].columns[2].name).to.equal('faculty')
    expect(schema[0].columns[2].type).to.equal('text')

    const result = await db.execute('SELECT * from csv_import')
    expect(result.columns).to.eql(data.columns)
    expect(result.values).to.eql(data.values)

    expect(progressHandler.calledTwice).to.equal(true)
    expect(progressHandler.firstCall.calledWith(0)).to.equal(true)
    expect(progressHandler.secondCall.calledWith(100)).to.equal(true)
  })

  it('createDb throws errors', async () => {
    const data = {
      columns: ['id', 'name'],
      values: [
        [1, 'Harry Potter', 'Griffindor'],
        [2, 'Draco Malfoy', 'Slytherin']
      ]
    }
    const progressHandler = sinon.stub()
    const progressCounterId = db.createProgressCounter(progressHandler)
    await expect(db.createDb('foo', data, progressCounterId))
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
})
