import { expect } from 'chai'
import storedQueries from '@/storedQueries.js'
import fu from '@/fileUtils'

describe('storedQueries.js', () => {
  beforeEach(() => {
    localStorage.removeItem('myQueries')
  })

  it('getStoredQueries returns emplty array when storage is empty', () => {
    const queries = storedQueries.getStoredQueries()
    expect(queries).to.eql([])
  })

  it('updateStorage and getStoredQueries', () => {
    const data = [
      { id: 1 },
      { id: 2 }
    ]
    storedQueries.updateStorage(data)
    const queries = storedQueries.getStoredQueries()
    expect(queries).to.eql(data)
  })

  it('duplicateQuery', () => {
    const now = new Date()
    const nowPlusMinute = new Date(now.getTime() + 60 * 1000)
    const base = {
      id: 1,
      name: 'foo',
      query: 'SELECT * from foo',
      chart: [],
      createdAt: new Date(2021, 0, 1),
      isPredefined: true
    }

    const copy = storedQueries.duplicateQuery(base)
    expect(copy).to.have.property('id').which.not.equal(base.id)
    expect(copy).to.have.property('name').which.equal(base.name + ' Copy')
    expect(copy).to.have.property('query').which.equal(base.query)
    expect(copy).to.have.property('chart').which.eql(base.chart)
    expect(copy).to.have.property('createdAt').which.within(now, nowPlusMinute)
    expect(copy).to.not.have.property('isPredefined')
  })

  it('isTabNeedName returns false when the query has a name and is not predefined', () => {
    const tab = {
      initName: 'foo'
    }
    expect(storedQueries.isTabNeedName(tab)).to.equal(false)
  })

  it('isTabNeedName returns true when the query has no name and is not predefined', () => {
    const tab = {
      initName: null,
      tempName: 'Untitled'
    }
    expect(storedQueries.isTabNeedName(tab)).to.equal(true)
  })

  it('isTabNeedName returns true when the qiery is predefined', () => {
    const tab = {
      initName: 'foo',
      isPredefined: true
    }

    expect(storedQueries.isTabNeedName(tab)).to.equal(true)
  })

  it('serialiseQueries', () => {
    const queryList = [
      {
        id: 1,
        name: 'foo',
        query: 'SELECT from foo',
        chart: [],
        createdAt: '2020-11-03T14:17:49.524Z',
        isPredefined: true
      },
      {
        id: 2,
        name: 'bar',
        query: 'SELECT from bar',
        chart: [],
        createdAt: '2020-12-03T14:17:49.524Z'
      }
    ]

    const str = storedQueries.serialiseQueries(queryList)
    const parsedJson = JSON.parse(str)

    expect(parsedJson).to.have.lengthOf(2)
    expect(parsedJson[1]).to.eql(queryList[1])
    expect(parsedJson[0].id).to.equal(queryList[0].id)
    expect(parsedJson[0].name).to.equal(queryList[0].name)
    expect(parsedJson[0].query).to.equal(queryList[0].query)
    expect(parsedJson[0].chart).to.eql(queryList[0].chart)
    expect(parsedJson[0].createdAt).to.eql(queryList[0].createdAt)
    expect(parsedJson[0].chart).to.not.have.property('isPredefined')
  })

  it('deserialiseQueries return array for one query', () => {
    const str = `
      {
        "id": 1,
        "name": "foo",
        "query": "select * from foo",
        "chart": [],
        "createdAt": "2020-11-03T14:17:49.524Z" 
      }
    `
    const query = storedQueries.deserialiseQueries(str)
    expect(query).to.eql([JSON.parse(str)])
  })

  it('deserialiseQueries generates new id to avoid duplication', () => {
    storedQueries.updateStorage([{id: 1}])
    const str = `[
      {
        "id": 1,
        "name": "foo",
        "query": "select * from foo",
        "chart": [],
        "createdAt": "2020-11-03T14:17:49.524Z" 
      },
      {
        "id": 2,
        "name": "bar",
        "query": "select * from bar",
        "chart": [],
        "createdAt": "2020-11-04T14:17:49.524Z" 
      }
    ]`
    
    const queries = storedQueries.deserialiseQueries(str)
    const parsedStr = JSON.parse(str)
    expect(queries[1]).to.eql(parsedStr[1])
    expect(queries[0].id).to.not.equal(parsedStr[0].id)
    expect(queries[0]).to.have.property('id')
    expect(queries[0].id).to.not.equal(parsedStr[0].id)
    expect(queries[0].name).to.equal(parsedStr[0].name)
    expect(queries[0].query).to.equal(parsedStr[0].query)
    expect(queries[0].chart).to.eql(parsedStr[0].chart)
    expect(queries[0].createdAt).to.equal(parsedStr[0].createdAt)
  })

  it('importQueries', async () => {
    const str = `
      {
        "id": 1,
        "name": "foo",
        "query": "select * from foo",
        "chart": [],
        "createdAt": "2020-11-03T14:17:49.524Z" 
      }
    `
    sinon.stub(fu, 'importFile').returns(Promise.resolve(str))
    const queries = await storedQueries.importQueries()
    fu.importFile.restore()
    
    expect(queries).to.eql([JSON.parse(str)])
  })

  it('readPredefinedQueries', async () => {
    const str = `
      {
        "id": 1,
        "name": "foo",
        "query": "select * from foo",
        "chart": [],
        "createdAt": "2020-11-03T14:17:49.524Z" 
      }
    `
    sinon.stub(fu, 'readFile').returns(Promise.resolve(new Response(str)))
    const queries = await storedQueries.readPredefinedQueries()
    expect(fu.readFile.calledOnceWith('./queries.json')).to.equal(true)
    expect(queries).to.eql(JSON.parse(str))
    fu.readFile.restore()
  })

  it('save adds new query in the storage', () => {
    const now = new Date()
    const nowPlusMinute = new Date(now.getTime() + 60 * 1000)
    const tab = {
      id: 1,
      query: 'select * from foo',
      chart: [],
      initName: null,
      getChartStateForSave () {
        return []
      }
    }
    const value = storedQueries.save(tab, 'foo')
    expect(value.id).to.equal(tab.id)
    expect(value.name).to.equal('foo')
    expect(value.query).to.equal(tab.query)
    expect(value.chart).to.eql(tab.getChartStateForSave())
    expect(value).to.have.property('createdAt').which.within(now, nowPlusMinute)
    const queries = storedQueries.getStoredQueries()
    expect(JSON.stringify(queries)).to.equal(JSON.stringify([value]))
  })

  it('save updates existing query in the storage', () => {
    const tab = {
      id: 1,
      query: 'select * from foo',
      chart: [],
      initName: null,
      getChartStateForSave () {
        return []
      }
    }

    const first = storedQueries.save(tab, 'foo')

    tab.initName = 'foo'
    tab.query = 'select * from foo'
    storedQueries.save(tab)
    const queries = storedQueries.getStoredQueries()
    const second = queries[0]
    expect(queries).has.lengthOf(1)
    expect(second.id).to.equal(first.id)
    expect(second.name).to.equal(first.name)
    expect(second.query).to.equal(tab.query)
    expect(second.chart).to.eql(first.chart)
    expect(new Date(second.createdAt).getTime()).to.equal(first.createdAt.getTime())
  })

  it("save adds a new query with new id if it's based on predefined query", () => {
    const now = new Date()
    const nowPlusMinute = new Date(now.getTime() + 60 * 1000)
    const tab = {
      id: 1,
      query: 'select * from foo',
      chart: [],
      initName: 'foo predefined',
      getChartStateForSave () {
        return []
      },
      isPredefined: true
    }
    storedQueries.save(tab, 'foo')
    
    const queries = storedQueries.getStoredQueries()
    expect(queries).has.lengthOf(1)
    expect(queries[0]).to.have.property('id').which.not.equal(tab.id)
    expect(queries[0].name).to.equal('foo')
    expect(queries[0].query).to.equal(tab.query)
    expect(queries[0].chart).to.eql(tab.getChartStateForSave())
    expect(new Date(queries[0].createdAt)).to.be.within(now, nowPlusMinute)
  })
})

    