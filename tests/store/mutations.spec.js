import { expect } from 'chai'
import sinon from 'sinon'
import mutations from '@/store/mutations'
const {
  updateTab,
  deleteTab,
  setCurrentTabId,
  setCurrentTab,
  updatePredefinedInquiries,
  setDb
} = mutations

describe('mutations', () => {
  it('setDb', () => {
    const state = {
      db: { shutDown: sinon.spy() }
    }

    const oldDb = state.db
    const db = {}
    setDb(state, db)
    expect(state.db).to.equal(db)
    expect(oldDb.shutDown.calledOnce).to.equal(true)
  })

  it('updateTab - save', () => {
    const tab = {
      id: 1,
      name: 'test',
      tempName: null,
      query: 'SELECT * from foo',
      viewType: 'chart',
      viewOptions: { here_are: 'chart settings' },
      isSaved: false,
      isPredefined: false
    }

    const newTab = {
      index: 0,
      id: 1,
      name: 'new test',
      query: 'SELECT * from bar',
      viewType: 'pivot',
      viewOptions: { here_are: 'pivot settings' },
      isSaved: true
    }

    const state = {
      tabs: [tab]
    }

    updateTab(state, newTab)
    expect(state.tabs[0]).to.eql({
      id: 1,
      name: 'new test',
      tempName: null,
      query: 'SELECT * from bar',
      viewType: 'pivot',
      viewOptions: { here_are: 'pivot settings' },
      isSaved: true
    })
  })

  it('updateTab - save predefined', () => {
    const tab = {
      id: 1,
      name: 'test',
      tempName: null,
      query: 'SELECT * from foo',
      viewType: 'chart',
      viewOptions: {},
      isSaved: false,
      isPredefined: true
    }

    const newTab = {
      index: 0,
      id: 2,
      name: 'new test',
      query: 'SELECT * from bar',
      viewType: 'chart',
      viewOptions: {},
      isSaved: true
    }

    const state = {
      tabs: [tab],
      currentTabId: 1
    }

    updateTab(state, newTab)
    expect(state.tabs).to.have.lengthOf(1)
    expect(state.currentTabId).to.equal(2)
    expect(state.tabs[0].id).to.equal(2)
    expect(state.tabs[0].name).to.equal('new test')
    expect(state.tabs[0].query).to.equal('SELECT * from bar')
    expect(state.tabs[0].isSaved).to.equal(true)
    expect(state.tabs[0].isPredefined).to.equal(undefined)
  })

  it('updateTab - rename', () => {
    const tab = {
      id: 1,
      name: 'test',
      tempName: null,
      query: 'SELECT * from foo',
      viewType: 'chart',
      viewOptions: {},
      isSaved: false
    }

    const newTab = {
      index: 0,
      id: 1,
      name: 'new test'
    }

    const state = {
      tabs: [tab]
    }

    updateTab(state, newTab)
    expect(state.tabs).to.have.lengthOf(1)
    expect(state.tabs[0].id).to.equal(1)
    expect(state.tabs[0].name).to.equal('new test')
    expect(state.tabs[0].query).to.equal('SELECT * from foo')
    expect(state.tabs[0].isSaved).to.equal(false)
  })

  it('updateTab - changes detected', () => {
    const tab = {
      id: 1,
      name: 'test',
      tempName: null,
      query: 'SELECT * from foo',
      viewType: 'chart',
      viewOptions: {},
      isSaved: true,
      isPredefined: true
    }

    const newTab = {
      index: 0,
      isSaved: false
    }

    const state = {
      tabs: [tab]
    }

    updateTab(state, newTab)
    expect(state.tabs).to.have.lengthOf(1)
    expect(state.tabs[0].id).to.equal(1)
    expect(state.tabs[0].name).to.equal('test')
    expect(state.tabs[0].query).to.equal('SELECT * from foo')
    expect(state.tabs[0].isSaved).to.equal(false)
  })

  it('deleteTab - opened, first', () => {
    const tab1 = {
      id: 1,
      name: 'foo',
      tempName: null,
      query: 'SELECT * from foo',
      viewType: 'chart',
      viewOptions: {},
      isSaved: true
    }

    const tab2 = {
      id: 2,
      name: 'bar',
      tempName: null,
      query: 'SELECT * from bar',
      viewType: 'chart',
      viewOptions: {},
      isSaved: true
    }

    const state = {
      tabs: [tab1, tab2],
      currentTabId: 1
    }

    deleteTab(state, 0)
    expect(state.tabs).to.have.lengthOf(1)
    expect(state.tabs[0].id).to.equal(2)
    expect(state.currentTabId).to.equal(2)
  })

  it('deleteTab - opened, last', () => {
    const tab1 = {
      id: 1,
      name: 'foo',
      tempName: null,
      query: 'SELECT * from foo',
      viewType: 'chart',
      viewOptions: {},
      isSaved: true
    }

    const tab2 = {
      id: 2,
      name: 'bar',
      tempName: null,
      query: 'SELECT * from bar',
      viewType: 'chart',
      viewOptions: {},
      isSaved: true
    }

    const state = {
      tabs: [tab1, tab2],
      currentTabId: 2
    }

    deleteTab(state, 1)
    expect(state.tabs).to.have.lengthOf(1)
    expect(state.tabs[0].id).to.equal(1)
    expect(state.currentTabId).to.equal(1)
  })

  it('deleteTab - opened, in the middle', () => {
    const tab1 = {
      id: 1,
      name: 'foo',
      tempName: null,
      query: 'SELECT * from foo',
      viewType: 'chart',
      viewOptions: {},
      isSaved: true
    }

    const tab2 = {
      id: 2,
      name: 'bar',
      tempName: null,
      query: 'SELECT * from bar',
      viewType: 'chart',
      viewOptions: {},
      isSaved: true
    }

    const tab3 = {
      id: 3,
      name: 'foobar',
      tempName: null,
      query: 'SELECT * from foobar',
      viewType: 'chart',
      viewOptions: {},
      isSaved: true
    }

    const state = {
      tabs: [tab1, tab2, tab3],
      currentTabId: 2
    }

    deleteTab(state, 1)
    expect(state.tabs).to.have.lengthOf(2)
    expect(state.tabs[0].id).to.equal(1)
    expect(state.tabs[1].id).to.equal(3)
    expect(state.currentTabId).to.equal(3)
  })

  it('deleteTab - opened, single', () => {
    const tab1 = {
      id: 1,
      name: 'foo',
      tempName: null,
      query: 'SELECT * from foo',
      viewType: 'chart',
      viewOptions: {},
      isSaved: true
    }

    const state = {
      tabs: [tab1],
      currentTabId: 1
    }

    deleteTab(state, 0)
    expect(state.tabs).to.have.lengthOf(0)
    expect(state.currentTabId).to.equal(null)
  })

  it('deleteTab - not opened', () => {
    const tab1 = {
      id: 1,
      name: 'foo',
      tempName: null,
      query: 'SELECT * from foo',
      viewType: 'chart',
      viewOptions: {},
      isSaved: true
    }

    const tab2 = {
      id: 2,
      name: 'bar',
      tempName: null,
      query: 'SELECT * from bar',
      viewType: 'chart',
      viewOptions: {},
      isSaved: true
    }

    const state = {
      tabs: [tab1, tab2],
      currentTabId: 1
    }

    deleteTab(state, 1)
    expect(state.tabs).to.have.lengthOf(1)
    expect(state.tabs[0].id).to.equal(1)
    expect(state.currentTabId).to.equal(1)
  })

  it('setCurrentTabId', () => {
    const state = {
      currentTabId: 1
    }

    setCurrentTabId(state, 2)
    expect(state.currentTabId).to.equal(2)
  })

  it('setCurrentTab', () => {
    const state = {
      currentTab: { id: 1 }
    }

    setCurrentTab(state, { id: 2 })
    expect(state.currentTab).to.eql({ id: 2 })
  })

  it('updatePredefinedInquiries - single', () => {
    const inquiry = {
      id: 1,
      name: 'foo',
      query: 'SELECT * FROM foo',
      viewType: 'chart',
      viewOptions: {},
      createdAt: '2020-11-07T20:57:04.492Z'
    }

    const state = {
      predefinedInquiries: []
    }

    updatePredefinedInquiries(state, inquiry)
    expect(state.predefinedInquiries).to.eql([inquiry])
  })

  it('updatePredefinedInquiries - array', () => {
    const inquiries = [{
      id: 1,
      name: 'foo',
      query: 'SELECT * FROM foo',
      viewType: 'chart',
      viewOptions: {},
      createdAt: '2020-11-07T20:57:04.492Z'
    },
    {
      id: 2,
      name: 'bar',
      query: 'SELECT * FROM bar',
      viewType: 'chart',
      viewOptions: {},
      createdAt: '2020-11-07T20:57:04.492Z'
    }]

    const state = {
      predefinedInquiries: []
    }

    updatePredefinedInquiries(state, inquiries)
    expect(state.predefinedInquiries).to.eql(inquiries)
  })
})
