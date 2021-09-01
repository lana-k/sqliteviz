import { expect } from 'chai'
import sinon from 'sinon'
import { mount, createWrapper } from '@vue/test-utils'
import mutations from '@/store/mutations'
import Vuex from 'vuex'
import Tab from '@/views/Main/Workspace/Tabs/Tab'

let place

describe('Tab.vue', () => {
  beforeEach(() => {
    place = document.createElement('div')
    document.body.appendChild(place)
  })

  afterEach(() => {
    sinon.restore()
    place.remove()
  })

  it('Renders passed query', () => {
    // mock store state
    const state = {
      currentTabId: 1
    }
    const store = new Vuex.Store({ state, mutations })

    // mount the component
    const wrapper = mount(Tab, {
      attachTo: place,
      store,
      stubs: ['chart'],
      propsData: {
        id: 1,
        initName: 'foo',
        initQuery: 'SELECT * FROM foo',
        initViewType: 'chart',
        initViewOptions: [],
        tabIndex: 0,
        isPredefined: false
      }
    })

    expect(wrapper.find('.tab-content-container').isVisible()).to.equal(true)
    expect(wrapper.find('.bottomPane .run-result-panel').exists()).to.equal(true)
    expect(wrapper.find('.run-result-panel .result-before').isVisible()).to.equal(true)
    expect(wrapper.find('.above .sql-editor-panel .codemirror-container').text())
      .to.equal('SELECT * FROM foo')
  })

  it("Doesn't render tab when it's not active", () => {
    // mock store state
    const state = {
      currentTabId: 0
    }
    const store = new Vuex.Store({ state, mutations })

    // mount the component
    const wrapper = mount(Tab, {
      store,
      stubs: ['chart'],
      propsData: {
        id: 1
      }
    })
    expect(wrapper.find('.tab-content-container').isVisible()).to.equal(false)
  })

  it('Is not visible when not active', async () => {
    // mock store state
    const state = {
      currentTabId: 0
    }

    const store = new Vuex.Store({ state, mutations })

    // mount the component
    const wrapper = mount(Tab, {
      store,
      stubs: ['chart'],
      propsData: {
        id: 1
      }
    })

    expect(wrapper.find('.tab-content-container').isVisible()).to.equal(false)
  })

  it('Calls setCurrentTab when becomes active', async () => {
    // mock store state
    const state = {
      currentTabId: 0
    }
    sinon.spy(mutations, 'setCurrentTab')
    const store = new Vuex.Store({ state, mutations })

    // mount the component
    const wrapper = mount(Tab, {
      store,
      stubs: ['chart'],
      propsData: {
        id: 1
      }
    })

    state.currentTabId = 1
    await wrapper.vm.$nextTick()
    expect(mutations.setCurrentTab.calledOnceWith(state, wrapper.vm)).to.equal(true)
  })

  it('Update tab state when a query is changed', async () => {
    // mock store state
    const state = {
      tabs: [
        { id: 1, name: 'foo', query: 'SELECT * FROM foo', chart: [], isSaved: true }
      ],
      currentTabId: 1
    }

    const store = new Vuex.Store({ state, mutations })

    // mount the component
    const wrapper = mount(Tab, {
      store,
      stubs: ['chart'],
      propsData: {
        id: 1,
        initName: 'foo',
        initQuery: 'SELECT * FROM foo',
        initViewOptions: [],
        initViewType: 'chart',
        tabIndex: 0,
        isPredefined: false
      }
    })
    await wrapper.findComponent({ name: 'SqlEditor' }).vm.$emit('input', ' limit 100')
    expect(state.tabs[0].isSaved).to.equal(false)
  })

  it('Update tab state when data view settings are changed', async () => {
    // mock store state
    const state = {
      tabs: [
        { id: 1, name: 'foo', query: 'SELECT * FROM foo', chart: [], isSaved: true }
      ],
      currentTabId: 1
    }

    const store = new Vuex.Store({ state, mutations })

    // mount the component
    const wrapper = mount(Tab, {
      store,
      stubs: ['chart'],
      propsData: {
        id: 1,
        initName: 'foo',
        initQuery: 'SELECT * FROM foo',
        initViewOptions: [],
        initViewType: 'chart',
        tabIndex: 0,
        isPredefined: false
      }
    })
    await wrapper.findComponent({ name: 'DataView' }).vm.$emit('update')
    expect(state.tabs[0].isSaved).to.equal(false)
  })

  it('Shows .result-in-progress message when executing query', async () => {
    // mock store state
    const state = {
      currentTabId: 1,
      db: {
        execute () { return new Promise(() => {}) }
      }
    }

    const store = new Vuex.Store({ state, mutations })
    // mount the component
    const wrapper = mount(Tab, {
      store,
      stubs: ['chart'],
      propsData: {
        id: 1,
        initName: 'foo',
        initQuery: 'SELECT * FROM foo',
        initViewOptions: [],
        initViewType: 'chart',
        tabIndex: 0,
        isPredefined: false
      }
    })

    wrapper.vm.execute()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.run-result-panel .result-in-progress').isVisible()).to.equal(true)
  })

  it('Shows error when executing query ends with error', async () => {
    // mock store state
    const state = {
      currentTabId: 1,
      db: {
        execute: sinon.stub().rejects(new Error('There is no table foo')),
        refreshSchema: sinon.stub().resolves()
      }
    }

    const store = new Vuex.Store({ state, mutations })
    // mount the component
    const wrapper = mount(Tab, {
      store,
      stubs: ['chart'],
      propsData: {
        id: 1,
        initName: 'foo',
        initQuery: 'SELECT * FROM foo',
        initViewOptions: [],
        initViewType: 'chart',
        tabIndex: 0,
        isPredefined: false
      }
    })

    await wrapper.vm.execute()
    expect(wrapper.find('.run-result-panel .result-before').isVisible()).to.equal(false)
    expect(wrapper.find('.run-result-panel .result-in-progress').exists()).to.equal(false)
    expect(wrapper.findComponent({ name: 'logs' }).isVisible()).to.equal(true)
    expect(wrapper.findComponent({ name: 'logs' }).text()).to.include('There is no table foo')
  })

  it('Passes result to sql-table component', async () => {
    const result = {
      columns: ['id', 'name'],
      values: {
        id: [1, 2],
        name: ['foo', 'bar']
      }
    }
    // mock store state
    const state = {
      currentTabId: 1,
      db: {
        execute: sinon.stub().resolves(result),
        refreshSchema: sinon.stub().resolves()
      }
    }

    const store = new Vuex.Store({ state, mutations })

    // mount the component
    const wrapper = mount(Tab, {
      store,
      stubs: ['chart'],
      propsData: {
        id: 1,
        initName: 'foo',
        initQuery: 'SELECT * FROM foo',
        initViewOptions: [],
        initViewType: 'chart',
        tabIndex: 0,
        isPredefined: false
      }
    })

    await wrapper.vm.execute()
    expect(wrapper.find('.run-result-panel .result-before').isVisible()).to.equal(false)
    expect(wrapper.find('.run-result-panel .result-in-progress').exists()).to.equal(false)
    expect(wrapper.findComponent({ name: 'logs' }).exists()).to.equal(false)
    expect(wrapper.findComponent({ name: 'SqlTable' }).vm.dataSet).to.eql(result)
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

    const store = new Vuex.Store({ state, mutations })

    // mount the component
    const wrapper = mount(Tab, {
      store,
      stubs: ['chart'],
      propsData: {
        id: 1,
        initName: 'foo',
        initQuery: 'SELECT * FROM foo; CREATE TABLE bar(a,b);',
        initViewOptions: [],
        initViewType: 'chart',
        tabIndex: 0,
        isPredefined: false
      }
    })

    await wrapper.vm.execute()
    expect(state.db.refreshSchema.calledOnce).to.equal(true)
  })

  it('Switches views', async () => {
    const state = {
      currentTabId: 1,
      db: {}
    }

    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(Tab, {
      attachTo: place,
      store,
      stubs: ['chart'],
      propsData: {
        id: 1,
        initName: 'foo',
        initQuery: 'SELECT * FROM foo; CREATE TABLE bar(a,b);',
        initViewOptions: [],
        initViewType: 'chart',
        tabIndex: 0,
        isPredefined: false
      }
    })

    let tableBtn = createWrapper(wrapper.find('.above .side-tool-bar')
      .findComponent({ name: 'tableIcon' }).vm.$parent)
    await tableBtn.trigger('click')

    expect(wrapper.find('.bottomPane .sql-editor-panel').exists()).to.equal(true)
    expect(wrapper.find('.above .run-result-panel').exists()).to.equal(true)

    const dataViewBtn = createWrapper(wrapper.find('.above .side-tool-bar')
      .findComponent({ name: 'dataViewIcon' }).vm.$parent)
    await dataViewBtn.trigger('click')

    expect(wrapper.find('.bottomPane .sql-editor-panel').exists()).to.equal(true)
    expect(wrapper.find('.above .data-view-panel').exists()).to.equal(true)

    const sqlEditorBtn = createWrapper(wrapper.find('.above .side-tool-bar')
      .findComponent({ name: 'sqlEditorIcon' }).vm.$parent)
    await sqlEditorBtn.trigger('click')

    expect(wrapper.find('.above .sql-editor-panel').exists()).to.equal(true)
    expect(wrapper.find('.bottomPane .data-view-panel').exists()).to.equal(true)

    tableBtn = createWrapper(wrapper.find('.bottomPane .side-tool-bar')
      .findComponent({ name: 'tableIcon' }).vm.$parent)
    await tableBtn.trigger('click')

    expect(wrapper.find('.above .sql-editor-panel').exists()).to.equal(true)
    expect(wrapper.find('.bottomPane .run-result-panel').exists()).to.equal(true)
  })
})
