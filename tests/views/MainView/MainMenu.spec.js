import { expect } from 'chai'
import sinon from 'sinon'
import { mount, shallowMount, createWrapper } from '@vue/test-utils'
import Vuex from 'vuex'
import MainMenu from '@/views/Main/MainMenu'
import storedQueries from '@/lib/storedQueries'

let wrapper = null

describe('MainMenu.vue', () => {
  afterEach(() => {
    sinon.restore()

    // We need explicitly destroy the component, so that beforeDestroy hook was called
    // It's important because in this hook MainMenu component removes keydown event listener.
    wrapper.destroy()
  })

  it('Run and Save are visible only on /editor page', async () => {
    const state = {
      currentTab: { query: '', execute: sinon.stub() },
      tabs: [{}],
      db: {}
    }
    const store = new Vuex.Store({ state })
    const $route = { path: '/editor' }
    // mount the component
    wrapper = shallowMount(MainMenu, {
      store,
      mocks: { $route },
      stubs: ['router-link']
    })
    expect(wrapper.find('#run-btn').exists()).to.equal(true)
    expect(wrapper.find('#run-btn').isVisible()).to.equal(true)
    expect(wrapper.find('#save-btn').exists()).to.equal(true)
    expect(wrapper.find('#save-btn').isVisible()).to.equal(true)
    expect(wrapper.find('#create-btn').exists()).to.equal(true)
    expect(wrapper.find('#create-btn').isVisible()).to.equal(true)

    await wrapper.vm.$set(wrapper.vm.$route, 'path', '/my-queries')
    expect(wrapper.find('#run-btn').exists()).to.equal(false)
    expect(wrapper.find('#save-btn').exists()).to.equal(true)
    expect(wrapper.find('#save-btn').isVisible()).to.equal(false)
    expect(wrapper.find('#create-btn').exists()).to.equal(true)
    expect(wrapper.find('#create-btn').isVisible()).to.equal(true)
  })

  it('Run and Save are not visible if there is no tabs', () => {
    const state = {
      currentTab: null,
      tabs: [{}],
      db: {}
    }
    const store = new Vuex.Store({ state })
    const $route = { path: '/editor' }
    wrapper = shallowMount(MainMenu, {
      store,
      mocks: { $route },
      stubs: ['router-link']
    })
    expect(wrapper.find('#run-btn').exists()).to.equal(false)
    expect(wrapper.find('#save-btn').exists()).to.equal(true)
    expect(wrapper.find('#save-btn').isVisible()).to.equal(false)
    expect(wrapper.find('#create-btn').exists()).to.equal(true)
    expect(wrapper.find('#create-btn').isVisible()).to.equal(true)
  })

  it('Run is disabled if there is no db or no query', async () => {
    const state = {
      currentTab: { query: 'SELECT * FROM foo', execute: sinon.stub() },
      tabs: [{}],
      db: null
    }
    const store = new Vuex.Store({ state })
    const $route = { path: '/editor' }

    wrapper = shallowMount(MainMenu, {
      store,
      mocks: { $route },
      stubs: ['router-link']
    })
    const vm = wrapper.vm
    expect(wrapper.find('#run-btn').element.disabled).to.equal(true)

    await vm.$set(state, 'db', {})
    expect(wrapper.find('#run-btn').element.disabled).to.equal(false)

    await vm.$set(state.currentTab, 'query', '')
    expect(wrapper.find('#run-btn').element.disabled).to.equal(true)
  })

  it('Save is disabled if current tab.isUnsaved is false', async () => {
    const state = {
      currentTab: {
        query: 'SELECT * FROM foo',
        execute: sinon.stub(),
        tabIndex: 0
      },
      tabs: [{ isUnsaved: true }],
      db: {}
    }
    const store = new Vuex.Store({ state })
    const $route = { path: '/editor' }

    wrapper = shallowMount(MainMenu, {
      store,
      mocks: { $route },
      stubs: ['router-link']
    })
    const vm = wrapper.vm
    expect(wrapper.find('#save-btn').element.disabled).to.equal(false)

    await vm.$set(state.tabs[0], 'isUnsaved', false)
    expect(wrapper.find('#save-btn').element.disabled).to.equal(true)
  })

  it('Creates a tab', async () => {
    const state = {
      currentTab: {
        query: 'SELECT * FROM foo',
        execute: sinon.stub(),
        tabIndex: 0
      },
      tabs: [{ isUnsaved: true }],
      db: {}
    }
    const newQueryId = 1
    const actions = {
      addTab: sinon.stub().resolves(newQueryId)
    }
    const mutations = {
      setCurrentTabId: sinon.stub()
    }
    const store = new Vuex.Store({ state, mutations, actions })
    const $route = { path: '/editor' }
    const $router = { push: sinon.stub() }

    wrapper = shallowMount(MainMenu, {
      store,
      mocks: { $route, $router },
      stubs: ['router-link']
    })

    await wrapper.find('#create-btn').trigger('click')
    expect(actions.addTab.calledOnce).to.equal(true)
    await actions.addTab.returnValues[0]
    expect(mutations.setCurrentTabId.calledOnceWith(state, newQueryId)).to.equal(true)
    expect($router.push.calledOnce).to.equal(false)
  })

  it('Creates a tab and redirects to editor', async () => {
    const state = {
      currentTab: {
        query: 'SELECT * FROM foo',
        execute: sinon.stub(),
        tabIndex: 0
      },
      tabs: [{ isUnsaved: true }],
      db: {}
    }
    const newQueryId = 1
    const actions = {
      addTab: sinon.stub().resolves(newQueryId)
    }
    const mutations = {
      setCurrentTabId: sinon.stub()
    }
    const store = new Vuex.Store({ state, mutations, actions })
    const $route = { path: '/my-queries' }
    const $router = { push: sinon.stub() }

    wrapper = shallowMount(MainMenu, {
      store,
      mocks: { $route, $router },
      stubs: ['router-link']
    })

    await wrapper.find('#create-btn').trigger('click')
    expect(actions.addTab.calledOnce).to.equal(true)
    await actions.addTab.returnValues[0]
    expect(mutations.setCurrentTabId.calledOnceWith(state, newQueryId)).to.equal(true)
    expect($router.push.calledOnce).to.equal(true)
  })

  it('Ctrl R calls currentTab.execute if running is enabled and route.path is "/editor"',
    async () => {
      const state = {
        currentTab: {
          query: 'SELECT * FROM foo',
          execute: sinon.stub(),
          tabIndex: 0
        },
        tabs: [{ isUnsaved: true }],
        db: {}
      }
      const store = new Vuex.Store({ state })
      const $route = { path: '/editor' }
      const $router = { push: sinon.stub() }

      wrapper = shallowMount(MainMenu, {
        store,
        mocks: { $route, $router },
        stubs: ['router-link']
      })

      const ctrlR = new KeyboardEvent('keydown', { key: 'r', ctrlKey: true })
      const metaR = new KeyboardEvent('keydown', { key: 'r', metaKey: true })
      // Running is enabled and route path is editor
      document.dispatchEvent(ctrlR)
      expect(state.currentTab.execute.calledOnce).to.equal(true)
      document.dispatchEvent(metaR)
      expect(state.currentTab.execute.calledTwice).to.equal(true)

      // Running is disabled and route path is editor
      await wrapper.vm.$set(state, 'db', null)
      document.dispatchEvent(ctrlR)
      expect(state.currentTab.execute.calledTwice).to.equal(true)
      document.dispatchEvent(metaR)
      expect(state.currentTab.execute.calledTwice).to.equal(true)

      // Running is enabled and route path is not editor
      await wrapper.vm.$set(state, 'db', {})
      await wrapper.vm.$set($route, 'path', '/my-queries')
      document.dispatchEvent(ctrlR)
      expect(state.currentTab.execute.calledTwice).to.equal(true)
      document.dispatchEvent(metaR)
      expect(state.currentTab.execute.calledTwice).to.equal(true)
    })

  it('Ctrl Enter calls currentTab.execute if running is enabled and route.path is "/editor"',
    async () => {
      const state = {
        currentTab: {
          query: 'SELECT * FROM foo',
          execute: sinon.stub(),
          tabIndex: 0
        },
        tabs: [{ isUnsaved: true }],
        db: {}
      }
      const store = new Vuex.Store({ state })
      const $route = { path: '/editor' }
      const $router = { push: sinon.stub() }

      wrapper = shallowMount(MainMenu, {
        store,
        mocks: { $route, $router },
        stubs: ['router-link']
      })

      const ctrlEnter = new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true })
      const metaEnter = new KeyboardEvent('keydown', { key: 'Enter', metaKey: true })
      // Running is enabled and route path is editor
      document.dispatchEvent(ctrlEnter)
      expect(state.currentTab.execute.calledOnce).to.equal(true)
      document.dispatchEvent(metaEnter)
      expect(state.currentTab.execute.calledTwice).to.equal(true)

      // Running is disabled and route path is editor
      await wrapper.vm.$set(state, 'db', null)
      document.dispatchEvent(ctrlEnter)
      expect(state.currentTab.execute.calledTwice).to.equal(true)
      document.dispatchEvent(metaEnter)
      expect(state.currentTab.execute.calledTwice).to.equal(true)

      // Running is enabled and route path is not editor
      await wrapper.vm.$set(state, 'db', {})
      await wrapper.vm.$set($route, 'path', '/my-queries')
      document.dispatchEvent(ctrlEnter)
      expect(state.currentTab.execute.calledTwice).to.equal(true)
      document.dispatchEvent(metaEnter)
      expect(state.currentTab.execute.calledTwice).to.equal(true)
    })

  it('Ctrl B calls createNewQuery', async () => {
    const state = {
      currentTab: {
        query: 'SELECT * FROM foo',
        execute: sinon.stub(),
        tabIndex: 0
      },
      tabs: [{ isUnsaved: true }],
      db: {}
    }
    const store = new Vuex.Store({ state })
    const $route = { path: '/editor' }

    wrapper = shallowMount(MainMenu, {
      store,
      mocks: { $route },
      stubs: ['router-link']
    })
    sinon.stub(wrapper.vm, 'createNewQuery')

    const ctrlB = new KeyboardEvent('keydown', { key: 'b', ctrlKey: true })
    const metaB = new KeyboardEvent('keydown', { key: 'b', metaKey: true })
    document.dispatchEvent(ctrlB)
    expect(wrapper.vm.createNewQuery.calledOnce).to.equal(true)
    document.dispatchEvent(metaB)
    expect(wrapper.vm.createNewQuery.calledTwice).to.equal(true)

    await wrapper.vm.$set($route, 'path', '/my-queries')
    document.dispatchEvent(ctrlB)
    expect(wrapper.vm.createNewQuery.calledThrice).to.equal(true)
    document.dispatchEvent(metaB)
    expect(wrapper.vm.createNewQuery.callCount).to.equal(4)
  })

  it('Ctrl S calls checkQueryBeforeSave if the tab is unsaved and route path is /editor',
    async () => {
      const state = {
        currentTab: {
          query: 'SELECT * FROM foo',
          execute: sinon.stub(),
          tabIndex: 0
        },
        tabs: [{ isUnsaved: true }],
        db: {}
      }
      const store = new Vuex.Store({ state })
      const $route = { path: '/editor' }

      wrapper = shallowMount(MainMenu, {
        store,
        mocks: { $route },
        stubs: ['router-link']
      })
      sinon.stub(wrapper.vm, 'checkQueryBeforeSave')

      const ctrlS = new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
      const metaS = new KeyboardEvent('keydown', { key: 's', metaKey: true })
      // tab is unsaved and route is /editor
      document.dispatchEvent(ctrlS)
      expect(wrapper.vm.checkQueryBeforeSave.calledOnce).to.equal(true)
      document.dispatchEvent(metaS)
      expect(wrapper.vm.checkQueryBeforeSave.calledTwice).to.equal(true)

      // tab is saved and route is /editor
      await wrapper.vm.$set(state.tabs[0], 'isUnsaved', false)
      document.dispatchEvent(ctrlS)
      expect(wrapper.vm.checkQueryBeforeSave.calledTwice).to.equal(true)
      document.dispatchEvent(metaS)
      expect(wrapper.vm.checkQueryBeforeSave.calledTwice).to.equal(true)

      // tab is unsaved and route is not /editor
      await wrapper.vm.$set($route, 'path', '/my-queries')
      await wrapper.vm.$set(state.tabs[0], 'isUnsaved', true)
      document.dispatchEvent(ctrlS)
      expect(wrapper.vm.checkQueryBeforeSave.calledTwice).to.equal(true)
      document.dispatchEvent(metaS)
      expect(wrapper.vm.checkQueryBeforeSave.calledTwice).to.equal(true)
    })

  it('Saves the query when no need the new name',
    async () => {
      const state = {
        currentTab: {
          query: 'SELECT * FROM foo',
          execute: sinon.stub(),
          tabIndex: 0
        },
        tabs: [{ id: 1, name: 'foo', isUnsaved: true }],
        db: {}
      }
      const mutations = {
        updateTab: sinon.stub()
      }
      const store = new Vuex.Store({ state, mutations })
      const $route = { path: '/editor' }
      sinon.stub(storedQueries, 'isTabNeedName').returns(false)
      sinon.stub(storedQueries, 'save').returns({
        name: 'foo',
        id: 1,
        query: 'SELECT * FROM foo',
        chart: []
      })

      wrapper = mount(MainMenu, {
        store,
        mocks: { $route },
        stubs: ['router-link', 'app-diagnostic-info']
      })

      await wrapper.find('#save-btn').trigger('click')

      // check that the dialog is closed
      expect(wrapper.find('[data-modal="save"]').exists()).to.equal(false)

      // check that the query was saved via storedQueries.save (newName='')
      expect(storedQueries.save.calledOnceWith(state.currentTab, '')).to.equal(true)

      // check that the tab was updated
      expect(mutations.updateTab.calledOnceWith(state, sinon.match({
        index: 0,
        name: 'foo',
        id: 1,
        query: 'SELECT * FROM foo',
        chart: [],
        isUnsaved: false
      }))).to.equal(true)

      // check that 'querySaved' event was triggered on $root
      expect(createWrapper(wrapper.vm.$root).emitted('querySaved')).to.have.lengthOf(1)
    })

  it('Shows en error when the new name is needed but not specifyied', async () => {
    const state = {
      currentTab: {
        query: 'SELECT * FROM foo',
        execute: sinon.stub(),
        tabIndex: 0
      },
      tabs: [{ id: 1, name: null, tempName: 'Untitled', isUnsaved: true }],
      db: {}
    }
    const mutations = {
      updateTab: sinon.stub()
    }
    const store = new Vuex.Store({ state, mutations })
    const $route = { path: '/editor' }
    sinon.stub(storedQueries, 'isTabNeedName').returns(true)
    sinon.stub(storedQueries, 'save').returns({
      name: 'foo',
      id: 1,
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

    // find Save in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button').wrappers
      .find(button => button.text() === 'Save')
      .trigger('click')

    // check that we have an error message and dialog is still open
    expect(wrapper.find('.text-field-error').text()).to.equal('Query name can\'t be empty')
    expect(wrapper.find('[data-modal="save"]').exists()).to.equal(true)
  })

  it('Saves the query with a new name', async () => {
    const state = {
      currentTab: {
        query: 'SELECT * FROM foo',
        execute: sinon.stub(),
        tabIndex: 0
      },
      tabs: [{ id: 1, name: null, tempName: 'Untitled', isUnsaved: true }],
      db: {}
    }
    const mutations = {
      updateTab: sinon.stub()
    }
    const store = new Vuex.Store({ state, mutations })
    const $route = { path: '/editor' }
    sinon.stub(storedQueries, 'isTabNeedName').returns(true)
    sinon.stub(storedQueries, 'save').returns({
      name: 'foo',
      id: 1,
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

    // enter the new name
    await wrapper.find('.dialog-body input').setValue('foo')

    // find Save in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button').wrappers
      .find(button => button.text() === 'Save')
      .trigger('click')

    // check that the dialog is closed
    expect(wrapper.find('[data-modal="save"]').exists()).to.equal(false)

    // check that the query was saved via storedQueries.save (newName='foo')
    expect(storedQueries.save.calledOnceWith(state.currentTab, 'foo')).to.equal(true)

    // check that the tab was updated
    expect(mutations.updateTab.calledOnceWith(state, sinon.match({
      index: 0,
      name: 'foo',
      id: 1,
      query: 'SELECT * FROM foo',
      chart: [],
      isUnsaved: false
    }))).to.equal(true)

    // check that 'querySaved' event was triggered on $root
    expect(createWrapper(wrapper.vm.$root).emitted('querySaved')).to.have.lengthOf(1)
  })

  it('Saves a predefined query with a new name', async () => {
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
        view: 'chart'
      },
      tabs: [{ id: 1, name: 'foo', isUnsaved: true, isPredefined: true }],
      db: {}
    }
    const mutations = {
      updateTab: sinon.stub()
    }
    const store = new Vuex.Store({ state, mutations })
    const $route = { path: '/editor' }
    sinon.stub(storedQueries, 'isTabNeedName').returns(true)
    sinon.stub(storedQueries, 'save').returns({
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

    // check that the query was saved via storedQueries.save (newName='bar')
    expect(storedQueries.save.calledOnceWith(state.currentTab, 'bar')).to.equal(true)

    // check that the tab was updated
    expect(mutations.updateTab.calledOnceWith(state, sinon.match({
      index: 0,
      name: 'bar',
      id: 2,
      query: 'SELECT * FROM foo',
      chart: [],
      isUnsaved: false
    }))).to.equal(true)

    // check that 'querySaved' event was triggered on $root
    expect(createWrapper(wrapper.vm.$root).emitted('querySaved')).to.have.lengthOf(1)

    // We saved predefined query, so the tab will be created again
    // (because of new id) and it will be without sql result and has default view - table.
    // That's why we need to restore data and view.
    // Check that result and view are preserved in the currentTab:
    expect(state.currentTab.view).to.equal('chart')
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
      tabs: [{ id: 1, name: null, tempName: 'Untitled', isUnsaved: true }],
      db: {}
    }
    const mutations = {
      updateTab: sinon.stub()
    }
    const store = new Vuex.Store({ state, mutations })
    const $route = { path: '/editor' }
    sinon.stub(storedQueries, 'isTabNeedName').returns(true)
    sinon.stub(storedQueries, 'save').returns({
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

    // check that the query was not saved via storedQueries.save
    expect(storedQueries.save.called).to.equal(false)

    // check that the tab was not updated
    expect(mutations.updateTab.called).to.equal(false)

    // check that 'querySaved' event is not listened on $root
    expect(wrapper.vm.$root.$listeners).to.not.have.property('querySaved')
  })
})
