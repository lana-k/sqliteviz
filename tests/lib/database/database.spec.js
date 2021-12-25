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
    tempDb.run('CREATE TABLE test (col1, col2 integer)')

    const data = tempDb.export()
    const buffer = new Blob([data])
    buffer.name = 'foo.sqlite'

    sinon.spy(db, 'refreshSchema')

    await db.loadDb(buffer)
    await db.refreshSchema.returnValues[0]
    const schema = db.schema
    expect(db.dbName).to.equal('foo')
    expect(schema).to.have.lengthOf(1)
    expect(schema[0].name).to.equal('test')

    expect(schema[0].columns[0].name).to.equal('col1')
    expect(schema[0].columns[0].type).to.equal('N/A')

    expect(schema[0].columns[1].name).to.equal('col2')
    expect(schema[0].columns[1].type).to.equal('INTEGER')
  })

  it('creates schema with view', async () => {
    await db.loadDb()
    await db.execute(`
      CREATE TABLE test (col1, col2 integer);
      CREATE VIEW test_view AS SELECT col2 as amount FROM test;
    `)

    await db.refreshSchema()
    const schema = db.schema
    expect(db.dbName).to.equal('database')
    expect(schema).to.have.lengthOf(2)
    expect(schema[0].name).to.equal('test')
    expect(schema[1].name).to.equal('test_view')

    expect(schema[0].columns[0]).to.eql({
      name: 'col1',
      type: 'N/A'
    })

    expect(schema[0].columns[1]).to.eql({
      name: 'col2',
      type: 'INTEGER'
    })

    expect(schema[1].columns).to.eql([{
      name: 'amount',
      type: 'INTEGER'
    }])
  })

  it('creates empty db with name database', async () => {
    sinon.spy(db, 'refreshSchema')

    await db.loadDb()
    await db.refreshSchema.returnValues[0]
    expect(db.dbName).to.equal('database')
  })

  it('loadDb throws errors', async () => {
    const buffer = new Blob([])
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
    expect(result.values).to.eql({
      id: [1, 2],
      name: ['Harry Potter', 'Draco Malfoy'],
      faculty: ['Griffindor', 'Slytherin']
    })
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

  it('adds table from csv', async () => {
    const data = {
      columns: ['id', 'name', 'faculty'],
      values: {
        id: [1, 2],
        name: ['Harry Potter', 'Draco Malfoy'],
        faculty: ['Griffindor', 'Slytherin']
      }
    }
    const progressHandler = sinon.spy()
    const progressCounterId = db.createProgressCounter(progressHandler)
    sinon.spy(db, 'refreshSchema')

    await db.addTableFromCsv('foo', data, progressCounterId)
    await db.refreshSchema.returnValues[0]
    expect(db.dbName).to.equal('database')
    expect(db.schema).to.have.lengthOf(1)
    expect(db.schema[0].name).to.equal('foo')
    expect(db.schema[0].columns).to.have.lengthOf(3)
    expect(db.schema[0].columns[0]).to.eql({ name: 'id', type: 'REAL' })
    expect(db.schema[0].columns[1]).to.eql({ name: 'name', type: 'TEXT' })
    expect(db.schema[0].columns[2]).to.eql({ name: 'faculty', type: 'TEXT' })

    const result = await db.execute('SELECT * from foo')
    expect(result).to.eql(data)

    expect(progressHandler.calledTwice).to.equal(true)
    expect(progressHandler.firstCall.calledWith(0)).to.equal(true)
    expect(progressHandler.secondCall.calledWith(100)).to.equal(true)
  })

  it('addTableFromCsv throws errors', async () => {
    const data = {
      columns: [],
      values: {
        id: [1, 2],
        name: ['Harry Potter', 'Draco Malfoy'],
        faculty: null
      }
    }
    const progressHandler = sinon.stub()
    const progressCounterId = db.createProgressCounter(progressHandler)
    await expect(db.addTableFromCsv('foo', data, progressCounterId)).to.be.rejected
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
    expect(result).to.eql({
      columns: ['id', 'name'],
      values: {
        id: [1],
        name: ['Harry Potter']
      }
    })
  })

  it('sanitizeTableName', () => {
    let name = 'foo[]bar'
    expect(db.sanitizeTableName(name)).to.equal('foo_bar')

    name = '1 foo(01.05.2020)'
    expect(db.sanitizeTableName(name)).to.equal('_1_foo_01_05_2020_')
  })

  it('validateTableName', async () => {
    await db.execute('CREATE TABLE foo(id)')
    await expect(db.validateTableName('foo')).to.be.rejectedWith('table "foo" already exists')
    await expect(db.validateTableName('1foo'))
      .to.be.rejectedWith("Table name can't start with a digit")
    await expect(db.validateTableName('foo(05.08.2020)'))
      .to.be.rejectedWith('Table name can contain only letters, digits and underscores')
    await expect(db.validateTableName('sqlite_foo'))
      .to.be.rejectedWith("Table name can't start with sqlite_")
  })
})
