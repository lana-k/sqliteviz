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
        tab: {
          id: 1,
          name: 'foo',
          query: 'SELECT * FROM foo',
          viewType: 'chart',
          viewOptions: {},
          layout: {
            sqlEditor: 'above',
            table: 'bottom',
            dataView: 'hidden'
          },
          isPredefined: false,
          result: null,
          isGettingResults: false,
          error: null,
          time: 0
        }
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
        tab: {
          id: 1,
          name: 'foo',
          query: 'SELECT * FROM foo',
          viewType: 'chart',
          viewOptions: {},
          layout: {
            sqlEditor: 'above',
            table: 'bottom',
            dataView: 'hidden'
          },
          isPredefined: false,
          result: null,
          isGettingResults: false,
          error: null,
          time: 0
        }
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
        tab: {
          id: 1,
          name: 'foo',
          query: 'SELECT * FROM foo',
          viewType: 'chart',
          viewOptions: {},
          layout: {
            sqlEditor: 'above',
            table: 'bottom',
            dataView: 'hidden'
          },
          isPredefined: false,
          result: null,
          isGettingResults: false,
          error: null,
          time: 0
        }
      }
    })

    expect(wrapper.find('.tab-content-container').isVisible()).to.equal(false)
  })

  it('Update tab state when a query is changed', async () => {
    // mock store state
    const state = {
      tabs: [
        {
          id: 1,
          name: 'foo',
          query: 'SELECT * FROM foo',
          viewType: 'chart',
          viewOptions: {},
          layout: {
            sqlEditor: 'above',
            table: 'bottom',
            dataView: 'hidden'
          },
          isPredefined: false,
          result: null,
          isGettingResults: false,
          error: null,
          time: 0,
          isSaved: true
        }
      ],
      currentTabId: 1
    }

    const store = new Vuex.Store({ state, mutations })

    // mount the component
    const wrapper = mount(Tab, {
      store,
      stubs: ['chart'],
      propsData: {
        tab: state.tabs[0]
      }
    })
    await wrapper.findComponent({ name: 'SqlEditor' }).vm.$emit('input', ' limit 100')
    expect(state.tabs[0].isSaved).to.equal(false)
  })

  it('Update tab state when data view settings are changed', async () => {
    // mock store state
    const state = {
      tabs: [
        {
          id: 1,
          name: 'foo',
          query: 'SELECT * FROM foo',
          viewType: 'chart',
          viewOptions: {},
          layout: {
            sqlEditor: 'above',
            table: 'bottom',
            dataView: 'hidden'
          },
          isPredefined: false,
          result: null,
          isGettingResults: false,
          error: null,
          time: 0,
          isSaved: true
        }
      ],
      currentTabId: 1
    }

    const store = new Vuex.Store({ state, mutations })

    // mount the component
    const wrapper = mount(Tab, {
      store,
      stubs: ['chart'],
      propsData: {
        tab: state.tabs[0]
      }
    })
    await wrapper.findComponent({ name: 'DataView' }).vm.$emit('update')
    expect(state.tabs[0].isSaved).to.equal(false)
  })

  it('Shows .result-in-progress message when executing query', async () => {
    // mock store state
    const state = {
      currentTabId: 1
    }

    const store = new Vuex.Store({ state, mutations })
    // mount the component
    const tab = {
      id: 1,
      name: 'foo',
      query: 'SELECT * FROM foo',
      viewType: 'chart',
      viewOptions: {},
      layout: {
        sqlEditor: 'above',
        table: 'bottom',
        dataView: 'hidden'
      },
      isPredefined: false,
      result: null,
      isGettingResults: false,
      error: null,
      time: 0,
      isSaved: true
    }
    const wrapper = mount(Tab, {
      store,
      stubs: ['chart'],
      propsData: {
        tab
      }
    })

    tab.isGettingResults = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.run-result-panel .result-in-progress').isVisible()).to.equal(true)
  })

  it('Shows error when executing query ends with error', async () => {
    // mock store state
    const state = {
      currentTabId: 1
    }

    const store = new Vuex.Store({ state, mutations })
    const tab = {
      id: 1,
      name: 'foo',
      query: 'SELECT * FROM foo',
      viewType: 'chart',
      viewOptions: {},
      layout: {
        sqlEditor: 'above',
        table: 'bottom',
        dataView: 'hidden'
      },
      isPredefined: false,
      result: null,
      isGettingResults: false,
      error: null,
      time: 0,
      isSaved: true
    }
    // mount the component
    const wrapper = mount(Tab, {
      store,
      stubs: ['chart'],
      propsData: {
        tab
      }
    })

    tab.error = {
      type: 'error',
      message: 'There is no table foo'
    }
    await wrapper.vm.$nextTick()
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
      currentTabId: 1
    }

    const tab = {
      id: 1,
      name: 'foo',
      query: 'SELECT * FROM foo',
      viewType: 'chart',
      viewOptions: {},
      layout: {
        sqlEditor: 'above',
        table: 'bottom',
        dataView: 'hidden'
      },
      isPredefined: false,
      result: null,
      isGettingResults: false,
      error: null,
      time: 0,
      isSaved: true
    }

    const store = new Vuex.Store({ state, mutations })

    // mount the component
    const wrapper = mount(Tab, {
      store,
      stubs: ['chart'],
      propsData: {
        tab
      }
    })

    tab.result = result
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.run-result-panel .result-before').isVisible()).to.equal(false)
    expect(wrapper.find('.run-result-panel .result-in-progress').exists()).to.equal(false)
    expect(wrapper.findComponent({ name: 'logs' }).exists()).to.equal(false)
    expect(wrapper.findComponent({ name: 'SqlTable' }).vm.dataSet).to.eql(result)
  })

  it('Switches views', async () => {
    const state = {
      currentTabId: 1
    }

    const store = new Vuex.Store({ state, mutations })

    const tab = {
      id: 1,
      name: 'foo',
      query: 'SELECT * FROM foo; CREATE TABLE bar(a,b);',
      viewType: 'chart',
      viewOptions: {},
      layout: {
        sqlEditor: 'above',
        table: 'bottom',
        dataView: 'hidden'
      },
      isPredefined: false,
      result: null,
      isGettingResults: false,
      error: null,
      time: 0,
      isSaved: true
    }

    const wrapper = mount(Tab, {
      attachTo: place,
      store,
      stubs: ['chart'],
      propsData: {
        tab
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

  it('Maximize top panel if maximized panel is above', () => {
    const state = {
      currentTabId: 1
    }
    const store = new Vuex.Store({ state, mutations })
    const tab = {
      id: 1,
      name: 'foo',
      query: 'SELECT * FROM foo; CREATE TABLE bar(a,b);',
      viewType: 'chart',
      viewOptions: {},
      layout: {
        sqlEditor: 'above',
        table: 'bottom',
        dataView: 'hidden'
      },
      maximize: 'sqlEditor',
      isPredefined: false,
      result: null,
      isGettingResults: false,
      error: null,
      time: 0,
      isSaved: true
    }

    const wrapper = mount(Tab, {
      attachTo: place,
      store,
      stubs: ['chart'],
      propsData: {
        tab
      }
    })

    expect(wrapper.find('.above').element.parentElement.style.height)
      .to.equal('100%')
  })

  it('Maximize bottom panel if maximized panel is below', () => {
    const state = {
      currentTabId: 1
    }
    const store = new Vuex.Store({ state, mutations })
    const tab = {
      id: 1,
      name: 'foo',
      query: 'SELECT * FROM foo; CREATE TABLE bar(a,b);',
      viewType: 'chart',
      viewOptions: {},
      layout: {
        sqlEditor: 'above',
        table: 'bottom',
        dataView: 'hidden'
      },
      maximize: 'table',
      isPredefined: false,
      result: null,
      isGettingResults: false,
      error: null,
      time: 0,
      isSaved: true
    }

    const wrapper = mount(Tab, {
      attachTo: place,
      store,
      stubs: ['chart'],
      propsData: {
        tab
      }
    })

    expect(wrapper.find('.bottomPane').element.parentElement.style.height)
      .to.equal('100%')
  })

  it('Panel size is 50 is nothing to maximize', () => {
    const state = {
      currentTabId: 1
    }
    const store = new Vuex.Store({ state, mutations })
    const tab = {
      id: 1,
      name: 'foo',
      query: 'SELECT * FROM foo; CREATE TABLE bar(a,b);',
      viewType: 'chart',
      viewOptions: {},
      layout: {
        sqlEditor: 'above',
        table: 'bottom',
        dataView: 'hidden'
      },
      isPredefined: false,
      result: null,
      isGettingResults: false,
      error: null,
      time: 0,
      isSaved: true
    }

    const wrapper = mount(Tab, {
      attachTo: place,
      store,
      stubs: ['chart'],
      propsData: {
        tab
      }
    })

    expect(wrapper.find('.above').element.parentElement.style.height)
      .to.equal('50%')
    expect(wrapper.find('.bottomPane').element.parentElement.style.height)
      .to.equal('50%')
  })
})
