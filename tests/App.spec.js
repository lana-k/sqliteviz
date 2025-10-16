import { expect } from 'chai'
import sinon from 'sinon'
import { shallowMount, mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import App from '@/App.vue'
import storedInquiries from '@/lib/storedInquiries'
import actions from '@/store/actions'
import mutations from '@/store/mutations'
import { nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/router'

describe('App.vue', () => {
  let clock

  beforeEach(() => {
    clock = sinon.useFakeTimers()
  })

  afterEach(() => {
    sinon.restore()
  })

  it('Gets inquiries', () => {
    sinon
      .stub(storedInquiries, 'getStoredInquiries')
      .returns([{ id: 1 }, { id: 2 }, { id: 3 }])
    const state = {
      predefinedInquiries: [],
      inquiries: []
    }
    const store = createStore({ state, mutations })
    shallowMount(App, {
      global: {
        stubs: ['router-view'],
        plugins: [store]
      }
    })

    expect(state.inquiries).to.eql([{ id: 1 }, { id: 2 }, { id: 3 }])
  })

  it('Updates inquiries when they change in store', async () => {
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([
      { id: 1, name: 'foo' },
      { id: 2, name: 'baz' },
      { id: 3, name: 'bar' }
    ])
    sinon.spy(storedInquiries, 'updateStorage')

    const state = {
      predefinedInquiries: [],
      inquiries: []
    }
    const store = createStore({ state, mutations })
    shallowMount(App, {
      global: { stubs: ['router-view'], plugins: [store] }
    })

    store.state.inquiries.splice(0, 1, { id: 1, name: 'new foo name' })
    await nextTick()

    expect(storedInquiries.updateStorage.calledTwice).to.equal(true)

    expect(storedInquiries.updateStorage.args[1][0]).to.eql([
      { id: 1, name: 'new foo name' },
      { id: 2, name: 'baz' },
      { id: 3, name: 'bar' }
    ])
  })

  it('Updates store when inquirires change in local storage', async () => {
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([
      { id: 1, name: 'foo' },
      { id: 2, name: 'baz' },
      { id: 3, name: 'bar' }
    ])

    const state = {
      predefinedInquiries: [],
      inquiries: []
    }
    const store = createStore({ state, mutations })
    shallowMount(App, {
      global: { stubs: ['router-view'], plugins: [store] }
    })

    expect(state.inquiries).to.eql([
      { id: 1, name: 'foo' },
      { id: 2, name: 'baz' },
      { id: 3, name: 'bar' }
    ])

    storedInquiries.getStoredInquiries.returns([
      { id: 1, name: 'foo' },
      { id: 3, name: 'bar' }
    ])
    window.dispatchEvent(new StorageEvent('storage', { key: 'myInquiries' }))
    expect(state.inquiries).to.eql([
      { id: 1, name: 'foo' },
      { id: 3, name: 'bar' }
    ])
  })

  it('Closes with saving and does not change the next tab', async () => {
    const inquiries = [
      {
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
      }
    ]
    sinon.stub(storedInquiries, 'getStoredInquiries').returns(inquiries)
    const tab1 = {
      id: 1,
      name: 'foo',
      query: 'select * from foo',
      viewType: 'chart',
      viewOptions: {},
      layout: {
        sqlEditor: 'above',
        table: 'bottom',
        dataView: 'hidden'
      },
      result: {
        columns: ['name', 'points'],
        values: {
          name: ['Gryffindor', 'Hufflepuff', 'Ravenclaw', 'Slytherin'],
          points: [100, 90, 95, 80]
        }
      },
      isSaved: false
    }
    const tab2 = {
      id: 2,
      name: 'bar',
      query: 'SELECT * FROM bar',
      viewType: 'chart',
      viewOptions: {},
      layout: {
        sqlEditor: 'above',
        table: 'hidden',
        dataView: 'bottom'
      },
      result: {
        columns: ['id'],
        values: {
          id: [1, 2, 3]
        }
      },
      isSaved: true
    }
    // mock store state
    const state = {
      tabs: [tab1, tab2],
      currentTabId: 1,
      currentTab: tab1,
      db: {},
      inquiries
    }

    const store = createStore({ state, mutations, actions })
    const router = createRouter({
      history: createWebHistory(),
      routes: routes
    })
    router.push('/workspace')

    // After this line, router is ready
    await router.isReady()

    const wrapper = mount(App, {
      attachTo: document.body,
      global: {
        stubs: {
          'router-link': true,
          teleport: true,
          transition: false,
          schema: true,
          AppDiagnosticInfo: true,
          DataView: {
            template: '<div></div>',
            methods: { getOptionsForSave: sinon.stub() }
          }
        },
        plugins: [store, router]
      }
    })
    // click on the close icon of the first tab
    const firstTabCloseIcon = wrapper.findAll('.tab')[0].find('.close-icon')
    await firstTabCloseIcon.trigger('click')

    // find 'Save and close' in the dialog
    const closeBtn = wrapper
      .findAll('.dialog-buttons-container button')
      .find(button => button.text() === 'Save and close')

    // click 'Save and close' in the dialog
    await closeBtn.trigger('click')

    await nextTick()
    await nextTick()

    // check that tab is closed
    expect(wrapper.findAllComponents({ name: 'Tab' })).to.have.lengthOf(1)
    // check that the open tab didn't change
    const firstTab = wrapper.findComponent({ name: 'Tab' })
    expect(firstTab.props('tab').name).to.equal('bar')
    expect(firstTab.props('tab').result).to.eql({
      columns: ['id'],
      values: {
        id: [1, 2, 3]
      }
    })
    expect(firstTab.props('tab')).to.eql(tab2)

    // check that the dialog is closed
    await clock.tick(100)
    await nextTick()
    expect(wrapper.find('.dialog.vfm .vfm__content').exists()).to.equal(false)
    wrapper.unmount()
  })
})
