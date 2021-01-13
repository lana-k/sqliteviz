import { expect } from 'chai'
import storedQueries from '@/storedQueries.js'

describe('storedQueries.js', () => {
  beforeEach(()=> {
    localStorage.removeItem('myQueries')
  })

  it('getStoredQueries(empty storage)', () => {
    const queries = storedQueries.getStoredQueries() 
    expect(queries).to.eql([])
  })  

  it('getStoredQueries', () => {
    const data = [
      { id: 1 },
      { id: 2 },
    ]
    storedQueries.updateStorage(data)
    const queries = storedQueries.getStoredQueries() 
    expect(queries).to.eql(data)
  })  

  it('duplicateQuery', () => {
    const now = new Date()
    const nowPlusMinute = new Date(now.getTime() + 60*1000)
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
    let tab = {
      initName: 'foo'
    }
    expect(storedQueries.isTabNeedName(tab)).to.be.false
  })

  it('isTabNeedName returns true when the query has no name and is not predefined', () => {
    let tab = {
      initName: null,
      tempName: 'Untitled'
    }
    expect(storedQueries.isTabNeedName(tab)).to.be.true
  })

  it('isTabNeedName returns true when the qiery is predefined', () => {
    let tab = {
      initName: 'foo',
      isPredefined: true
    }
    expect(storedQueries.isTabNeedName(tab)).to.be.true
  })
})