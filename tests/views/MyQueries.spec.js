import { expect } from 'chai'
import sinon from 'sinon'
import { mount, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import MyQueries from '@/views/MyQueries.vue'
import storedQueries from '@/storedQueries'
import { mutations } from '@/store'
import fu from '@/file.utils'

describe('MyQueries.vue', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('Shows start-guide message if there are no saved and predefined queries', () => {
    sinon.stub(storedQueries, 'readPredefinedQueries').resolves([])
    sinon.stub(storedQueries, 'getStoredQueries').returns([])
    const state = {
      predefinedQueries: []
    }
    const mutations = {
      updatePredefinedQueries: sinon.stub()
    }
    const store = new Vuex.Store({ state, mutations })
    const wrapper = shallowMount(MyQueries, { store })

    expect(wrapper.find('#start-guide').exists()).to.equal(true)
  })

  it('Renders the list on saved or predefined queries', async () => {
    sinon.stub(storedQueries, 'readPredefinedQueries').resolves([
      { id: 0, name: 'hello_world', query: '', chart: [], createdAt: '2020-03-08T19:57:56.299Z' }
    ])
    sinon.stub(storedQueries, 'getStoredQueries').returns([
      { id: 1, name: 'foo', query: '', chart: [], createdAt: '2020-11-03T19:57:56.299Z' },
      { id: 2, name: 'bar', query: '', chart: [], createdAt: '2020-12-04T18:53:56.299Z' }
    ])
    const state = {
      predefinedQueries: []
    }

    const store = new Vuex.Store({ state, mutations })
    const wrapper = shallowMount(MyQueries, { store })
    await storedQueries.readPredefinedQueries.returnValues[0]
    await storedQueries.getStoredQueries.returnValues[0]
    await wrapper.vm.$nextTick()

    expect(wrapper.find('#start-guide').exists()).to.equal(false)
    expect(wrapper.find('#toolbar-btns-import').isVisible()).to.equal(true)
    expect(wrapper.find('#toolbar-btns-export').isVisible()).to.equal(false)
    expect(wrapper.find('#toolbar-btns-delete').isVisible()).to.equal(false)

    const rows = wrapper.findAll('tbody tr')
    expect(rows).to.have.lengthOf(3)
    expect(rows.at(0).findAll('td').at(0).text()).to.contains('hello_world')
    expect(rows.at(0).findAll('td').at(1).text()).to.equals('8 March 2020 20:57')
    expect(rows.at(1).findAll('td').at(0).text()).to.equals('foo')
    expect(rows.at(1).findAll('td').at(1).text()).to.equals('3 November 2020 20:57')
    expect(rows.at(2).findAll('td').at(0).text()).to.equals('bar')
    expect(rows.at(2).findAll('td').at(1).text()).to.equals('4 December 2020 19:53')
  })

  it('Filters the list of queries', async () => {
    sinon.stub(storedQueries, 'readPredefinedQueries').resolves([
      { id: 0, name: 'hello_world', query: '', chart: [], createdAt: '2020-03-08T19:57:56.299Z' }
    ])
    sinon.stub(storedQueries, 'getStoredQueries').returns([
      { id: 1, name: 'foo', query: '', chart: [], createdAt: '2020-11-03T19:57:56.299Z' },
      { id: 2, name: 'bar', query: '', chart: [], createdAt: '2020-12-04T18:53:56.299Z' }
    ])
    const state = {
      predefinedQueries: []
    }

    const store = new Vuex.Store({ state, mutations })
    const wrapper = mount(MyQueries, { store })
    await wrapper.find('#toolbar-search input').setValue('OO')
    await wrapper.vm.$nextTick()

    const rows = wrapper.findAll('tbody tr')
    expect(rows).to.have.lengthOf(1)
    expect(rows.at(0).findAll('td').at(0).text()).to.equals('foo')
    expect(rows.at(0).findAll('td').at(1).text()).to.contains('3 November 2020 20:57')
  })

  it('Predefined query has a badge', async () => {
    sinon.stub(storedQueries, 'readPredefinedQueries').resolves([
      { id: 0, name: 'hello_world', query: '', chart: [], createdAt: '2020-03-08T19:57:56.299Z' }
    ])
    sinon.stub(storedQueries, 'getStoredQueries').returns([
      { id: 1, name: 'foo', query: '', chart: [], createdAt: '2020-11-03T19:57:56.299Z' }
    ])
    const state = {
      predefinedQueries: []
    }

    const store = new Vuex.Store({ state, mutations })
    const wrapper = shallowMount(MyQueries, { store })
    await storedQueries.readPredefinedQueries.returnValues[0]
    await storedQueries.getStoredQueries.returnValues[0]
    await wrapper.vm.$nextTick()

    const rows = wrapper.findAll('tbody tr')
    expect(rows.at(0).find('td .badge').exists()).to.equals(true)
    expect(rows.at(1).find('td .badge').exists()).to.equals(false)
  })

  it('Exports one query', async () => {
    sinon.stub(storedQueries, 'readPredefinedQueries').resolves([])
    sinon.stub(storedQueries, 'getStoredQueries').returns([
      { id: 1, name: 'foo', query: '', chart: [], createdAt: '2020-11-03T19:57:56.299Z' }
    ])
    sinon.stub(storedQueries, 'serialiseQueries').returns('I am a serialized query')
    sinon.stub(fu, 'exportToFile')
    const state = {
      predefinedQueries: []
    }

    const store = new Vuex.Store({ state, mutations })
    const wrapper = mount(MyQueries, { store })
    await storedQueries.readPredefinedQueries.returnValues[0]
    await storedQueries.getStoredQueries.returnValues[0]
    await wrapper.vm.$nextTick()
    await wrapper.findComponent({ name: 'ExportIcon' }).find('svg').trigger('click')
    expect(fu.exportToFile.calledOnceWith('I am a serialized query', 'foo.json')).to.equals(true)
  })

  it('Duplicates a query', async () => {
    sinon.stub(storedQueries, 'readPredefinedQueries').resolves([])
    const queryInStorage = {
      id: 1,
      name: 'foo',
      query: '',
      chart: [],
      createdAt: '2020-11-03T19:57:56.299Z'
    }
    sinon.stub(storedQueries, 'getStoredQueries').returns([queryInStorage])
    sinon.stub(storedQueries, 'updateStorage')
    const newQuery = {
      id: 2,
      name: 'foo copy',
      query: '',
      chart: [],
      createdAt: '2020-12-03T19:57:56.299Z'
    }
    sinon.stub(storedQueries, 'duplicateQuery').returns(newQuery)
    const state = {
      predefinedQueries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(MyQueries, { store })
    await storedQueries.readPredefinedQueries.returnValues[0]
    await storedQueries.getStoredQueries.returnValues[0]
    await wrapper.vm.$nextTick()
    await wrapper.findComponent({ name: 'CopyIcon' }).find('svg').trigger('click')

    expect(storedQueries.duplicateQuery.calledOnceWith(queryInStorage)).to.equals(true)

    const rows = wrapper.findAll('tbody tr')
    expect(rows).to.have.lengthOf(2)
    expect(rows.at(1).findAll('td').at(0).text()).to.equals('foo copy')
    expect(rows.at(1).findAll('td').at(1).text()).to.contains('3 December 2020 20:57')
    expect(storedQueries.updateStorage.calledOnceWith(sinon.match([queryInStorage, newQuery])))
      .to.equals(true)
  })

  it('Makes the copy of the query selected if all queries were selected before duplication',
    async () => {
      sinon.stub(storedQueries, 'readPredefinedQueries').resolves([])
      const queryInStorage = {
        id: 1,
        name: 'foo',
        query: '',
        chart: [],
        createdAt: '2020-11-03T19:57:56.299Z'
      }
      sinon.stub(storedQueries, 'getStoredQueries').returns([queryInStorage])
      sinon.stub(storedQueries, 'updateStorage')
      const newQuery = {
        id: 2,
        name: 'foo copy',
        query: '',
        chart: [],
        createdAt: '2020-12-03T19:57:56.299Z'
      }
      sinon.stub(storedQueries, 'duplicateQuery').returns(newQuery)
      const state = {
        predefinedQueries: []
      }
      const store = new Vuex.Store({ state, mutations })

      const wrapper = mount(MyQueries, { store })
      await storedQueries.readPredefinedQueries.returnValues[0]
      await storedQueries.getStoredQueries.returnValues[0]
      await wrapper.vm.$nextTick()
      await wrapper.findComponent({ ref: 'mainCheckBox' }).find('.checkbox-container').trigger('click')
      await wrapper.findComponent({ name: 'CopyIcon' }).find('svg').trigger('click')

      const checkboxes = wrapper.findAllComponents({ ref: 'rowCheckBox' })
      expect(checkboxes.at(0).vm.checked).to.equals(true)
      expect(checkboxes.at(1).vm.checked).to.equals(true)
    })

  it('Opens a query', async () => {
    sinon.stub(storedQueries, 'readPredefinedQueries').resolves([])
    const queryInStorage = {
      id: 1,
      name: 'foo',
      query: '',
      chart: [],
      createdAt: '2020-11-03T19:57:56.299Z'
    }
    sinon.stub(storedQueries, 'getStoredQueries').returns([queryInStorage])

    const state = {
      predefinedQueries: []
    }
    const actions = { addTab: sinon.stub().resolves(1) }
    sinon.spy(mutations, 'setCurrentTabId')
    const $router = { push: sinon.stub() }
    const store = new Vuex.Store({ state, mutations, actions })

    const wrapper = shallowMount(MyQueries, {
      store,
      mocks: { $router }
    })
    await storedQueries.readPredefinedQueries.returnValues[0]
    await storedQueries.getStoredQueries.returnValues[0]
    await wrapper.vm.$nextTick()
    await wrapper.find('tbody tr').trigger('click')

    expect(actions.addTab.calledOnce).to.equals(true)
    expect(actions.addTab.getCall(0).args[1]).to.equals(queryInStorage)
    await actions.addTab.returnValues[0]
    expect(mutations.setCurrentTabId.calledOnceWith(state, 1)).to.equals(true)
    expect($router.push.calledOnceWith('/editor')).to.equals(true)
  })

  it('Rename is not available for predefined queries', async () => {
    sinon.stub(storedQueries, 'readPredefinedQueries').resolves([
      { id: 0, name: 'hello_world', query: '', chart: [], createdAt: '2020-03-08T19:57:56.299Z' }
    ])
    sinon.stub(storedQueries, 'getStoredQueries').returns([])

    const state = {
      predefinedQueries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(MyQueries, { store })
    await storedQueries.readPredefinedQueries.returnValues[0]
    await storedQueries.getStoredQueries.returnValues[0]
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent({ name: 'RenameIcon' }).exists()).to.equals(false)
  })

  it('Renames a query', async () => {
    sinon.stub(storedQueries, 'readPredefinedQueries').resolves([])
    sinon.stub(storedQueries, 'getStoredQueries').returns([
      { id: 1, name: 'foo', query: '', chart: [], createdAt: '2020-11-03T19:57:56.299Z' }
    ])
    sinon.stub(storedQueries, 'updateStorage')
    const state = {
      tabs: [{ id: 1, name: 'foo' }],
      predefinedQueries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(MyQueries, { store })
    await storedQueries.readPredefinedQueries.returnValues[0]
    await storedQueries.getStoredQueries.returnValues[0]
    await wrapper.vm.$nextTick()

    // click Rename icon in the grid
    await wrapper.findComponent({ name: 'RenameIcon' }).find('svg').trigger('click')

    // check that rename dialog is open
    expect(wrapper.find('[data-modal="rename"]').exists()).to.equal(true)

    // check that input is filled by the current query name
    expect(wrapper.find('.dialog-body input').element.value).to.equals('foo')

    // change the name
    await wrapper.find('.dialog-body input').setValue('bar')

    // find Rename in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button').wrappers
      .find(button => button.text() === 'Rename')
      .trigger('click')

    // check that the name in the grid is changed
    expect(wrapper.find('tbody tr td').text()).to.equals('bar')

    // check that storage is updated
    expect(storedQueries.updateStorage.calledOnceWith(sinon.match([{
      id: 1,
      name: 'bar',
      query: '',
      chart: [],
      createdAt: '2020-11-03T19:57:56.299Z'
    }]))).to.equals(true)

    // check that coresponding tab also changed the name
    expect(state.tabs[0].name).to.equals('bar')

    // check that rename dialog is closed
    expect(wrapper.find('[data-modal="rename"]').exists()).to.equal(false)
  })

  it('Shows an error if try to rename to empty string', async () => {
    sinon.stub(storedQueries, 'readPredefinedQueries').resolves([])
    sinon.stub(storedQueries, 'getStoredQueries').returns([
      { id: 1, name: 'foo', query: '', chart: [], createdAt: '2020-11-03T19:57:56.299Z' }
    ])
    sinon.stub(storedQueries, 'updateStorage')
    const state = {
      tabs: [{ id: 1, name: 'foo' }],
      predefinedQueries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(MyQueries, { store })
    await storedQueries.readPredefinedQueries.returnValues[0]
    await storedQueries.getStoredQueries.returnValues[0]
    await wrapper.vm.$nextTick()

    // click Rename icon in the grid
    await wrapper.findComponent({ name: 'RenameIcon' }).find('svg').trigger('click')

    // change the name
    await wrapper.find('.dialog-body input').setValue('')

    // find Rename in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button').wrappers
      .find(button => button.text() === 'Rename')
      .trigger('click')

    expect(wrapper.find('.dialog-body .text-field-error').text())
      .to.equals("Query name can't be empty")
    // check that rename dialog is still open
    expect(wrapper.find('[data-modal="rename"]').exists()).to.equal(true)
  })

  it('Imports queries', async () => {
    sinon.stub(storedQueries, 'readPredefinedQueries').resolves([])
    const queryInStorage = {
      id: 1,
      name: 'foo',
      query: '',
      chart: [],
      createdAt: '2020-11-03T19:57:56.299Z'
    }
    sinon.stub(storedQueries, 'getStoredQueries').returns([queryInStorage])
    sinon.stub(storedQueries, 'updateStorage')
    const importedQuery = {
      id: 2,
      name: 'bar',
      query: '',
      chart: [],
      createdAt: '2020-12-03T19:57:56.299Z'
    }
    sinon.stub(storedQueries, 'importQueries').resolves([importedQuery])
    const state = {
      predefinedQueries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = shallowMount(MyQueries, { store })
    await storedQueries.readPredefinedQueries.returnValues[0]
    await storedQueries.getStoredQueries.returnValues[0]
    await wrapper.vm.$nextTick()

    // click Import
    await wrapper.find('#toolbar-btns-import').trigger('click')

    const rows = wrapper.findAll('tbody tr')
    expect(rows).to.have.lengthOf(2)
    expect(rows.at(1).findAll('td').at(0).text()).to.equals('bar')
    expect(rows.at(1).findAll('td').at(1).text()).to.equals('3 December 2020 20:57')
    expect(storedQueries.updateStorage.calledOnceWith(
      sinon.match([queryInStorage, importedQuery])
    )).to.equals(true)
  })

  it('Imported queries are selected if master check box is checked', async () => {
    sinon.stub(storedQueries, 'readPredefinedQueries').resolves([])
    const queryInStorage = {
      id: 1,
      name: 'foo',
      query: '',
      chart: [],
      createdAt: '2020-11-03T19:57:56.299Z'
    }
    sinon.stub(storedQueries, 'getStoredQueries').returns([queryInStorage])
    sinon.stub(storedQueries, 'updateStorage')
    const importedQuery = {
      id: 2,
      name: 'bar',
      query: '',
      chart: [],
      createdAt: '2020-12-03T19:57:56.299Z'
    }
    sinon.stub(storedQueries, 'importQueries').resolves([importedQuery])
    const state = {
      predefinedQueries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(MyQueries, { store })
    await storedQueries.readPredefinedQueries.returnValues[0]
    await storedQueries.getStoredQueries.returnValues[0]
    await wrapper.vm.$nextTick()

    // click on master checkbox
    await wrapper.findComponent({ ref: 'mainCheckBox' }).find('.checkbox-container').trigger('click')

    // click Import
    await wrapper.find('#toolbar-btns-import').trigger('click')

    const checkboxes = wrapper.findAllComponents({ ref: 'rowCheckBox' })
    expect(checkboxes.at(0).vm.checked).to.equals(true)
    expect(checkboxes.at(1).vm.checked).to.equals(true)
  })

  it('Deletion is not available for predefined queries', async () => {
    sinon.stub(storedQueries, 'readPredefinedQueries').resolves([
      { id: 0, name: 'hello_world', query: '', chart: [], createdAt: '2020-03-08T19:57:56.299Z' }
    ])
    sinon.stub(storedQueries, 'getStoredQueries').returns([])

    const state = {
      predefinedQueries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(MyQueries, { store })
    await storedQueries.readPredefinedQueries.returnValues[0]
    await storedQueries.getStoredQueries.returnValues[0]
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent({ name: 'DeleteIcon' }).exists()).to.equals(false)
  })

  it('Delete a query', async () => {
    sinon.stub(storedQueries, 'readPredefinedQueries').resolves([])
    const foo = {
      id: 1,
      name: 'foo',
      query: '',
      chart: [],
      createdAt: '2020-11-03T19:57:56.299Z'
    }
    const bar = {
      id: 2,
      name: 'bar',
      query: '',
      chart: [],
      createdAt: '2020-11-03T19:57:56.299Z'
    }
    sinon.stub(storedQueries, 'getStoredQueries').returns([foo, bar])
    sinon.stub(storedQueries, 'updateStorage')

    const state = {
      tabs: [{ id: 1 }, { id: 2 }],
      predefinedQueries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(MyQueries, { store })
    await storedQueries.readPredefinedQueries.returnValues[0]
    await storedQueries.getStoredQueries.returnValues[0]
    await wrapper.vm.$nextTick()
    // click Delete icon in the first row of the grid
    await wrapper.findComponent({ name: 'DeleteIcon' }).find('svg').trigger('click')

    // check that delete dialog is open
    expect(wrapper.find('[data-modal="delete"]').exists()).to.equal(true)

    // check the message in the dialog
    expect(wrapper.find('.dialog-body').text()).to.contains('"foo"?')

    // find Delete in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button').wrappers
      .find(button => button.text() === 'Delete')
      .trigger('click')

    // check the rows in the grid
    expect(wrapper.findAll('tbody tr')).to.have.lengthOf(1)
    expect(wrapper.findAll('tbody tr').at(0).find('td').text()).to.equals('bar')

    // check that deleted query was also deleted from tabs
    expect(state.tabs).to.have.lengthOf(1)
    expect(state.tabs[0].id).to.equals(2)

    // check that storage is updated
    expect(storedQueries.updateStorage.calledOnceWith(sinon.match([bar]))).to.equals(true)

    // check that delete dialog is closed
    expect(wrapper.find('[data-modal="delete"]').exists()).to.equal(false)
  })

  it('Group operations are available when there are checked rows', async () => {
    sinon.stub(storedQueries, 'readPredefinedQueries').resolves([
      { id: 0, name: 'hello_world', query: '', chart: [], createdAt: '2020-03-08T19:57:56.299Z' }
    ])
    sinon.stub(storedQueries, 'getStoredQueries').returns([
      { id: 1, name: 'foo', query: '', chart: [], createdAt: '2020-11-03T19:57:56.299Z' }
    ])

    const state = {
      predefinedQueries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(MyQueries, { store })
    await storedQueries.readPredefinedQueries.returnValues[0]
    await storedQueries.getStoredQueries.returnValues[0]
    await wrapper.vm.$nextTick()

    expect(wrapper.find('#toolbar-btns-export').isVisible()).to.equal(false)
    expect(wrapper.find('#toolbar-btns-delete').isVisible()).to.equal(false)

    const rows = wrapper.findAll('tbody tr')

    // Select a predefined query
    await rows.at(0).find('.checkbox-container').trigger('click')
    expect(wrapper.find('#toolbar-btns-export').isVisible()).to.equal(true)
    expect(wrapper.find('#toolbar-btns-delete').isVisible()).to.equal(false)

    // Select also not predefined query
    await rows.at(1).find('.checkbox-container').trigger('click')
    expect(wrapper.find('#toolbar-btns-export').isVisible()).to.equal(true)
    expect(wrapper.find('#toolbar-btns-delete').isVisible()).to.equal(true)

    // Uncheck a predefined query
    await rows.at(0).find('.checkbox-container').trigger('click')
    expect(wrapper.find('#toolbar-btns-export').isVisible()).to.equal(true)
    expect(wrapper.find('#toolbar-btns-delete').isVisible()).to.equal(true)
  })

  it('Exports a group of queries', async () => {
    const predefinedQuery = {
      id: 0,
      name: 'hello_world',
      query: '',
      chart: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    sinon.stub(storedQueries, 'readPredefinedQueries').resolves([predefinedQuery])
    const queryInStore = {
      id: 1,
      name: 'foo',
      query: '',
      chart: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    sinon.stub(storedQueries, 'getStoredQueries').returns([queryInStore, {
      id: 2,
      name: 'bar',
      query: '',
      chart: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }])

    sinon.stub(storedQueries, 'serialiseQueries').returns('I am a serialized queries')
    sinon.stub(fu, 'exportToFile')

    const state = {
      predefinedQueries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(MyQueries, { store })
    await storedQueries.readPredefinedQueries.returnValues[0]
    await storedQueries.getStoredQueries.returnValues[0]
    await wrapper.vm.$nextTick()

    const rows = wrapper.findAll('tbody tr')

    // Select queries
    await rows.at(0).find('.checkbox-container').trigger('click')
    await rows.at(1).find('.checkbox-container').trigger('click')

    await wrapper.find('#toolbar-btns-export').trigger('click')

    expect(storedQueries.serialiseQueries.calledOnceWith(
      sinon.match([predefinedQuery, queryInStore])
    )).to.equals(true)

    expect(
      fu.exportToFile.calledOnceWith('I am a serialized queries', 'My sqliteviz queries.json')
    ).to.equals(true)
  })

  it('Exports all queries', async () => {
    const predefinedQuery = {
      id: 0,
      name: 'hello_world',
      query: '',
      chart: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    sinon.stub(storedQueries, 'readPredefinedQueries').resolves([predefinedQuery])
    const queryInStore = {
      id: 1,
      name: 'foo',
      query: '',
      chart: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    sinon.stub(storedQueries, 'getStoredQueries').returns([queryInStore])

    sinon.stub(storedQueries, 'serialiseQueries').returns('I am a serialized queries')
    sinon.stub(fu, 'exportToFile')

    const state = {
      predefinedQueries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(MyQueries, { store })
    await storedQueries.readPredefinedQueries.returnValues[0]
    await storedQueries.getStoredQueries.returnValues[0]
    await wrapper.vm.$nextTick()

    await wrapper.findComponent({ ref: 'mainCheckBox' }).find('.checkbox-container')
      .trigger('click')

    await wrapper.find('#toolbar-btns-export').trigger('click')

    expect(storedQueries.serialiseQueries.calledOnceWith(
      sinon.match([predefinedQuery, queryInStore])
    )).to.equals(true)

    expect(
      fu.exportToFile.calledOnceWith('I am a serialized queries', 'My sqliteviz queries.json')
    ).to.equals(true)
  })

  it('Deletes a group of queries', async () => {
    const predefinedQuery = {
      id: 0,
      name: 'hello_world',
      query: '',
      chart: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    sinon.stub(storedQueries, 'readPredefinedQueries').resolves([predefinedQuery])
    const foo = {
      id: 1,
      name: 'foo',
      query: '',
      chart: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    const bar = {
      id: 2,
      name: 'bar',
      query: '',
      chart: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    const baz = {
      id: 3,
      name: 'baz',
      query: '',
      chart: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    sinon.stub(storedQueries, 'getStoredQueries').returns([foo, bar, baz])

    sinon.stub(storedQueries, 'updateStorage')

    const state = {
      tabs: [{ id: 1 }, { id: 2 }, { id: 0 }, { id: 3 }],
      predefinedQueries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(MyQueries, { store })
    await storedQueries.readPredefinedQueries.returnValues[0]
    await storedQueries.getStoredQueries.returnValues[0]
    await wrapper.vm.$nextTick()

    const rows = wrapper.findAll('tbody tr')

    // Select queries (don't select predefined queries)
    await rows.at(1).find('.checkbox-container').trigger('click')
    await rows.at(2).find('.checkbox-container').trigger('click')

    await wrapper.find('#toolbar-btns-delete').trigger('click')

    // check that delete dialog is open
    expect(wrapper.find('[data-modal="delete"]').exists()).to.equal(true)

    // check the message in the dialog
    expect(wrapper.find('.dialog-body').text())
      .to.contains('Are you sure you want to delete 2 queries?')

    // find Delete in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button').wrappers
      .find(button => button.text() === 'Delete')
      .trigger('click')

    // check the rows in the grid
    expect(wrapper.findAll('tbody tr')).to.have.lengthOf(2)
    expect(wrapper.findAll('tbody tr').at(0).find('td').text()).to.contains('hello_world')
    expect(wrapper.findAll('tbody tr').at(1).find('td').text()).to.equals('baz')

    // check that deleted query was also deleted from tabs
    expect(state.tabs).to.have.lengthOf(2)
    expect(state.tabs[0].id).to.equals(0)
    expect(state.tabs[1].id).to.equals(3)

    // check that storage is updated
    expect(storedQueries.updateStorage.calledOnceWith(sinon.match([baz]))).to.equals(true)

    // check that delete dialog is closed
    expect(wrapper.find('[data-modal="delete"]').exists()).to.equal(false)
  })

  it('Ignores predefined queries during deletion', async () => {
    const predefinedQuery = {
      id: 0,
      name: 'hello_world',
      query: '',
      chart: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    sinon.stub(storedQueries, 'readPredefinedQueries').resolves([predefinedQuery])
    const foo = {
      id: 1,
      name: 'foo',
      query: '',
      chart: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    const bar = {
      id: 2,
      name: 'bar',
      query: '',
      chart: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    sinon.stub(storedQueries, 'getStoredQueries').returns([foo, bar])
    sinon.stub(storedQueries, 'updateStorage')

    const state = {
      tabs: [],
      predefinedQueries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(MyQueries, { store })
    await storedQueries.readPredefinedQueries.returnValues[0]
    await storedQueries.getStoredQueries.returnValues[0]
    await wrapper.vm.$nextTick()

    const rows = wrapper.findAll('tbody tr')

    // Select queries (select also predefined queries)
    await rows.at(0).find('.checkbox-container').trigger('click')
    await rows.at(1).find('.checkbox-container').trigger('click')

    await wrapper.find('#toolbar-btns-delete').trigger('click')

    // check that delete dialog is open
    expect(wrapper.find('[data-modal="delete"]').exists()).to.equal(true)

    // check the message in the dialog
    expect(wrapper.find('.dialog-body').text())
      .to.contains('Are you sure you want to delete 1 query?')

    expect(wrapper.find('.dialog-body #note').isVisible()).to.equals(true)

    // find Delete in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button').wrappers
      .find(button => button.text() === 'Delete')
      .trigger('click')

    // check the rows in the grid
    expect(wrapper.findAll('tbody tr')).to.have.lengthOf(2)
    expect(wrapper.findAll('tbody tr').at(0).find('td').text()).to.contains('hello_world')
    expect(wrapper.findAll('tbody tr').at(1).find('td').text()).to.equals('bar')

    // check that storage is updated
    expect(storedQueries.updateStorage.calledOnceWith(sinon.match([bar]))).to.equals(true)

    // check that delete dialog is closed
    expect(wrapper.find('[data-modal="delete"]').exists()).to.equal(false)
  })

  it('Deletes all queries ignoring predefined ones', async () => {
    const predefinedQuery = {
      id: 0,
      name: 'hello_world',
      query: '',
      chart: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    sinon.stub(storedQueries, 'readPredefinedQueries').resolves([predefinedQuery])
    const foo = {
      id: 1,
      name: 'foo',
      query: '',
      chart: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    const bar = {
      id: 2,
      name: 'bar',
      query: '',
      chart: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    sinon.stub(storedQueries, 'getStoredQueries').returns([foo, bar])
    sinon.stub(storedQueries, 'updateStorage')

    const state = {
      tabs: [],
      predefinedQueries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(MyQueries, { store })
    await storedQueries.readPredefinedQueries.returnValues[0]
    await storedQueries.getStoredQueries.returnValues[0]
    await wrapper.vm.$nextTick()

    await wrapper.findComponent({ ref: 'mainCheckBox' }).find('.checkbox-container')
      .trigger('click')

    await wrapper.find('#toolbar-btns-delete').trigger('click')

    // check that delete dialog is open
    expect(wrapper.find('[data-modal="delete"]').exists()).to.equal(true)

    // check the message in the dialog
    expect(wrapper.find('.dialog-body').text())
      .to.contains('Are you sure you want to delete 2 queries?')

    expect(wrapper.find('.dialog-body #note').isVisible()).to.equals(true)

    // find Delete in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button').wrappers
      .find(button => button.text() === 'Delete')
      .trigger('click')

    // check the rows in the grid
    expect(wrapper.findAll('tbody tr')).to.have.lengthOf(1)
    expect(wrapper.findAll('tbody tr').at(0).find('td').text()).to.contains('hello_world')

    // check that storage is updated
    expect(storedQueries.updateStorage.calledOnceWith(sinon.match([]))).to.equals(true)

    // check that delete dialog is closed
    expect(wrapper.find('[data-modal="delete"]').exists()).to.equal(false)
  })

  it('Main checkbox', async () => {
    sinon.stub(storedQueries, 'readPredefinedQueries').resolves([])
    const foo = {
      id: 1,
      name: 'foo',
      query: '',
      chart: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    const bar = {
      id: 2,
      name: 'bar',
      query: '',
      chart: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    sinon.stub(storedQueries, 'getStoredQueries').returns([foo, bar])

    const state = {
      predefinedQueries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(MyQueries, { store })
    await storedQueries.readPredefinedQueries.returnValues[0]
    await storedQueries.getStoredQueries.returnValues[0]
    await wrapper.vm.$nextTick()

    const mainCheckBox = wrapper.findComponent({ ref: 'mainCheckBox' })
    // Select all with main checkbox
    await mainCheckBox.find('.checkbox-container').trigger('click')

    const checkboxes = wrapper.findAllComponents({ ref: 'rowCheckBox' })
    expect(checkboxes.at(0).vm.checked).to.equals(true)
    expect(checkboxes.at(1).vm.checked).to.equals(true)

    // Uncheck first row - main checkbox bocomes not checked
    await wrapper.find('tbody tr .checkbox-container').trigger('click')
    expect(mainCheckBox.vm.checked).to.equals(false)

    // Select all again ...
    await mainCheckBox.find('.checkbox-container').trigger('click')
    // ... and uncheck all
    await mainCheckBox.find('.checkbox-container').trigger('click')
    expect(checkboxes.at(0).vm.checked).to.equals(false)
    expect(checkboxes.at(0).vm.checked).to.equals(false)
  })
})
