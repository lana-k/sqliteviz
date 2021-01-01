import { expect } from 'chai'
import { mutations } from '@/store'
const { 
  saveSchema,
  addTab,
  updateTab,
  deleteTab,
  setCurrentTabId,
  setCurrentTab,
  updatePredefinedQueries
} = mutations

describe('mutations', () => {
  it('saveSchema', () => {
    // mock state
    const state = {}
    
    const schema = [
      { name: 'table1', columns: [
        { name: 'id',    type: 'INTEGER' }
      ]}
    ]
    saveSchema(state, {
      dbName: 'test',
      schema
    })
    expect(state.dbName).to.equal('test')
    expect(JSON.stringify(state.schema)).to.equal(JSON.stringify(schema))
  })

  it('addTab (new)', () => {
    // mock state
    const state = {
      tabs: [],
      untitledLastIndex: 0
    }

    const tab = {
      id: 1,
      name: null,
      tempName: 'Untitled',
      query: 'SELECT * from foo',
      chart: {},
      isUnsaved: true
    }
    addTab(state, tab)
    expect(JSON.stringify(state.tabs[0])).to.equal(JSON.stringify(tab))
    expect(state.untitledLastIndex).to.equal(1)
  })

  it('addTab (saved)', () => {
    // mock state
    const state = {
      tabs: [],
      untitledLastIndex: 0
    }
    const tab = {
      id: 1,
      name: 'test',
      tempName: null,
      query: 'SELECT * from foo',
      chart: {},
      isUnsaved: false
    }
    addTab(state, tab)
    expect(JSON.stringify(state.tabs[0])).to.equal(JSON.stringify(tab))
    expect(state.untitledLastIndex).to.equal(0)
  })

  it('addTab (existed)', () => {
    const tab1 = {
      id: 1,
      name: 'test',
      tempName: null,
      query: 'SELECT * from foo',
      chart: {},
      isUnsaved: false
    }

    const tab2 = {
      id: 2,
      name: 'bar',
      tempName: null,
      query: 'SELECT * from bar',
      chart: {},
      isUnsaved: false
    }

    // mock state
    const state = {
      tabs: [ tab1, tab2 ],
      untitledLastIndex: 0,
    }

    addTab(state, tab1)
    expect(state.tabs.length).to.equal(2)
    expect(state.untitledLastIndex).to.equal(0)
  })

  it('updateTab (save)', () => {
    const tab = {
      id: 1,
      name: 'test',
      tempName: null,
      query: 'SELECT * from foo',
      chart: {},
      isUnsaved: true,
      isPredefined: false
    }

    const newTab = {
      index: 0,
      id: 1,
      name: 'new test',
      query: 'SELECT * from bar',
      isUnsaved: false
    }

    // mock state
    const state = {
      tabs: [tab]
    }

    updateTab(state, newTab)
    expect(state.tabs[0].id).to.equal(1)
    expect(state.tabs[0].name).to.equal('new test')
    expect(state.tabs[0].tempName).to.equal(null)
    expect(state.tabs[0].query).to.equal('SELECT * from bar')
    expect(state.tabs[0].isUnsaved).to.equal(false)
  })

  it('updateTab (save predefined)', () => {
    const tab = {
      id: 1,
      name: 'test',
      tempName: null,
      query: 'SELECT * from foo',
      chart: {},
      isUnsaved: true,
      isPredefined: true
    }

    const newTab = {
      index: 0,
      id: 2,
      name: 'new test',
      query: 'SELECT * from bar',
      chart: {},
      isUnsaved: false
    }

    // mock state
    const state = {
      tabs: [tab],
      currentTabId: 1
    }

    updateTab(state, newTab)
    expect(state.tabs.length).to.equal(1)
    expect(state.currentTabId).to.equal(2)
    expect(state.tabs[0].id).to.equal(2)
    expect(state.tabs[0].name).to.equal('new test')
    expect(state.tabs[0].query).to.equal('SELECT * from bar')
    expect(state.tabs[0].isUnsaved).to.equal(false)
    expect(state.tabs[0].isPredefined).to.equal(undefined)
  })

  it('updateTab (rename)', () => {
    const tab = {
      id: 1,
      name: 'test',
      tempName: null,
      query: 'SELECT * from foo',
      chart: {},
      isUnsaved: true
    }

    const newTab = {
      index: 0,
      id: 1,
      name: 'new test'
    }

    // mock state
    const state = {
      tabs: [tab]
    }

    updateTab(state, newTab)
    expect(state.tabs.length).to.equal(1)
    expect(state.tabs[0].id).to.equal(1)
    expect(state.tabs[0].name).to.equal('new test')
    expect(state.tabs[0].query).to.equal('SELECT * from foo')
    expect(state.tabs[0].isUnsaved).to.equal(true)
  })

  it('updateTab (changes detected)', () => {
    const tab = {
      id: 1,
      name: 'test',
      tempName: null,
      query: 'SELECT * from foo',
      chart: {},
      isUnsaved: false,
      isPredefined: true
    }

    const newTab = {
      index: 0,
      isUnsaved: true
    }

    // mock state
    const state = {
      tabs: [tab]
    }

    updateTab(state, newTab)
    expect(state.tabs.length).to.equal(1)
    expect(state.tabs[0].id).to.equal(1)
    expect(state.tabs[0].name).to.equal('test')
    expect(state.tabs[0].query).to.equal('SELECT * from foo')
    expect(state.tabs[0].isUnsaved).to.equal(true)
  })

  it('deleteTab (opened, first)', () => {
    const tab1 = {
      id: 1,
      name: 'foo',
      tempName: null,
      query: 'SELECT * from foo',
      chart: {},
      isUnsaved: false
    }

    const tab2 = {
      id: 2,
      name: 'bar',
      tempName: null,
      query: 'SELECT * from bar',
      chart: {},
      isUnsaved: false
    }

    // mock state
    const state = {
      tabs: [tab1, tab2],
      currentTabId: 1
    }

    deleteTab(state, 0)
    expect(state.tabs.length).to.equal(1)
    expect(state.tabs[0].id).to.equal(2)
    expect(state.currentTabId).to.equal(2)
  })

  it('deleteTab (opened, last)', () => {
    const tab1 = {
      id: 1,
      name: 'foo',
      tempName: null,
      query: 'SELECT * from foo',
      chart: {},
      isUnsaved: false
    }

    const tab2 = {
      id: 2,
      name: 'bar',
      tempName: null,
      query: 'SELECT * from bar',
      chart: {},
      isUnsaved: false
    }

    // mock state
    const state = {
      tabs: [tab1, tab2],
      currentTabId: 2
    }

    deleteTab(state, 1)
    expect(state.tabs.length).to.equal(1)
    expect(state.tabs[0].id).to.equal(1)
    expect(state.currentTabId).to.equal(1)
  })

  it('deleteTab (opened, in the middle)', () => {
    const tab1 = {
      id: 1,
      name: 'foo',
      tempName: null,
      query: 'SELECT * from foo',
      chart: {},
      isUnsaved: false
    }

    const tab2 = {
      id: 2,
      name: 'bar',
      tempName: null,
      query: 'SELECT * from bar',
      chart: {},
      isUnsaved: false
    }

    const tab3 = {
      id: 3,
      name: 'foobar',
      tempName: null,
      query: 'SELECT * from foobar',
      chart: {},
      isUnsaved: false
    }

    // mock state
    const state = {
      tabs: [tab1, tab2, tab3],
      currentTabId: 2
    }

    deleteTab(state, 1)
    expect(state.tabs.length).to.equal(2)
    expect(state.tabs[0].id).to.equal(1)
    expect(state.tabs[1].id).to.equal(3)
    expect(state.currentTabId).to.equal(3)
  })

  it('deleteTab (opened, single)', () => {
    const tab1 = {
      id: 1,
      name: 'foo',
      tempName: null,
      query: 'SELECT * from foo',
      chart: {},
      isUnsaved: false
    }

    // mock state
    const state = {
      tabs: [tab1],
      currentTabId: 1
    }

    deleteTab(state, 0)
    expect(state.tabs.length).to.equal(0)
    expect(state.currentTabId).to.equal(null)
  })

  it('deleteTab (not opened)', () => {
    const tab1 = {
      id: 1,
      name: 'foo',
      tempName: null,
      query: 'SELECT * from foo',
      chart: {},
      isUnsaved: false
    }

    const tab2 = {
      id: 2,
      name: 'bar',
      tempName: null,
      query: 'SELECT * from bar',
      chart: {},
      isUnsaved: false
    }

    // mock state
    const state = {
      tabs: [tab1, tab2],
      currentTabId: 1
    }

    deleteTab(state, 1)
    expect(state.tabs.length).to.equal(1)
    expect(state.tabs[0].id).to.equal(1)
    expect(state.currentTabId).to.equal(1)
  })

  it('setCurrentTabId', () => {
    // mock state
    const state = {
      currentTabId: 1
    }

    setCurrentTabId(state, 2)
    expect(state.currentTabId).to.equal(2)
  })

  it('setCurrentTab', () => {
    // mock state
    const state = {
      currentTab: { id: 1}
    }

    setCurrentTab(state, { id: 2 })
    expect(JSON.stringify(state.currentTab)).to.equal('{"id":2}')
  })

  it('updatePredefinedQueries (single)', () => {
    const query = {
      id: 1,
      name: 'foo',
      query: 'SELECT * FROM foo',
      chart: {},
      createdAt: '2020-11-07T20:57:04.492Z'
    }

    const state = {
      predefinedQueries: []
    }

    updatePredefinedQueries(state, query)
    expect(JSON.stringify(state.predefinedQueries)).to.equal(`[${JSON.stringify(query)}]`)
  })

  it('updatePredefinedQueries (array)', () => {
    const queries = [{
      id: 1,
      name: 'foo',
      query: 'SELECT * FROM foo',
      chart: {},
      createdAt: '2020-11-07T20:57:04.492Z'
    },
    {
      id: 2,
      name: 'bar',
      query: 'SELECT * FROM bar',
      chart: {},
      createdAt: '2020-11-07T20:57:04.492Z'
    }]

    const state = {
      predefinedQueries: []
    }

    updatePredefinedQueries(state, queries)
    expect(JSON.stringify(state.predefinedQueries)).to.equal(JSON.stringify(queries))
  })
})