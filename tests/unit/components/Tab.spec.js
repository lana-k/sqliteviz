import { expect } from 'chai'
import sinon from 'sinon'
import { mount } from '@vue/test-utils'
import { mutations } from '@/store'
import Vuex from 'vuex'
import Tab from '@/components/Tab.vue'

describe('Tab.vue', () => {
  it('Renders passed query', () => {
    // mock store state
    const state = {
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
        initChart: [],
        tabIndex: 0,
        isPredefined: false
      }
    })
    expect(wrapper.find('.tab-content-container').isVisible()).to.equal(true)
    expect(wrapper.find('.table-view').isVisible()).to.equal(true)
    expect(wrapper.find('.table-view .result-before').isVisible()).to.equal(true)
    expect(wrapper.find('.query-editor').text()).to.equal('SELECT * FROM foo')
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

  it("Shows chart when view equals 'chart'", async () => {
    // mock store state
    const state = {
      currentTabId: 1
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

    expect(wrapper.findComponent({ ref: 'chart' }).vm.visible).to.equal(false)
    await wrapper.setData({ view: 'chart' })
    expect(wrapper.find('.table-view').isVisible()).to.equal(false)
    expect(wrapper.findComponent({ ref: 'chart' }).vm.visible).to.equal(true)
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
    expect(mutations.setCurrentTab.calledOnceWith(state, wrapper.vm)).to.equal(true)
  })

  it('Update tab state when a query is changed', async () => {
    // mock store state
    const state = {
      tabs: [
        { id: 1, name: 'foo', query: 'SELECT * FROM foo', chart: [], isUnsaved: false }
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
        initChart: [],
        tabIndex: 0,
        isPredefined: false
      }
    })
    await wrapper.findComponent({ name: 'SqlEditor' }).vm.$emit('input', ' limit 100')
    expect(state.tabs[0].isUnsaved).to.equal(true)
  })

  it('Shows .result-in-progress message when executing query', (done) => {
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
        initChart: [],
        tabIndex: 0,
        isPredefined: false
      }
    })

    wrapper.vm.execute()
    wrapper.vm.$nextTick(() => {
      expect(wrapper.find('.table-view .result-before').isVisible()).to.equal(false)
      expect(wrapper.find('.table-view .result-in-progress').isVisible()).to.equal(true)
    })
    done()
  })

  it('Shows error when executing query ends with error', async () => {
    // mock store state
    const state = {
      currentTabId: 1,
      db: {
        execute () { return Promise.reject(new Error('There is no table foo')) }
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
        initChart: [],
        tabIndex: 0,
        isPredefined: false
      }
    })

    await wrapper.vm.execute()
    expect(wrapper.find('.table-view .result-before').isVisible()).to.equal(false)
    expect(wrapper.find('.table-view .result-in-progress').isVisible()).to.equal(false)
    expect(wrapper.find('.table-preview.error').isVisible()).to.equal(true)
    expect(wrapper.find('.table-preview.error').text()).to.include('There is no table foo')
  })

  it('Passes result to sql-table component', async () => {
    // mock store state
    const state = {
      currentTabId: 1,
      db: {
        execute () { return Promise.resolve(result) }
      }
    }

    const store = new Vuex.Store({ state, mutations })
    const result = {
      columns: ['id', 'name'],
      values: [
        [1, 'foo'],
        [2, 'bar']
      ]
    }

    // mount the component
    const wrapper = mount(Tab, {
      store,
      stubs: ['chart'],
      propsData: {
        id: 1,
        initName: 'foo',
        initQuery: 'SELECT * FROM foo',
        initChart: [],
        tabIndex: 0,
        isPredefined: false
      }
    })

    await wrapper.vm.execute()
    expect(wrapper.find('.table-view .result-before').isVisible()).to.equal(false)
    expect(wrapper.find('.table-view .result-in-progress').isVisible()).to.equal(false)
    expect(wrapper.find('.table-preview.error').isVisible()).to.equal(false)
    expect(wrapper.findComponent({ name: 'SqlTable' }).vm.dataSet).to.eql(result)
  })
})
