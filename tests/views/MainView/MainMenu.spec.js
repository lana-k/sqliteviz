import { expect } from 'chai'
import sinon from 'sinon'
import { mount, shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'
import MainMenu from '@/views/MainView/MainMenu'
import storedInquiries from '@/lib/storedInquiries'
import { nextTick } from 'vue'
import eventBus from '@/lib/eventBus'

let wrapper = null

describe('MainMenu.vue', () => {
  let clock

  beforeEach(() => {
    clock = sinon.useFakeTimers()
    sinon.spy(eventBus, '$emit')
    sinon.spy(eventBus, '$off')
  })

  afterEach(() => {
    sinon.restore()

    // We need explicitly destroy the component, so that beforeUnmount hook was called
    // It's important because in this hook MainMenu component removes keydown event listener.
    wrapper.unmount()
  })

  it('Create, Save and Save as are visible only on /workspace page', async () => {
    const state = {
      currentTab: { query: '', execute: sinon.stub() },
      tabs: [{}],
      db: {}
    }
    const store = createStore({ state })
    const $route = { path: '/workspace' }
    // mount the component on workspace
    wrapper = shallowMount(MainMenu, {
      attachTo: document.body,
      global: {
        mocks: { $route },
        stubs: ['router-link'],
        plugins: [store]
      }
    })
    expect(wrapper.find('#save-btn').exists()).to.equal(true)
    expect(wrapper.find('#save-btn').isVisible()).to.equal(true)
    expect(wrapper.find('#save-as-btn').exists()).to.equal(true)
    expect(wrapper.find('#save-as-btn').isVisible()).to.equal(true)
    expect(wrapper.find('#create-btn').exists()).to.equal(true)
    expect(wrapper.find('#create-btn').isVisible()).to.equal(true)
    wrapper.unmount()

    $route.path = '/inquiries'
    // mount the component on inquiries
    wrapper = shallowMount(MainMenu, {
      attachTo: document.body,
      global: {
        mocks: { $route },
        stubs: ['router-link'],
        plugins: [store]
      }
    })
    expect(wrapper.find('#save-btn').exists()).to.equal(true)
    expect(wrapper.find('#save-btn').isVisible()).to.equal(false)
    expect(wrapper.find('#create-btn').exists()).to.equal(true)
    expect(wrapper.find('#create-btn').isVisible()).to.equal(true)
  })

  it('Save and Save as are not visible if there is no tabs', () => {
    const state = {
      currentTab: null,
      tabs: [],
      db: {}
    }
    const store = createStore({ state })
    const $route = { path: '/workspace' }
    wrapper = shallowMount(MainMenu, {
      attachTo: document.body,
      global: {
        mocks: { $route },
        stubs: ['router-link'],
        plugins: [store]
      }
    })
    expect(wrapper.find('#save-btn').exists()).to.equal(true)
    expect(wrapper.find('#save-btn').isVisible()).to.equal(false)
    expect(wrapper.find('#save-as-btn').exists()).to.equal(true)
    expect(wrapper.find('#save-as-btn').isVisible()).to.equal(false)
    expect(wrapper.find('#create-btn').exists()).to.equal(true)
    expect(wrapper.find('#create-btn').isVisible()).to.equal(true)
  })

  it('Save is disabled if current tab.isSaved is true', async () => {
    const tab = {
      id: 1,
      query: 'SELECT * FROM foo',
      execute: sinon.stub(),
      isSaved: false
    }
    const state = {
      currentTab: tab,
      tabs: [tab],
      db: {}
    }
    const store = createStore({ state })
    const $route = { path: '/workspace' }

    wrapper = shallowMount(MainMenu, {
      global: {
        mocks: { $route },
        stubs: ['router-link'],
        plugins: [store]
      }
    })
    const vm = wrapper.vm
    expect(wrapper.find('#save-btn').element.disabled).to.equal(false)
    expect(wrapper.find('#save-as-btn').element.disabled).to.equal(false)

    store.state.tabs[0].isSaved = true
    await vm.$nextTick()
    expect(wrapper.find('#save-btn').element.disabled).to.equal(true)
    expect(wrapper.find('#save-as-btn').element.disabled).to.equal(false)
  })

  it('Creates a tab', async () => {
    const tab = {
      query: 'SELECT * FROM foo',
      execute: sinon.stub(),
      isSaved: false
    }
    const state = {
      currentTab: tab,
      tabs: [tab],
      db: {}
    }
    const newInquiryId = 1
    const actions = {
      addTab: sinon.stub().resolves(newInquiryId)
    }
    const mutations = {
      setCurrentTabId: sinon.stub()
    }
    const store = createStore({ state, mutations, actions })
    const $route = { path: '/workspace' }
    const $router = { push: sinon.stub() }

    wrapper = shallowMount(MainMenu, {
      global: {
        mocks: { $route, $router },
        stubs: ['router-link'],
        plugins: [store]
      }
    })

    await wrapper.find('#create-btn').trigger('click')
    expect(actions.addTab.calledOnce).to.equal(true)
    await actions.addTab.returnValues[0]
    expect(
      mutations.setCurrentTabId.calledOnceWith(state, newInquiryId)
    ).to.equal(true)
    expect($router.push.calledOnce).to.equal(false)
  })

  it('Creates a tab and redirects to workspace', async () => {
    const tab = {
      query: 'SELECT * FROM foo',
      execute: sinon.stub(),
      isSaved: false
    }
    const state = {
      currentTab: tab,
      tabs: [tab],
      db: {}
    }
    const newInquiryId = 1
    const actions = {
      addTab: sinon.stub().resolves(newInquiryId)
    }
    const mutations = {
      setCurrentTabId: sinon.stub()
    }
    const store = createStore({ state, mutations, actions })
    const $route = { path: '/inquiries' }
    const $router = { push: sinon.stub() }

    wrapper = shallowMount(MainMenu, {
      global: {
        mocks: { $route, $router },
        stubs: ['router-link'],
        plugins: [store]
      }
    })

    await wrapper.find('#create-btn').trigger('click')
    expect(actions.addTab.calledOnce).to.equal(true)
    await actions.addTab.returnValues[0]
    expect(
      mutations.setCurrentTabId.calledOnceWith(state, newInquiryId)
    ).to.equal(true)
    expect($router.push.calledOnce).to.equal(true)
  })

  it('Ctrl R calls currentTab.execute if running is enabled and route.path is "/workspace"', async () => {
    const tab = {
      query: 'SELECT * FROM foo',
      execute: sinon.stub(),
      isSaved: false
    }
    const state = {
      currentTab: tab,
      tabs: [tab],
      db: {}
    }
    const store = createStore({ state })
    const $route = { path: '/workspace' }
    const $router = { push: sinon.stub() }

    wrapper = shallowMount(MainMenu, {
      global: {
        mocks: { $route, $router },
        stubs: ['router-link'],
        plugins: [store]
      }
    })

    const ctrlR = new KeyboardEvent('keydown', { key: 'r', ctrlKey: true })
    const metaR = new KeyboardEvent('keydown', { key: 'r', metaKey: true })
    // Running is enabled and route path is workspace
    document.dispatchEvent(ctrlR)
    expect(state.currentTab.execute.calledOnce).to.equal(true)
    document.dispatchEvent(metaR)
    expect(state.currentTab.execute.calledTwice).to.equal(true)

    // Running is disabled and route path is workspace
    store.state.db = null
    document.dispatchEvent(ctrlR)
    expect(state.currentTab.execute.calledTwice).to.equal(true)
    document.dispatchEvent(metaR)
    expect(state.currentTab.execute.calledTwice).to.equal(true)

    // Running is enabled and route path is not workspace
    state.db = {}
    wrapper.vm.$route.path = '/inquiries'
    document.dispatchEvent(ctrlR)
    expect(state.currentTab.execute.calledTwice).to.equal(true)
    document.dispatchEvent(metaR)
    expect(state.currentTab.execute.calledTwice).to.equal(true)
  })

  it('Ctrl Enter calls currentTab.execute if running is enabled and route.path is "/workspace"', async () => {
    const tab = {
      query: 'SELECT * FROM foo',
      execute: sinon.stub(),
      isSaved: false
    }
    const state = {
      currentTab: tab,
      tabs: [tab],
      db: {}
    }
    const store = createStore({ state })
    const $route = { path: '/workspace' }
    const $router = { push: sinon.stub() }

    wrapper = shallowMount(MainMenu, {
      global: {
        mocks: { $route, $router },
        stubs: ['router-link'],
        plugins: [store]
      }
    })

    const ctrlEnter = new KeyboardEvent('keydown', {
      key: 'Enter',
      ctrlKey: true
    })
    const metaEnter = new KeyboardEvent('keydown', {
      key: 'Enter',
      metaKey: true
    })
    // Running is enabled and route path is workspace
    document.dispatchEvent(ctrlEnter)
    expect(state.currentTab.execute.calledOnce).to.equal(true)
    document.dispatchEvent(metaEnter)
    expect(state.currentTab.execute.calledTwice).to.equal(true)

    // Running is disabled and route path is workspace
    store.state.db = null
    document.dispatchEvent(ctrlEnter)
    expect(state.currentTab.execute.calledTwice).to.equal(true)
    document.dispatchEvent(metaEnter)
    expect(state.currentTab.execute.calledTwice).to.equal(true)

    // Running is enabled and route path is not workspace
    store.state.db = {}
    wrapper.vm.$route.path = '/inquiries'
    document.dispatchEvent(ctrlEnter)
    expect(state.currentTab.execute.calledTwice).to.equal(true)
    document.dispatchEvent(metaEnter)
    expect(state.currentTab.execute.calledTwice).to.equal(true)
  })

  it('Ctrl B calls createNewInquiry', async () => {
    const tab = {
      query: 'SELECT * FROM foo',
      execute: sinon.stub(),
      isSaved: false
    }
    const state = {
      currentTab: tab,
      tabs: [tab],
      db: {}
    }
    const store = createStore({ state })
    const $route = { path: '/workspace' }

    wrapper = shallowMount(MainMenu, {
      global: {
        mocks: { $route },
        stubs: ['router-link'],
        plugins: [store]
      }
    })
    sinon.stub(wrapper.vm, 'createNewInquiry')

    const ctrlB = new KeyboardEvent('keydown', { key: 'b', ctrlKey: true })
    const metaB = new KeyboardEvent('keydown', { key: 'b', metaKey: true })
    document.dispatchEvent(ctrlB)
    expect(wrapper.vm.createNewInquiry.calledOnce).to.equal(true)
    document.dispatchEvent(metaB)
    expect(wrapper.vm.createNewInquiry.calledTwice).to.equal(true)

    wrapper.vm.$route.path = '/inquiries'
    document.dispatchEvent(ctrlB)
    expect(wrapper.vm.createNewInquiry.calledThrice).to.equal(true)
    document.dispatchEvent(metaB)
    expect(wrapper.vm.createNewInquiry.callCount).to.equal(4)
  })

  it('Ctrl S calls onSave if the tab is unsaved and route path is /workspace', async () => {
    const tab = {
      query: 'SELECT * FROM foo',
      execute: sinon.stub(),
      isSaved: false
    }
    const state = {
      currentTab: tab,
      tabs: [tab],
      db: {}
    }
    const store = createStore({ state })
    const $route = { path: '/workspace' }

    wrapper = shallowMount(MainMenu, {
      global: {
        mocks: { $route },
        stubs: ['router-link'],
        plugins: [store]
      }
    })
    sinon.stub(wrapper.vm, 'onSave')

    const ctrlS = new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
    const metaS = new KeyboardEvent('keydown', { key: 's', metaKey: true })
    // tab is unsaved and route is /workspace
    document.dispatchEvent(ctrlS)
    expect(wrapper.vm.onSave.calledOnce).to.equal(true)
    document.dispatchEvent(metaS)
    expect(wrapper.vm.onSave.calledTwice).to.equal(true)

    // tab is saved and route is /workspace
    store.state.tabs[0].isSaved = true
    document.dispatchEvent(ctrlS)
    expect(wrapper.vm.onSave.calledTwice).to.equal(true)
    document.dispatchEvent(metaS)
    expect(wrapper.vm.onSave.calledTwice).to.equal(true)

    // tab is unsaved and route is not /workspace
    wrapper.vm.$route.path = '/inquiries'
    store.state.tabs[0].isSaved = false
    document.dispatchEvent(ctrlS)
    expect(wrapper.vm.onSave.calledTwice).to.equal(true)
    document.dispatchEvent(metaS)
    expect(wrapper.vm.onSave.calledTwice).to.equal(true)
  })

  it('Ctrl Shift S calls onSaveAs if route path is /workspace', async () => {
    const tab = {
      query: 'SELECT * FROM foo',
      execute: sinon.stub(),
      isSaved: false
    }
    const state = {
      currentTab: tab,
      tabs: [tab],
      db: {}
    }
    const store = createStore({ state })
    const $route = { path: '/workspace' }

    wrapper = shallowMount(MainMenu, {
      global: {
        mocks: { $route },
        stubs: ['router-link'],
        plugins: [store]
      }
    })
    sinon.stub(wrapper.vm, 'onSaveAs')

    const ctrlS = new KeyboardEvent('keydown', {
      key: 'S',
      ctrlKey: true,
      shiftKey: true
    })
    const metaS = new KeyboardEvent('keydown', {
      key: 'S',
      metaKey: true,
      shiftKey: true
    })
    // tab is unsaved and route is /workspace
    document.dispatchEvent(ctrlS)
    expect(wrapper.vm.onSaveAs.calledOnce).to.equal(true)
    document.dispatchEvent(metaS)
    expect(wrapper.vm.onSaveAs.calledTwice).to.equal(true)

    // tab is saved and route is /workspace
    store.state.tabs[0].isSaved = true
    document.dispatchEvent(ctrlS)
    expect(wrapper.vm.onSaveAs.calledThrice).to.equal(true)
    document.dispatchEvent(metaS)
    expect(wrapper.vm.onSaveAs.callCount).to.equal(4)

    // tab is unsaved and route is not /workspace
    wrapper.vm.$route.path = '/inquiries'
    store.state.tabs[0].isSaved = false
    document.dispatchEvent(ctrlS)
    expect(wrapper.vm.onSaveAs.callCount).to.equal(4)
    document.dispatchEvent(metaS)
    expect(wrapper.vm.onSaveAs.callCount).to.equal(4)

    // tab is saved and route is not /workspace
    wrapper.vm.$route.path = '/inquiries'
    store.state.tabs[0].isSaved = true
    document.dispatchEvent(ctrlS)
    expect(wrapper.vm.onSaveAs.callCount).to.equal(4)
    document.dispatchEvent(metaS)
    expect(wrapper.vm.onSaveAs.callCount).to.equal(4)
  })

  it('Saves the inquiry when no need the new name and no update conflict', async () => {
    const tab = {
      id: 1,
      name: 'foo',
      query: 'SELECT * FROM foo',
      updatedAt: '2025-05-15T15:30:00Z',
      execute: sinon.stub(),
      isSaved: false
    }
    const state = {
      currentTab: tab,
      inquiries: [
        {
          id: 1,
          name: 'foo',
          query: 'SELECT * FROM foo',
          updatedAt: '2025-05-15T15:30:00Z',
          createdAt: '2025-05-14T15:30:00Z'
        }
      ],
      tabs: [tab],
      db: {}
    }
    const mutations = {
      updateTab: sinon.stub()
    }
    const actions = {
      saveInquiry: sinon.stub().returns({
        name: 'foo',
        id: 1,
        query: 'SELECT * FROM foo',
        viewType: 'chart',
        viewOptions: [],
        updatedAt: '2025-05-16T15:30:00Z'
      })
    }
    const store = createStore({ state, mutations, actions })
    const $route = { path: '/workspace' }
    sinon.stub(storedInquiries, 'isTabNeedName').returns(false)

    wrapper = mount(MainMenu, {
      attachTo: document.body,
      global: {
        mocks: { $route },
        stubs: {
          'router-link': true,
          'app-diagnostic-info': true,
          teleport: true,
          transition: false
        },
        plugins: [store]
      }
    })

    await wrapper.find('#save-btn').trigger('click')

    // check that the dialog is closed
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(false)

    // check that the inquiry was saved via saveInquiry (newName='')
    expect(actions.saveInquiry.calledOnce).to.equal(true)
    expect(actions.saveInquiry.args[0][1]).to.eql({
      inquiryTab: state.currentTab,
      newName: ''
    })

    // check that the tab was updated
    expect(
      mutations.updateTab.calledOnceWith(
        state,
        sinon.match({
          tab,
          newValues: {
            name: 'foo',
            id: 1,
            query: 'SELECT * FROM foo',
            viewType: 'chart',
            viewOptions: [],
            isSaved: true,
            updatedAt: '2025-05-16T15:30:00Z'
          }
        })
      )
    ).to.equal(true)

    // check that 'inquirySaved' event was triggered on eventBus
    expect(eventBus.$emit.calledOnceWith('inquirySaved')).to.equal(true)
  })

  it('Inquiry conflict: overwrite', async () => {
    const tab = {
      id: 1,
      name: 'foo',
      query: 'SELECT * FROM foo',
      updatedAt: '2025-05-15T15:30:00Z',
      execute: sinon.stub(),
      isSaved: false
    }
    const state = {
      currentTab: tab,
      inquiries: [
        {
          id: 1,
          name: 'foo',
          query: 'SELECT * FROM bar',
          updatedAt: '2025-05-15T16:30:00Z',
          createdAt: '2025-05-14T15:30:00Z'
        }
      ],
      tabs: [tab],
      db: {}
    }
    const mutations = {
      updateTab: sinon.stub()
    }
    const actions = {
      saveInquiry: sinon.stub().returns({
        name: 'foo',
        id: 1,
        query: 'SELECT * FROM foo',
        viewType: 'chart',
        viewOptions: [],
        updatedAt: '2025-05-16T17:30:00Z',
        createdAt: '2025-05-14T15:30:00Z'
      })
    }
    const store = createStore({ state, mutations, actions })
    const $route = { path: '/workspace' }
    sinon.stub(storedInquiries, 'isTabNeedName').returns(false)

    wrapper = mount(MainMenu, {
      attachTo: document.body,
      global: {
        mocks: { $route },
        stubs: {
          'router-link': true,
          'app-diagnostic-info': true,
          teleport: true,
          transition: false
        },
        plugins: [store]
      }
    })

    await wrapper.find('#save-btn').trigger('click')

    // check that the conflict dialog is open
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(true)
    expect(wrapper.find('.dialog.vfm .dialog-header').text()).to.contain(
      'Inquiry saving conflict'
    )

    // find Overwrite in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button')
      .find(button => button.text() === 'Overwrite')
      .trigger('click')

    await nextTick()

    // check that the dialog is closed
    await clock.tick(100)
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(false)

    // check that the inquiry was saved via saveInquiry (newName='')
    expect(actions.saveInquiry.calledOnce).to.equal(true)
    expect(actions.saveInquiry.args[0][1]).to.eql({
      inquiryTab: state.currentTab,
      newName: ''
    })

    // check that the tab was updated
    expect(
      mutations.updateTab.calledOnceWith(
        state,
        sinon.match({
          tab,
          newValues: {
            name: 'foo',
            id: 1,
            query: 'SELECT * FROM foo',
            viewType: 'chart',
            viewOptions: [],
            isSaved: true,
            updatedAt: '2025-05-16T17:30:00Z'
          }
        })
      )
    ).to.equal(true)

    // check that 'inquirySaved' event was triggered on eventBus
    expect(eventBus.$emit.calledOnceWith('inquirySaved')).to.equal(true)
  })

  it('Inquiry conflict: save as new', async () => {
    const tab = {
      id: 1,
      name: 'foo',
      query: 'SELECT * FROM foo',
      updatedAt: '2025-05-15T15:30:00Z',
      execute: sinon.stub(),
      isSaved: false
    }
    const state = {
      currentTab: tab,
      inquiries: [
        {
          id: 1,
          name: 'foo',
          query: 'SELECT * FROM bar',
          updatedAt: '2025-05-15T16:30:00Z',
          createdAt: '2025-05-14T15:30:00Z'
        }
      ],
      tabs: [tab],
      db: {}
    }
    const mutations = {
      updateTab: sinon.stub()
    }
    const actions = {
      saveInquiry: sinon.stub().returns({
        name: 'foo_new',
        id: 2,
        query: 'SELECT * FROM foo',
        viewType: 'chart',
        viewOptions: [],
        updatedAt: '2025-05-16T17:30:00Z',
        createdAt: '2025-05-16T17:30:00Z'
      })
    }
    const store = createStore({ state, mutations, actions })
    const $route = { path: '/workspace' }
    sinon.stub(storedInquiries, 'isTabNeedName').returns(false)

    wrapper = mount(MainMenu, {
      attachTo: document.body,
      global: {
        mocks: { $route },
        stubs: {
          'router-link': true,
          'app-diagnostic-info': true,
          teleport: true,
          transition: false
        },
        plugins: [store]
      }
    })

    await wrapper.find('#save-btn').trigger('click')

    // check that the conflict dialog is open
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(true)
    expect(wrapper.find('.dialog.vfm .dialog-header').text()).to.contain(
      'Inquiry saving conflict'
    )

    // find "Save as new" in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button')
      .find(button => button.text() === 'Save as new')
      .trigger('click')

    await nextTick()
    await clock.tick(100)

    // enter the new name
    await wrapper.find('.dialog-body input').setValue('foo_new')

    // find Save in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button')
      .find(button => button.text() === 'Save')
      .trigger('click')

    await nextTick()

    // check that the dialog is closed
    await clock.tick(100)
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(false)

    // check that the inquiry was saved via saveInquiry (newName='foo_new')
    expect(actions.saveInquiry.calledOnce).to.equal(true)
    expect(actions.saveInquiry.args[0][1]).to.eql({
      inquiryTab: state.currentTab,
      newName: 'foo_new'
    })

    // check that the tab was updated
    expect(
      mutations.updateTab.calledOnceWith(
        state,
        sinon.match({
          tab,
          newValues: {
            name: 'foo_new',
            id: 2,
            query: 'SELECT * FROM foo',
            viewType: 'chart',
            viewOptions: [],
            isSaved: true,
            updatedAt: '2025-05-16T17:30:00Z'
          }
        })
      )
    ).to.equal(true)

    // check that 'inquirySaved' event was triggered on eventBus
    expect(eventBus.$emit.calledOnceWith('inquirySaved')).to.equal(true)
  })

  it('Inquiry conflict: cancel', async () => {
    const tab = {
      id: 1,
      name: 'foo',
      query: 'SELECT * FROM foo',
      updatedAt: '2025-05-15T15:30:00Z',
      execute: sinon.stub(),
      isSaved: false
    }
    const state = {
      currentTab: tab,
      inquiries: [
        {
          id: 1,
          name: 'foo',
          query: 'SELECT * FROM bar',
          updatedAt: '2025-05-15T16:30:00Z',
          createdAt: '2025-05-14T15:30:00Z'
        }
      ],
      tabs: [tab],
      db: {}
    }
    const mutations = {
      updateTab: sinon.stub()
    }
    const actions = {
      saveInquiry: sinon.stub()
    }
    const store = createStore({ state, mutations, actions })
    const $route = { path: '/workspace' }
    sinon.stub(storedInquiries, 'isTabNeedName').returns(false)

    wrapper = mount(MainMenu, {
      attachTo: document.body,
      global: {
        mocks: { $route },
        stubs: {
          'router-link': true,
          'app-diagnostic-info': true,
          teleport: true,
          transition: false
        },
        plugins: [store]
      }
    })

    await wrapper.find('#save-btn').trigger('click')

    // check that the conflict dialog is open
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(true)
    expect(wrapper.find('.dialog.vfm .dialog-header').text()).to.contain(
      'Inquiry saving conflict'
    )

    // find Cancel in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button')
      .find(button => button.text() === 'Cancel')
      .trigger('click')

    // check that the dialog is closed
    await clock.tick(100)
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(false)

    // check that the inquiry was not saved via storedInquiries.save
    expect(actions.saveInquiry.called).to.equal(false)

    // check that the tab was not updated
    expect(mutations.updateTab.called).to.equal(false)

    // check that 'inquirySaved' event is not listened on eventBus
    expect(eventBus.$off.calledOnceWith('inquirySaved')).to.equal(true)
  })

  it('Shows en error when the new name is needed but not specifyied', async () => {
    const tab = {
      id: 1,
      name: null,
      tempName: 'Untitled',
      query: 'SELECT * FROM foo',
      execute: sinon.stub(),
      isSaved: false,
      updatedAt: '2025-05-15T15:30:00Z'
    }
    const state = {
      currentTab: tab,
      tabs: [tab],
      db: {}
    }
    const mutations = {
      updateTab: sinon.stub()
    }
    const actions = {
      saveInquiry: sinon.stub().returns({
        name: 'foo',
        id: 1,
        query: 'SELECT * FROM foo',
        viewType: 'chart',
        viewOptions: [],
        updatedAt: '2025-05-16T15:30:00Z'
      })
    }
    const store = createStore({ state, mutations, actions })
    const $route = { path: '/workspace' }
    sinon.stub(storedInquiries, 'isTabNeedName').returns(true)

    wrapper = mount(MainMenu, {
      attachTo: document.body,
      global: {
        mocks: { $route },
        stubs: {
          'router-link': true,
          'app-diagnostic-info': true,
          teleport: true,
          transition: false
        },
        plugins: [store]
      }
    })

    await wrapper.find('#save-btn').trigger('click')

    // check that the dialog is open
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(true)
    expect(wrapper.find('.dialog.vfm .dialog-header').text()).to.contain(
      'Save inquiry'
    )

    // find Save in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button')
      .find(button => button.text() === 'Save')
      .trigger('click')

    // check that we have an error message and dialog is still open
    expect(wrapper.find('.text-field-error').text()).to.equal(
      "Inquiry name can't be empty"
    )
    await clock.tick(100)
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(true)
  })

  it('Saves the new inquiry with a new name', async () => {
    const tab = {
      id: 1,
      name: null,
      tempName: 'Untitled',
      query: 'SELECT * FROM foo',
      execute: sinon.stub(),
      isSaved: false,
      updatedAt: undefined
    }
    const state = {
      currentTab: tab,
      tabs: [tab],
      db: {}
    }
    const mutations = {
      updateTab: sinon.stub()
    }
    const actions = {
      saveInquiry: sinon.stub().returns({
        name: 'foo',
        id: 2,
        query: 'SELECT * FROM foo',
        viewType: 'chart',
        viewOptions: [],
        updatedAt: '2025-05-15T15:30:00Z'
      })
    }
    const store = createStore({ state, mutations, actions })
    const $route = { path: '/workspace' }
    sinon.stub(storedInquiries, 'isTabNeedName').returns(true)

    wrapper = mount(MainMenu, {
      attachTo: document.body,
      global: {
        mocks: { $route },
        stubs: {
          'router-link': true,
          'app-diagnostic-info': true,
          teleport: true,
          transition: false
        },
        plugins: [store]
      }
    })

    await wrapper.find('#save-btn').trigger('click')

    // check that the dialog is open
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(true)
    expect(wrapper.find('.dialog.vfm .dialog-header').text()).to.contain(
      'Save inquiry'
    )

    // enter the new name
    await wrapper.find('.dialog-body input').setValue('foo')

    // find Save in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button')
      .find(button => button.text() === 'Save')
      .trigger('click')

    await nextTick()

    // check that the dialog is closed
    await clock.tick(100)
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(false)

    // check that the inquiry was saved via saveInquiry (newName='foo')
    expect(actions.saveInquiry.calledOnce).to.equal(true)
    expect(actions.saveInquiry.args[0][1]).to.eql({
      inquiryTab: state.currentTab,
      newName: 'foo'
    })

    // check that the tab was updated
    expect(
      mutations.updateTab.calledOnceWith(
        state,
        sinon.match({
          tab,
          newValues: {
            name: 'foo',
            id: 2,
            query: 'SELECT * FROM foo',
            viewType: 'chart',
            viewOptions: [],
            isSaved: true,
            updatedAt: '2025-05-15T15:30:00Z'
          }
        })
      )
    ).to.equal(true)

    // check that 'inquirySaved' event was triggered on eventBus
    expect(eventBus.$emit.calledOnceWith('inquirySaved')).to.equal(true)
  })

  it('Saves a predefined inquiry with a new name', async () => {
    const tab = {
      id: 1,
      name: 'foo',
      query: 'SELECT * FROM foo',
      execute: sinon.stub(),
      isPredefined: true,
      result: {
        columns: ['id', 'name'],
        values: [
          [1, 'Harry Potter'],
          [2, 'Drako Malfoy']
        ]
      },
      viewType: 'chart',
      viewOptions: [],
      isSaved: false
    }
    const state = {
      currentTab: tab,
      tabs: [tab],
      db: {}
    }
    const mutations = {
      updateTab: sinon.stub()
    }
    const actions = {
      saveInquiry: sinon.stub().returns({
        name: 'bar',
        id: 2,
        query: 'SELECT * FROM foo',
        viewType: 'chart',
        viewOptions: [],
        updatedAt: '2025-05-15T15:30:00Z'
      })
    }
    const store = createStore({ state, mutations, actions })
    const $route = { path: '/workspace' }
    sinon.stub(storedInquiries, 'isTabNeedName').returns(true)

    wrapper = mount(MainMenu, {
      attachTo: document.body,
      global: {
        mocks: { $route },
        stubs: {
          'router-link': true,
          'app-diagnostic-info': true,
          teleport: true,
          transition: false
        },
        plugins: [store]
      }
    })

    await wrapper.find('#save-btn').trigger('click')

    // check that the dialog is open
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(true)
    expect(wrapper.find('.dialog.vfm .dialog-header').text()).to.contain(
      'Save inquiry'
    )

    // check that save-note is visible (save-note is an explanation why do we need a new name)
    expect(wrapper.find('#save-note').isVisible()).to.equal(true)

    // enter the new name
    await wrapper.find('.dialog-body input').setValue('bar')

    // find Save in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button')
      .find(button => button.text() === 'Save')
      .trigger('click')

    await nextTick()

    // check that the dialog is closed
    await clock.tick(100)
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(false)

    // check that the inquiry was saved via saveInquiry (newName='bar')
    expect(actions.saveInquiry.calledOnce).to.equal(true)
    expect(actions.saveInquiry.args[0][1]).to.eql({
      inquiryTab: state.currentTab,
      newName: 'bar'
    })

    // check that the tab was updated
    expect(
      mutations.updateTab.calledOnceWith(
        state,
        sinon.match({
          tab,
          newValues: {
            name: 'bar',
            id: 2,
            query: 'SELECT * FROM foo',
            viewType: 'chart',
            viewOptions: [],
            isSaved: true,
            updatedAt: '2025-05-15T15:30:00Z'
          }
        })
      )
    ).to.equal(true)

    // check that 'inquirySaved' event was triggered on eventBus
    expect(eventBus.$emit.calledOnceWith('inquirySaved')).to.equal(true)

    // We saved predefined inquiry, so the tab will be created again
    // (because of new id) and it will be without sql result and has default view - table.
    // That's why we need to restore data and view.
    // Check that result and view are preserved in the currentTab:
    expect(state.currentTab.viewType).to.equal('chart')
    expect(state.currentTab.result).to.eql({
      columns: ['id', 'name'],
      values: [
        [1, 'Harry Potter'],
        [2, 'Drako Malfoy']
      ]
    })
  })

  it('Cancel saving', async () => {
    const tab = {
      id: 1,
      name: null,
      tempName: 'Untitled',
      query: 'SELECT * FROM foo',
      execute: sinon.stub(),
      isSaved: false
    }
    const state = {
      currentTab: tab,
      tabs: [tab],
      db: {}
    }
    const mutations = {
      updateTab: sinon.stub()
    }
    const actions = {
      saveInquiry: sinon.stub().returns({
        name: 'bar',
        id: 2,
        query: 'SELECT * FROM foo',
        chart: []
      })
    }
    const store = createStore({ state, mutations, actions })
    const $route = { path: '/workspace' }
    sinon.stub(storedInquiries, 'isTabNeedName').returns(true)

    wrapper = mount(MainMenu, {
      attachTo: document.body,
      global: {
        mocks: { $route },
        stubs: {
          'router-link': true,
          'app-diagnostic-info': true,
          teleport: true,
          transition: false
        },
        plugins: [store]
      }
    })

    await wrapper.find('#save-btn').trigger('click')

    // check that the dialog is open
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(true)
    expect(wrapper.find('.dialog.vfm .dialog-header').text()).to.contain(
      'Save inquiry'
    )

    // find Cancel in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button')
      .find(button => button.text() === 'Cancel')
      .trigger('click')

    // check that the dialog is closed
    await clock.tick(100)
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(false)

    // check that the inquiry was not saved via storedInquiries.save
    expect(actions.saveInquiry.called).to.equal(false)

    // check that the tab was not updated
    expect(mutations.updateTab.called).to.equal(false)

    // check that 'inquirySaved' event is not listened on eventBus
    expect(eventBus.$off.calledOnceWith('inquirySaved')).to.equal(true)
  })

  it('Save the inquiry as new', async () => {
    const tab = {
      id: 1,
      name: 'foo',
      query: 'SELECT * FROM foo',
      updatedAt: '2025-05-15T15:30:00Z',
      execute: sinon.stub(),
      isSaved: true
    }
    const state = {
      currentTab: tab,
      inquiries: [
        {
          id: 1,
          name: 'foo',
          query: 'SELECT * FROM bar',
          updatedAt: '2025-05-15T16:30:00Z',
          createdAt: '2025-05-14T15:30:00Z'
        }
      ],
      tabs: [tab],
      db: {}
    }
    const mutations = {
      updateTab: sinon.stub()
    }
    const actions = {
      saveInquiry: sinon.stub().returns({
        name: 'foo_new',
        id: 2,
        query: 'SELECT * FROM foo',
        viewType: 'chart',
        viewOptions: [],
        updatedAt: '2025-05-16T17:30:00Z',
        createdAt: '2025-05-16T17:30:00Z'
      })
    }
    const store = createStore({ state, mutations, actions })
    const $route = { path: '/workspace' }
    sinon.stub(storedInquiries, 'isTabNeedName').returns(false)

    wrapper = mount(MainMenu, {
      attachTo: document.body,
      global: {
        mocks: { $route },
        stubs: {
          'router-link': true,
          'app-diagnostic-info': true,
          teleport: true,
          transition: false
        },
        plugins: [store]
      }
    })

    await wrapper.find('#save-as-btn').trigger('click')

    // check that Save dialog is open
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(true)
    expect(wrapper.find('.dialog.vfm .dialog-header').text()).to.contain(
      'Save inquiry'
    )

    // enter the new name
    await wrapper.find('.dialog-body input').setValue('foo_new')

    // find Save in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button')
      .find(button => button.text() === 'Save')
      .trigger('click')

    await nextTick()

    // check that the dialog is closed
    await clock.tick(100)
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(false)

    // check that the inquiry was saved via saveInquiry (newName='foo_new')
    expect(actions.saveInquiry.calledOnce).to.equal(true)
    expect(actions.saveInquiry.args[0][1]).to.eql({
      inquiryTab: state.currentTab,
      newName: 'foo_new'
    })

    // check that the tab was updated
    expect(
      mutations.updateTab.calledOnceWith(
        state,
        sinon.match({
          tab,
          newValues: {
            name: 'foo_new',
            id: 2,
            query: 'SELECT * FROM foo',
            viewType: 'chart',
            viewOptions: [],
            isSaved: true,
            updatedAt: '2025-05-16T17:30:00Z'
          }
        })
      )
    ).to.equal(true)

    // check that 'inquirySaved' event was triggered on eventBus
    expect(eventBus.$emit.calledOnceWith('inquirySaved')).to.equal(true)
  })
})
