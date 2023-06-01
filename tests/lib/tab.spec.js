import { expect } from 'chai'
import sinon from 'sinon'
import Tab from '@/lib/tab.js'

describe('tab.js', () => {
  it('Creates a tab for new inquiry', () => {
    const state = {
      untitledLastIndex: 5
    }

    const newTab = new Tab(state)
    expect(newTab).to.include({
      name: null,
      tempName: 'Untitled 5',
      query: undefined,
      viewOptions: undefined,
      isPredefined: undefined,
      viewType: 'chart',
      result: null,
      isGettingResults: false,
      error: null,
      time: 0,
      isSaved: false,
      state: state
    })
    expect(newTab.layout).to.include({
      sqlEditor: 'above',
      table: 'bottom',
      dataView: 'hidden'
    })
    expect(newTab.id).to.have.lengthOf(21)
  })

  it('Creates a tab for existing inquiry', () => {
    const state = {
      untitledLastIndex: 5
    }

    const inquiry = {
      id: 'qwerty',
      query: 'SELECT * from foo',
      viewType: 'pivot',
      viewOptions: 'this is view options object',
      name: 'Foo inquiry',
      createdAt: '2022-12-05T18:30:30'
    }

    const newTab = new Tab(state, inquiry)
    expect(newTab).to.include({
      id: 'qwerty',
      name: 'Foo inquiry',
      tempName: 'Foo inquiry',
      query: 'SELECT * from foo',
      viewOptions: 'this is view options object',
      isPredefined: undefined,
      viewType: 'pivot',
      result: null,
      isGettingResults: false,
      error: null,
      time: 0,
      isSaved: true,
      state: state
    })
    expect(newTab.layout).to.include({
      sqlEditor: 'above',
      table: 'bottom',
      dataView: 'hidden'
    })
  })

  it('Set isGettingResults true when execute', async () => {
    let resolveQuering
    // mock store state
    const state = {
      currentTabId: 1,
      dbName: 'fooDb',
      db: {
        execute: sinon.stub().returns(new Promise(resolve => {
          resolveQuering = resolve
        })),
        refreshSchema: sinon.stub().resolves()
      }
    }

    const newTab = new Tab(state, {
      id: 'qwerty',
      query: 'SELECT * FROM foo; CREATE TABLE bar(a,b);',
      viewType: 'cart',
      viewOptions: 'this is view options object',
      name: 'Foo inquiry',
      createdAt: '2022-12-05T18:30:30'
    })

    expect(newTab.isGettingResults).to.equal(false)
    newTab.execute()
    expect(newTab.isGettingResults).to.equal(true)
    resolveQuering()
  })

  it('Updates result with query execution result', async () => {
    const result = {
      columns: ['id', 'name'],
      values: {
        id: [1, 2],
        name: ['Harry', 'Drako']
      }
    }

    // mock store state
    const state = {
      currentTabId: 1,
      dbName: 'fooDb',
      db: {
        execute: sinon.stub().resolves(result),
        refreshSchema: sinon.stub().resolves()
      }
    }

    const newTab = new Tab(state, {
      id: 'qwerty',
      query: 'SELECT * FROM foo; CREATE TABLE bar(a,b);',
      viewType: 'cart',
      viewOptions: 'this is view options object',
      name: 'Foo inquiry',
      createdAt: '2022-12-05T18:30:30'
    })

    await newTab.execute()
    expect(newTab.isGettingResults).to.equal(false)
    expect(newTab.result).to.eql(result)
  })

  it('Updates error with query execution error', async () => {
    // mock store state
    const state = {
      currentTabId: 1,
      dbName: 'fooDb',
      db: {
        execute: sinon.stub().rejects(new Error('No such table')),
        refreshSchema: sinon.stub().resolves()
      }
    }

    const newTab = new Tab(state, {
      id: 'qwerty',
      query: 'SELECT * FROM foo; CREATE TABLE bar(a,b);',
      viewType: 'cart',
      viewOptions: 'this is view options object',
      name: 'Foo inquiry',
      createdAt: '2022-12-05T18:30:30'
    })

    await newTab.execute()
    expect(newTab.error.type).to.eql('error')
    expect(newTab.error.message.toString()).to.equal('Error: No such table')
  })

  it('Updates schema after query execution', async () => {
    const result = {
      columns: ['id', 'name'],
      values: {
        id: [],
        name: []
      }
    }

    // mock store state
    const state = {
      currentTabId: 1,
      dbName: 'fooDb',
      db: {
        execute: sinon.stub().resolves(result),
        refreshSchema: sinon.stub().resolves()
      }
    }

    const newTab = new Tab(state, {
      id: 'qwerty',
      query: 'SELECT * FROM foo; CREATE TABLE bar(a,b);',
      viewType: 'cart',
      viewOptions: 'this is view options object',
      name: 'Foo inquiry',
      createdAt: '2022-12-05T18:30:30'
    })

    await newTab.execute()
    expect(state.db.refreshSchema.calledOnce).to.equal(true)
  })
})
