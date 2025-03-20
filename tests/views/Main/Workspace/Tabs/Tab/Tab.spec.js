import { expect } from 'chai'
import sinon from 'sinon'
import { mount } from '@vue/test-utils'
import mutations from '@/store/mutations'
import { createStore } from 'vuex'
import Tab from '@/views/Main/Workspace/Tabs/Tab'
import { nextTick } from 'vue'

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

  it('Renders passed query', async () => {
    // mock store state
    const state = {
      currentTabId: 1,
      isWorkspaceVisible: true
    }
    const store = createStore({ state, mutations })

    // mount the component
    const wrapper = mount(Tab, {
      attachTo: place,
      global: {
        stubs: { chart: true, 'icon-button': true },
        plugins: [store]
      },
      props: {
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
    await nextTick()
    expect(wrapper.find('.tab-content-container').isVisible()).to.equal(true)
    expect(wrapper.find('.bottomPane .run-result-panel').exists()).to.equal(
      true
    )
    expect(
      wrapper.find('.run-result-panel .result-before').isVisible()
    ).to.equal(true)
    expect(
      wrapper.find('.above .sql-editor-panel .codemirror-container').text()
    ).to.contain('SELECT * FROM foo')
  })

  it("Doesn't render tab when it's not active", async () => {
    // mock store state
    const state = {
      currentTabId: 0,
      isWorkspaceVisible: true
    }
    const store = createStore({ state, mutations })

    // mount the component
    const wrapper = mount(Tab, {
      attachTo: place,
      global: {
        stubs: { chart: true },
        plugins: [store]
      },
      props: {
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
    await nextTick()
    expect(wrapper.find('.tab-content-container').isVisible()).to.equal(false)
  })

  it('Is not visible when not active', async () => {
    // mock store state
    const state = {
      currentTabId: 0,
      isWorkspaceVisible: true
    }

    const store = createStore({ state, mutations })

    // mount the component
    const wrapper = mount(Tab, {
      attachTo: place,
      global: {
        stubs: { chart: true },
        plugins: [store]
      },
      props: {
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
    await nextTick()
    expect(wrapper.find('.tab-content-container').isVisible()).to.equal(false)
  })

  it('Updates tab state when a query is changed', async () => {
    // mock store state
    const state = {
      isWorkspaceVisible: true,
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

    const store = createStore({ state, mutations })

    // mount the component
    const wrapper = mount(Tab, {
      attachTo: place,
      global: {
        stubs: { chart: true },
        plugins: [store]
      },
      props: {
        tab: store.state.tabs[0]
      }
    })
    await nextTick()
    await wrapper.findComponent({ name: 'SqlEditor' }).setValue(' limit 100')
    expect(store.state.tabs[0].isSaved).to.equal(false)
  })

  it('Updates tab state when data view settings are changed', async () => {
    // mock store state
    const state = {
      isWorkspaceVisible: true,
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

    const store = createStore({ state, mutations })

    // mount the component
    const wrapper = mount(Tab, {
      attachTo: place,
      global: {
        stubs: { chart: true },
        plugins: [store]
      },
      props: {
        tab: store.state.tabs[0]
      }
    })
    await nextTick()
    await wrapper.findComponent({ name: 'DataView' }).vm.$emit('update')
    expect(store.state.tabs[0].isSaved).to.equal(false)
  })

  it('Shows .result-in-progress message when executing query', async () => {
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

    // mock store state
    const state = {
      currentTabId: 1,
      isWorkspaceVisible: true,
      tabs: [tab]
    }

    const store = createStore({ state, mutations })
    // mount the component
    const wrapper = mount(Tab, {
      attachTo: place,
      global: {
        stubs: { chart: true, 'icon-button': true },
        plugins: [store]
      },
      props: {
        tab
      }
    })
    await nextTick()

    store.state.tabs[0].isGettingResults = true
    await nextTick()
    expect(
      wrapper.find('.run-result-panel .result-in-progress').exists()
    ).to.equal(true)
  })

  it('Shows error when executing query ends with error', async () => {
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

    // mock store state
    const state = {
      currentTabId: 1,
      isWorkspaceVisible: true,
      tabs: [tab]
    }

    const store = createStore({ state, mutations })

    // mount the component
    const wrapper = mount(Tab, {
      attachTo: place,
      global: {
        stubs: { chart: true, 'icon-button': true },
        plugins: [store]
      },
      props: {
        tab: store.state.tabs[0]
      }
    })
    await nextTick()
    store.state.tabs[0].error = {
      type: 'error',
      message: 'There is no table foo'
    }
    await nextTick()
    expect(
      wrapper.find('.run-result-panel .result-before').isVisible()
    ).to.equal(false)
    expect(
      wrapper.find('.run-result-panel .result-in-progress').exists()
    ).to.equal(false)
    expect(wrapper.findComponent({ name: 'logs' }).isVisible()).to.equal(true)
    expect(wrapper.findComponent({ name: 'logs' }).text()).to.include(
      'There is no table foo'
    )
  })

  it('Passes result to sql-table component', async () => {
    const result = {
      columns: ['id', 'name'],
      values: {
        id: [1, 2],
        name: ['foo', 'bar']
      }
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
    // mock store state
    const state = {
      currentTabId: 1,
      isWorkspaceVisible: true,
      tabs: [tab]
    }

    const store = createStore({ state, mutations })

    // mount the component
    const wrapper = mount(Tab, {
      attachTo: place,
      global: {
        stubs: { chart: true },
        plugins: [store]
      },
      props: {
        tab
      }
    })
    await nextTick()
    store.state.tabs[0].result = result
    await nextTick()
    expect(
      wrapper.find('.run-result-panel .result-before').isVisible()
    ).to.equal(false)
    expect(
      wrapper.find('.run-result-panel .result-in-progress').exists()
    ).to.equal(false)
    expect(wrapper.findComponent({ name: 'logs' }).exists()).to.equal(false)
    expect(wrapper.findComponent({ name: 'SqlTable' }).vm.dataSet).to.eql(
      result
    )
  })

  it('Switches views', async () => {
    const state = {
      currentTabId: 1,
      isWorkspaceVisible: true
    }

    const store = createStore({ state, mutations })

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
      global: {
        stubs: { chart: true },
        plugins: [store]
      },
      props: {
        tab
      }
    })

    let tableBtn = wrapper
      .find('.above .side-tool-bar')
      .findComponent({ ref: 'tableBtn' })
    await tableBtn.vm.$emit('click')

    expect(wrapper.find('.bottomPane .sql-editor-panel').exists()).to.equal(
      true
    )
    expect(wrapper.find('.above .run-result-panel').exists()).to.equal(true)

    const dataViewBtn = wrapper
      .find('.above .side-tool-bar')
      .findComponent({ ref: 'dataViewBtn' })
    await dataViewBtn.vm.$emit('click')

    expect(wrapper.find('.bottomPane .sql-editor-panel').exists()).to.equal(
      true
    )
    expect(wrapper.find('.above .data-view-panel').exists()).to.equal(true)

    const sqlEditorBtn = wrapper
      .find('.above .side-tool-bar')
      .findComponent({ ref: 'sqlEditorBtn' })
    await sqlEditorBtn.vm.$emit('click')

    expect(wrapper.find('.above .sql-editor-panel').exists()).to.equal(true)
    expect(wrapper.find('.bottomPane .data-view-panel').exists()).to.equal(true)

    tableBtn = wrapper
      .find('.bottomPane .side-tool-bar')
      .findComponent({ ref: 'tableBtn' })
    await tableBtn.vm.$emit('click')

    expect(wrapper.find('.above .sql-editor-panel').exists()).to.equal(true)
    expect(wrapper.find('.bottomPane .run-result-panel').exists()).to.equal(
      true
    )
  })

  it('Maximize top panel if maximized panel is above', async () => {
    const state = {
      currentTabId: 1,
      isWorkspaceVisible: true
    }
    const store = createStore({ state, mutations })
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
      global: {
        stubs: { chart: true },
        plugins: [store]
      },
      props: {
        tab
      }
    })
    await nextTick()

    expect(wrapper.find('.above').element.parentElement.style.height).to.equal(
      '100%'
    )
  })

  it('Maximize bottom panel if maximized panel is below', async () => {
    const state = {
      currentTabId: 1,
      isWorkspaceVisible: true
    }
    const store = createStore({ state, mutations })
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
      global: {
        stubs: { chart: true },
        plugins: [store]
      },
      props: {
        tab
      }
    })
    await nextTick()
    expect(
      wrapper.find('.bottomPane').element.parentElement.style.height
    ).to.equal('100%')
  })

  it('Panel size is 50 if nothing to maximize', async () => {
    const state = {
      currentTabId: 1,
      isWorkspaceVisible: true
    }
    const store = createStore({ state, mutations })
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
      global: {
        stubs: { chart: true },
        plugins: [store]
      },
      props: {
        tab
      }
    })

    await nextTick()
    expect(wrapper.find('.above').element.parentElement.style.height).to.equal(
      '50%'
    )
    expect(
      wrapper.find('.bottomPane').element.parentElement.style.height
    ).to.equal('50%')
  })
})
