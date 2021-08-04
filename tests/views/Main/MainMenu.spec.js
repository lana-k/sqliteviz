import { expect } from 'chai'
import sinon from 'sinon'
import { mount, shallowMount, createWrapper } from '@vue/test-utils'
import Vuex from 'vuex'
import MainMenu from '@/views/Main/MainMenu'
import storedInquiries from '@/lib/storedInquiries'

let wrapper = null

describe('MainMenu.vue', () => {
  afterEach(() => {
    sinon.restore()

    // We need explicitly destroy the component, so that beforeDestroy hook was called
    // It's important because in this hook MainMenu component removes keydown event listener.
    wrapper.destroy()
  })

  it('Create and Save are visible only on /workspace page', async () => {
    const state = {
      currentTab: { query: '', execute: sinon.stub() },
      tabs: [{}],
      db: {}
    }
    const store = new Vuex.Store({ state })
    const $route = { path: '/workspace' }
    // mount the component
    wrapper = shallowMount(MainMenu, {
      store,
      mocks: { $route },
      stubs: ['router-link']
    })
    expect(wrapper.find('#save-btn').exists()).to.equal(true)
    expect(wrapper.find('#save-btn').isVisible()).to.equal(true)
    expect(wrapper.find('#create-btn').exists()).to.equal(true)
    expect(wrapper.find('#create-btn').isVisible()).to.equal(true)

    await wrapper.vm.$set(wrapper.vm.$route, 'path', '/inquiries')
    expect(wrapper.find('#save-btn').exists()).to.equal(true)
    expect(wrapper.find('#save-btn').isVisible()).to.equal(false)
    expect(wrapper.find('#create-btn').exists()).to.equal(true)
    expect(wrapper.find('#create-btn').isVisible()).to.equal(true)
  })

  it('Save is not visible if there is no tabs', () => {
    const state = {
      currentTab: null,
      tabs: [{}],
      db: {}
    }
    const store = new Vuex.Store({ state })
    const $route = { path: '/workspace' }
    wrapper = shallowMount(MainMenu, {
      store,
      mocks: { $route },
      stubs: ['router-link']
    })
    expect(wrapper.find('#save-btn').exists()).to.equal(true)
    expect(wrapper.find('#save-btn').isVisible()).to.equal(false)
    expect(wrapper.find('#create-btn').exists()).to.equal(true)
    expect(wrapper.find('#create-btn').isVisible()).to.equal(true)
  })

  it('Save is disabled if current tab.isSaved is true', async () => {
    const state = {
      currentTab: {
        query: 'SELECT * FROM foo',
        execute: sinon.stub(),
        tabIndex: 0
      },
      tabs: [{ isSaved: false }],
      db: {}
    }
    const store = new Vuex.Store({ state })
    const $route = { path: '/workspace' }

    wrapper = shallowMount(MainMenu, {
      store,
      mocks: { $route },
      stubs: ['router-link']
    })
    const vm = wrapper.vm
    expect(wrapper.find('#save-btn').element.disabled).to.equal(false)

    await vm.$set(state.tabs[0], 'isSaved', true)
    expect(wrapper.find('#save-btn').element.disabled).to.equal(true)
  })

  it('Creates a tab', async () => {
    const state = {
      currentTab: {
        query: 'SELECT * FROM foo',
        execute: sinon.stub(),
        tabIndex: 0
      },
      tabs: [{ isSaved: false }],
      db: {}
    }
    const newInquiryId = 1
    const actions = {
      addTab: sinon.stub().resolves(newInquiryId)
    }
    const mutations = {
      setCurrentTabId: sinon.stub()
    }
    const store = new Vuex.Store({ state, mutations, actions })
    const $route = { path: '/workspace' }
    const $router = { push: sinon.stub() }

    wrapper = shallowMount(MainMenu, {
      store,
      mocks: { $route, $router },
      stubs: ['router-link']
    })

    await wrapper.find('#create-btn').trigger('click')
    expect(actions.addTab.calledOnce).to.equal(true)
    await actions.addTab.returnValues[0]
    expect(mutations.setCurrentTabId.calledOnceWith(state, newInquiryId)).to.equal(true)
    expect($router.push.calledOnce).to.equal(false)
  })

  it('Creates a tab and redirects to workspace', async () => {
    const state = {
      currentTab: {
        query: 'SELECT * FROM foo',
        execute: sinon.stub(),
        tabIndex: 0
      },
      tabs: [{ isSaved: false }],
      db: {}
    }
    const newInquiryId = 1
    const actions = {
      addTab: sinon.stub().resolves(newInquiryId)
    }
    const mutations = {
      setCurrentTabId: sinon.stub()
    }
    const store = new Vuex.Store({ state, mutations, actions })
    const $route = { path: '/inquiries' }
    const $router = { push: sinon.stub() }

    wrapper = shallowMount(MainMenu, {
      store,
      mocks: { $route, $router },
      stubs: ['router-link']
    })

    await wrapper.find('#create-btn').trigger('click')
    expect(actions.addTab.calledOnce).to.equal(true)
    await actions.addTab.returnValues[0]
    expect(mutations.setCurrentTabId.calledOnceWith(state, newInquiryId)).to.equal(true)
    expect($router.push.calledOnce).to.equal(true)
  })

  it('Ctrl R calls currentTab.execute if running is enabled and route.path is "/workspace"',
    async () => {
      const state = {
        currentTab: {
          query: 'SELECT * FROM foo',
          execute: sinon.stub(),
          tabIndex: 0
        },
        tabs: [{ isSaved: false }],
        db: {}
      }
      const store = new Vuex.Store({ state })
      const $route = { path: '/workspace' }
      const $router = { push: sinon.stub() }

      wrapper = shallowMount(MainMenu, {
        store,
        mocks: { $route, $router },
        stubs: ['router-link']
      })

      const ctrlR = new KeyboardEvent('keydown', { key: 'r', ctrlKey: true })
      const metaR = new KeyboardEvent('keydown', { key: 'r', metaKey: true })
      // Running is enabled and route path is workspace
      document.dispatchEvent(ctrlR)
      expect(state.currentTab.execute.calledOnce).to.equal(true)
      document.dispatchEvent(metaR)
      expect(state.currentTab.execute.calledTwice).to.equal(true)

      // Running is disabled and route path is workspace
      await wrapper.vm.$set(state, 'db', null)
      document.dispatchEvent(ctrlR)
      expect(state.currentTab.execute.calledTwice).to.equal(true)
      document.dispatchEvent(metaR)
      expect(state.currentTab.execute.calledTwice).to.equal(true)

      // Running is enabled and route path is not workspace
      await wrapper.vm.$set(state, 'db', {})
      await wrapper.vm.$set($route, 'path', '/inquiries')
      document.dispatchEvent(ctrlR)
      expect(state.currentTab.execute.calledTwice).to.equal(true)
      document.dispatchEvent(metaR)
      expect(state.currentTab.execute.calledTwice).to.equal(true)
    })

  it('Ctrl Enter calls currentTab.execute if running is enabled and route.path is "/workspace"',
    async () => {
      const state = {
        currentTab: {
          query: 'SELECT * FROM foo',
          execute: sinon.stub(),
          tabIndex: 0
        },
        tabs: [{ isSaved: false }],
        db: {}
      }
      const store = new Vuex.Store({ state })
      const $route = { path: '/workspace' }
      const $router = { push: sinon.stub() }

      wrapper = shallowMount(MainMenu, {
        store,
        mocks: { $route, $router },
        stubs: ['router-link']
      })

      const ctrlEnter = new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true })
      const metaEnter = new KeyboardEvent('keydown', { key: 'Enter', metaKey: true })
      // Running is enabled and route path is workspace
      document.dispatchEvent(ctrlEnter)
      expect(state.currentTab.execute.calledOnce).to.equal(true)
      document.dispatchEvent(metaEnter)
      expect(state.currentTab.execute.calledTwice).to.equal(true)

      // Running is disabled and route path is workspace
      await wrapper.vm.$set(state, 'db', null)
      document.dispatchEvent(ctrlEnter)
      expect(state.currentTab.execute.calledTwice).to.equal(true)
      document.dispatchEvent(metaEnter)
      expect(state.currentTab.execute.calledTwice).to.equal(true)

      // Running is enabled and route path is not workspace
      await wrapper.vm.$set(state, 'db', {})
      await wrapper.vm.$set($route, 'path', '/inquiries')
      document.dispatchEvent(ctrlEnter)
      expect(state.currentTab.execute.calledTwice).to.equal(true)
      document.dispatchEvent(metaEnter)
      expect(state.currentTab.execute.calledTwice).to.equal(true)
    })

  it('Ctrl B calls createNewInquiry', async () => {
    const state = {
      currentTab: {
        query: 'SELECT * FROM foo',
        execute: sinon.stub(),
        tabIndex: 0
      },
      tabs: [{ isSaved: false }],
      db: {}
    }
    const store = new Vuex.Store({ state })
    const $route = { path: '/workspace' }

    wrapper = shallowMount(MainMenu, {
      store,
      mocks: { $route },
      stubs: ['router-link']
    })
    sinon.stub(wrapper.vm, 'createNewInquiry')

    const ctrlB = new KeyboardEvent('keydown', { key: 'b', ctrlKey: true })
    const metaB = new KeyboardEvent('keydown', { key: 'b', metaKey: true })
    document.dispatchEvent(ctrlB)
    expect(wrapper.vm.createNewInquiry.calledOnce).to.equal(true)
    document.dispatchEvent(metaB)
    expect(wrapper.vm.createNewInquiry.calledTwice).to.equal(true)

    await wrapper.vm.$set($route, 'path', '/inquiries')
    document.dispatchEvent(ctrlB)
    expect(wrapper.vm.createNewInquiry.calledThrice).to.equal(true)
    document.dispatchEvent(metaB)
    expect(wrapper.vm.createNewInquiry.callCount).to.equal(4)
  })

  it('Ctrl S calls checkInquiryBeforeSave if the tab is unsaved and route path is /workspace',
    async () => {
      const state = {
        currentTab: {
          query: 'SELECT * FROM foo',
          execute: sinon.stub(),
          tabIndex: 0
        },
        tabs: [{ isSaved: false }],
        db: {}
      }
      const store = new Vuex.Store({ state })
      const $route = { path: '/workspace' }

      wrapper = shallowMount(MainMenu, {
        store,
        mocks: { $route },
        stubs: ['router-link']
      })
      sinon.stub(wrapper.vm, 'checkInquiryBeforeSave')

      const ctrlS = new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
      const metaS = new KeyboardEvent('keydown', { key: 's', metaKey: true })
      // tab is unsaved and route is /workspace
      document.dispatchEvent(ctrlS)
      expect(wrapper.vm.checkInquiryBeforeSave.calledOnce).to.equal(true)
      document.dispatchEvent(metaS)
      expect(wrapper.vm.checkInquiryBeforeSave.calledTwice).to.equal(true)

      // tab is saved and route is /workspace
      await wrapper.vm.$set(state.tabs[0], 'isSaved', true)
      document.dispatchEvent(ctrlS)
      expect(wrapper.vm.checkInquiryBeforeSave.calledTwice).to.equal(true)
      document.dispatchEvent(metaS)
      expect(wrapper.vm.checkInquiryBeforeSave.calledTwice).to.equal(true)

      // tab is unsaved and route is not /workspace
      await wrapper.vm.$set($route, 'path', '/inquiries')
      await wrapper.vm.$set(state.tabs[0], 'isSaved', false)
      document.dispatchEvent(ctrlS)
      expect(wrapper.vm.checkInquiryBeforeSave.calledTwice).to.equal(true)
      document.dispatchEvent(metaS)
      expect(wrapper.vm.checkInquiryBeforeSave.calledTwice).to.equal(true)
    })

  it('Saves the inquiry when no need the new name',
    async () => {
      const state = {
        currentTab: {
          query: 'SELECT * FROM foo',
          execute: sinon.stub(),
          tabIndex: 0
        },
        tabs: [{ id: 1, name: 'foo', isSaved: false }],
        db: {}
      }
      const mutations = {
        updateTab: sinon.stub()
      }
      const store = new Vuex.Store({ state, mutations })
      const $route = { path: '/workspace' }
      sinon.stub(storedInquiries, 'isTabNeedName').returns(false)
      sinon.stub(storedInquiries, 'save').returns({
        name: 'foo',
        id: 1,
        query: 'SELECT * FROM foo',
        viewType: 'chart',
        viewOptions: []
      })

      wrapper = mount(MainMenu, {
        store,
        mocks: { $route },
        stubs: ['router-link', 'app-diagnostic-info']
      })

      await wrapper.find('#save-btn').trigger('click')

      // check that the dialog is closed
      expect(wrapper.find('[data-modal="save"]').exists()).to.equal(false)

      // check that the inquiry was saved via storedInquiries.save (newName='')
      expect(storedInquiries.save.calledOnceWith(state.currentTab, '')).to.equal(true)

      // check that the tab was updated
      expect(mutations.updateTab.calledOnceWith(state, sinon.match({
        index: 0,
        name: 'foo',
        id: 1,
        query: 'SELECT * FROM foo',
        viewType: 'chart',
        viewOptions: [],
        isSaved: true
      }))).to.equal(true)

      // check that 'inquirySaved' event was triggered on $root
      expect(createWrapper(wrapper.vm.$root).emitted('inquirySaved')).to.have.lengthOf(1)
    })

  it('Shows en error when the new name is needed but not specifyied', async () => {
    const state = {
      currentTab: {
        query: 'SELECT * FROM foo',
        execute: sinon.stub(),
        tabIndex: 0
      },
      tabs: [{ id: 1, name: null, tempName: 'Untitled', isSaved: false }],
      db: {}
    }
    const mutations = {
      updateTab: sinon.stub()
    }
    const store = new Vuex.Store({ state, mutations })
    const $route = { path: '/workspace' }
    sinon.stub(storedInquiries, 'isTabNeedName').returns(true)
    sinon.stub(storedInquiries, 'save').returns({
      name: 'foo',
      id: 1,
      query: 'SELECT * FROM foo',
      viewType: 'chart',
      viewOptions: []
    })

    wrapper = mount(MainMenu, {
      store,
      mocks: { $route },
      stubs: ['router-link', 'app-diagnostic-info']
    })

    await wrapper.find('#save-btn').trigger('click')

    // check that the dialog is open
    expect(wrapper.find('[data-modal="save"]').exists()).to.equal(true)

    // find Save in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button').wrappers
      .find(button => button.text() === 'Save')
      .trigger('click')

    // check that we have an error message and dialog is still open
    expect(wrapper.find('.text-field-error').text()).to.equal('Inquiry name can\'t be empty')
    expect(wrapper.find('[data-modal="save"]').exists()).to.equal(true)
  })

  it('Saves the inquiry with a new name', async () => {
    const state = {
      currentTab: {
        query: 'SELECT * FROM foo',
        execute: sinon.stub(),
        tabIndex: 0
      },
      tabs: [{ id: 1, name: null, tempName: 'Untitled', isSaved: false }],
      db: {}
    }
    const mutations = {
      updateTab: sinon.stub()
    }
    const store = new Vuex.Store({ state, mutations })
    const $route = { path: '/workspace' }
    sinon.stub(storedInquiries, 'isTabNeedName').returns(true)
    sinon.stub(storedInquiries, 'save').returns({
      name: 'foo',
      id: 1,
      query: 'SELECT * FROM foo',
      viewType: 'chart',
      viewOptions: []
    })

    wrapper = mount(MainMenu, {
      store,
      mocks: { $route },
      stubs: ['router-link', 'app-diagnostic-info']
    })

    await wrapper.find('#save-btn').trigger('click')

    // check that the dialog is open
    expect(wrapper.find('[data-modal="save"]').exists()).to.equal(true)

    // enter the new name
    await wrapper.find('.dialog-body input').setValue('foo')

    // find Save in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button').wrappers
      .find(button => button.text() === 'Save')
      .trigger('click')

    // check that the dialog is closed
    expect(wrapper.find('[data-modal="save"]').exists()).to.equal(false)

    // check that the inquiry was saved via storedInquiries.save (newName='foo')
    expect(storedInquiries.save.calledOnceWith(state.currentTab, 'foo')).to.equal(true)

    // check that the tab was updated
    expect(mutations.updateTab.calledOnceWith(state, sinon.match({
      index: 0,
      name: 'foo',
      id: 1,
      query: 'SELECT * FROM foo',
      viewType: 'chart',
      viewOptions: [],
      isSaved: true
    }))).to.equal(true)

    // check that 'inquirySaved' event was triggered on $root
    expect(createWrapper(wrapper.vm.$root).emitted('inquirySaved')).to.have.lengthOf(1)
  })

  it('Saves a predefined inquiry with a new name', async () => {
    const state = {
      currentTab: {
        query: 'SELECT * FROM foo',
        execute: sinon.stub(),
        tabIndex: 0,
        isPredefined: true,
        result: {
          columns: ['id', 'name'],
          values: [
            [1, 'Harry Potter'],
            [2, 'Drako Malfoy']
          ]
        },
        viewType: 'chart',
        viewOptions: []
      },
      tabs: [{ id: 1, name: 'foo', isSaved: false, isPredefined: true }],
      db: {}
    }
    const mutations = {
      updateTab: sinon.stub()
    }
    const store = new Vuex.Store({ state, mutations })
    const $route = { path: '/workspace' }
    sinon.stub(storedInquiries, 'isTabNeedName').returns(true)
    sinon.stub(storedInquiries, 'save').returns({
      name: 'bar',
      id: 2,
      query: 'SELECT * FROM foo',
      viewType: 'chart',
      viewOptions: []
    })

    wrapper = mount(MainMenu, {
      store,
      mocks: { $route },
      stubs: ['router-link', 'app-diagnostic-info']
    })

    await wrapper.find('#save-btn').trigger('click')

    // check that the dialog is open
    expect(wrapper.find('[data-modal="save"]').exists()).to.equal(true)

    // check that save-note is visible (save-note is an explanation why do we need a new name)
    expect(wrapper.find('#save-note').isVisible()).to.equal(true)

    // enter the new name
    await wrapper.find('.dialog-body input').setValue('bar')

    // find Save in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button').wrappers
      .find(button => button.text() === 'Save')
      .trigger('click')

    // check that the dialog is closed
    expect(wrapper.find('[data-modal="save"]').exists()).to.equal(false)

    // check that the inquiry was saved via storedInquiries.save (newName='bar')
    expect(storedInquiries.save.calledOnceWith(state.currentTab, 'bar')).to.equal(true)

    // check that the tab was updated
    expect(mutations.updateTab.calledOnceWith(state, sinon.match({
      index: 0,
      name: 'bar',
      id: 2,
      query: 'SELECT * FROM foo',
      viewType: 'chart',
      viewOptions: [],
      isSaved: true
    }))).to.equal(true)

    // check that 'inquirySaved' event was triggered on $root
    expect(createWrapper(wrapper.vm.$root).emitted('inquirySaved')).to.have.lengthOf(1)

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
    const state = {
      currentTab: {
        query: 'SELECT * FROM foo',
        execute: sinon.stub(),
        tabIndex: 0
      },
      tabs: [{ id: 1, name: null, tempName: 'Untitled', isSaved: false }],
      db: {}
    }
    const mutations = {
      updateTab: sinon.stub()
    }
    const store = new Vuex.Store({ state, mutations })
    const $route = { path: '/workspace' }
    sinon.stub(storedInquiries, 'isTabNeedName').returns(true)
    sinon.stub(storedInquiries, 'save').returns({
      name: 'bar',
      id: 2,
      query: 'SELECT * FROM foo',
      chart: []
    })

    wrapper = mount(MainMenu, {
      store,
      mocks: { $route },
      stubs: ['router-link', 'app-diagnostic-info']
    })

    await wrapper.find('#save-btn').trigger('click')

    // check that the dialog is open
    expect(wrapper.find('[data-modal="save"]').exists()).to.equal(true)

    // find Cancel in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button').wrappers
      .find(button => button.text() === 'Cancel')
      .trigger('click')

    // check that the dialog is closed
    expect(wrapper.find('[data-modal="save"]').exists()).to.equal(false)

    // check that the inquiry was not saved via storedInquiries.save
    expect(storedInquiries.save.called).to.equal(false)

    // check that the tab was not updated
    expect(mutations.updateTab.called).to.equal(false)

    // check that 'inquirySaved' event is not listened on $root
    expect(wrapper.vm.$root.$listeners).to.not.have.property('inquirySaved')
  })
})
