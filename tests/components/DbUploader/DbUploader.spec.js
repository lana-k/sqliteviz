import { expect } from 'chai'
import sinon from 'sinon'
import Vuex from 'vuex'
import { shallowMount, mount } from '@vue/test-utils'
import DbUploader from '@/components/DbUploader'
import fu from '@/lib/utils/fileIo'
import database from '@/lib/database'
import csv from '@/components/DbUploader/csv'

describe('DbUploader.vue', () => {
  let state = {}
  let mutations = {}
  let store = {}

  beforeEach(() => {
    // mock store state and mutations
    state = {}
    mutations = {
      saveSchema: sinon.stub(),
      setDb: sinon.stub()
    }
    store = new Vuex.Store({ state, mutations })
  })

  afterEach(() => {
    sinon.restore()
  })

  it('loads db on click and redirects to /editor', async () => {
    // mock getting a file from user
    const file = {}
    sinon.stub(fu, 'getFileFromUser').resolves(file)

    // mock db loading
    const schema = {}
    const db = {
      loadDb: sinon.stub().resolves(schema)
    }
    sinon.stub(database, 'getNewDatabase').returns(db)

    // mock router
    const $router = { push: sinon.stub() }
    const $route = { path: '/' }

    // mount the component
    const wrapper = shallowMount(DbUploader, {
      store,
      mocks: { $router, $route }
    })

    await wrapper.find('.drop-area').trigger('click')
    expect(db.loadDb.calledOnceWith(file)).to.equal(true)
    await db.loadDb.returnValues[0]
    expect(mutations.saveSchema.calledOnceWith(state, schema)).to.equal(true)
    expect($router.push.calledOnceWith('/editor')).to.equal(true)
  })

  it('loads db on drop and redirects to /editor', async () => {
    // mock db loading
    const schema = {}
    const db = {
      loadDb: sinon.stub().resolves(schema)
    }
    sinon.stub(database, 'getNewDatabase').returns(db)

    // mock router
    const $router = { push: sinon.stub() }
    const $route = { path: '/' }

    // mount the component
    const wrapper = shallowMount(DbUploader, {
      store,
      mocks: { $router, $route }
    })

    // mock a file dropped by a user
    const file = {}
    const dropData = { dataTransfer: new DataTransfer() }
    Object.defineProperty(dropData.dataTransfer, 'files', {
      value: [file],
      writable: false
    })

    await wrapper.find('.drop-area').trigger('drop', dropData)
    expect(db.loadDb.calledOnceWith(file)).to.equal(true)
    await db.loadDb.returnValues[0]
    expect(mutations.saveSchema.calledOnceWith(state, schema)).to.equal(true)
    expect($router.push.calledOnceWith('/editor')).to.equal(true)
  })

  it("doesn't redirect if already on /editor", async () => {
    // mock getting a file from user
    const file = {}
    sinon.stub(fu, 'getFileFromUser').resolves(file)

    // mock db loading
    const schema = {}
    const db = {
      loadDb: sinon.stub().resolves(schema)
    }
    sinon.stub(database, 'getNewDatabase').returns(db)

    // mock router
    const $router = { push: sinon.stub() }
    const $route = { path: '/editor' }

    // mount the component
    const wrapper = shallowMount(DbUploader, {
      store,
      mocks: { $router, $route }
    })

    await wrapper.find('.drop-area').trigger('click')
    await db.loadDb.returnValues[0]
    expect($router.push.called).to.equal(false)
  })
})

describe('DbUploader.vue import CSV', () => {
  let state = {}
  let mutations = {}
  let actions = {}
  const newTabId = 1
  let store = {}

  // mock router
  const $router = { }
  const $route = { path: '/' }

  let clock
  let wrapper

  beforeEach(() => {
    // mock getting a file from user
    sinon.stub(fu, 'getFileFromUser').resolves({ type: 'text/csv', name: 'foo.csv' })

    clock = sinon.useFakeTimers()

    // mock store state and mutations
    state = {}
    mutations = {
      saveSchema: sinon.stub(),
      setDb: sinon.stub(),
      setCurrentTabId: sinon.stub()
    }
    actions = {
      addTab: sinon.stub().resolves(newTabId)
    }
    store = new Vuex.Store({ state, mutations, actions })

    $router.push = sinon.stub()

    // mount the component
    wrapper = mount(DbUploader, {
      store,
      mocks: { $router, $route }
    })
  })

  afterEach(() => {
    sinon.restore()
  })

  it('shows parse dialog if gets csv file', async () => {
    sinon.stub(csv, 'parse').resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: [
          [1, 'foo'],
          [2, 'bar']
        ]
      },
      messages: [{
        code: 'UndetectableDelimiter',
        message: 'Comma was used as a standart delimiter',
        row: 0,
        type: 'info',
        hint: undefined
      }]
    })

    await wrapper.find('.drop-area').trigger('click')
    await csv.parse.returnValues[0]
    await wrapper.vm.animationPromise
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-modal="parse"]').exists()).to.equal(true)
    expect(wrapper.findComponent({ name: 'delimiter-selector' }).vm.value).to.equal('|')
    expect(wrapper.find('#quote-char input').element.value).to.equal('"')
    expect(wrapper.find('#escape-char input').element.value).to.equal('"')
    expect(wrapper.findComponent({ name: 'check-box' }).vm.checked).to.equal(true)
    const rows = wrapper.findAll('tbody tr')
    expect(rows).to.have.lengthOf(2)
    expect(rows.at(0).findAll('td').at(0).text()).to.equal('1')
    expect(rows.at(0).findAll('td').at(1).text()).to.equal('foo')
    expect(rows.at(1).findAll('td').at(0).text()).to.equal('2')
    expect(rows.at(1).findAll('td').at(1).text()).to.equal('bar')
    expect(wrapper.findComponent({ name: 'logs' }).text())
      .to.include('Information about row 0. Comma was used as a standart delimiter.')
    expect(wrapper.findComponent({ name: 'logs' }).text())
      .to.include('Preview parsing is completed in')
    expect(wrapper.find('#csv-finish').isVisible()).to.equal(false)
    expect(wrapper.find('#csv-import').isVisible()).to.equal(true)
  })

  it('reparses when parameters changes', async () => {
    const parse = sinon.stub(csv, 'parse')
    parse.onCall(0).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: [
          [1, 'foo']
        ]
      }
    })

    await wrapper.find('.drop-area').trigger('click')
    await csv.parse.returnValues[0]
    await wrapper.vm.animationPromise
    await wrapper.vm.$nextTick()

    parse.onCall(1).resolves({
      delimiter: ',',
      data: {
        columns: ['col1', 'col2'],
        values: [
          [2, 'bar']
        ]
      },
      hasErrors: false
    })
    await wrapper.find('.delimiter-selector-container input').setValue(',')
    expect(parse.callCount).to.equal(2)
    await csv.parse.returnValues[1]

    let rows = wrapper.findAll('tbody tr')
    expect(rows).to.have.lengthOf(1)
    expect(rows.at(0).findAll('td').at(0).text()).to.equal('2')
    expect(rows.at(0).findAll('td').at(1).text()).to.equal('bar')
    expect(wrapper.findComponent({ name: 'logs' }).text())
      .to.include('Preview parsing is completed in')

    parse.onCall(2).resolves({
      delimiter: ',',
      data: {
        columns: ['col1', 'col2'],
        values: [
          [3, 'baz']
        ]
      },
      hasErrors: true,
      messages: [{
        code: 'MissingQuotes',
        message: 'Quote is missed',
        row: 0,
        type: 'error',
        hint: 'Edit your CSV so that the field has a closing quote char.'
      }]
    })

    await wrapper.find('#quote-char input').setValue("'")
    expect(parse.callCount).to.equal(3)
    await csv.parse.returnValues[2]
    rows = wrapper.findAll('tbody tr')
    expect(rows).to.have.lengthOf(1)
    expect(rows.at(0).findAll('td').at(0).text()).to.equal('3')
    expect(rows.at(0).findAll('td').at(1).text()).to.equal('baz')
    expect(wrapper.findComponent({ name: 'logs' }).text())
      .to.contain('Error in row 0. Quote is missed. Edit your CSV so that the field has a closing quote char.')
    expect(wrapper.findComponent({ name: 'logs' }).text())
      .to.not.contain('Preview parsing is completed in')

    parse.onCall(3).resolves({
      delimiter: ',',
      data: {
        columns: ['col1', 'col2'],
        values: [
          [4, 'qux']
        ]
      },
      hasErrors: false
    })
    await wrapper.find('#escape-char input').setValue("'")
    expect(parse.callCount).to.equal(4)
    await csv.parse.returnValues[3]
    rows = wrapper.findAll('tbody tr')
    expect(rows).to.have.lengthOf(1)
    expect(rows.at(0).findAll('td').at(0).text()).to.equal('4')
    expect(rows.at(0).findAll('td').at(1).text()).to.equal('qux')
    expect(wrapper.findComponent({ name: 'logs' }).text())
      .to.contain('Preview parsing is completed in')

    parse.onCall(4).resolves({
      delimiter: ',',
      data: {
        columns: ['col1', 'col2'],
        values: [
          [5, 'corge']
        ]
      },
      hasErrors: false
    })
    await wrapper.findComponent({ name: 'check-box' }).trigger('click')
    expect(parse.callCount).to.equal(5)
    await csv.parse.returnValues[4]
    rows = wrapper.findAll('tbody tr')
    expect(rows).to.have.lengthOf(1)
    expect(rows.at(0).findAll('td').at(0).text()).to.equal('5')
    expect(rows.at(0).findAll('td').at(1).text()).to.equal('corge')
    expect(wrapper.findComponent({ name: 'logs' }).text())
      .to.include('Preview parsing is completed in')
  })

  it('has proper state before parsing is complete', async () => {
    const parse = sinon.stub(csv, 'parse')
    parse.onCall(0).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: [
          [1, 'foo']
        ]
      }
    })

    await wrapper.find('.drop-area').trigger('click')
    await csv.parse.returnValues[0]
    await wrapper.vm.animationPromise
    await wrapper.vm.$nextTick()

    let resolveParsing
    parse.onCall(1).returns(new Promise(resolve => {
      resolveParsing = resolve
    }))
    await wrapper.find('#csv-import').trigger('click')

    // "Parsing CSV..." in the logs
    expect(wrapper.findComponent({ name: 'logs' }).findAll('.msg').at(1).text())
      .to.equal('Parsing CSV...')

    // After 1 second - loading indicator is shown
    await clock.tick(1000)
    expect(
      wrapper.findComponent({ name: 'logs' }).findComponent({ name: 'LoadingIndicator' }).exists()
    ).to.equal(true)

    // All the dialog controls are disabled
    expect(wrapper.findComponent({ name: 'delimiter-selector' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#quote-char input').element.disabled).to.equal(true)
    expect(wrapper.find('#escape-char input').element.disabled).to.equal(true)
    expect(wrapper.findComponent({ name: 'check-box' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#csv-cancel').element.disabled).to.equal(true)
    expect(wrapper.find('#csv-finish').element.disabled).to.equal(true)
    expect(wrapper.findComponent({ name: 'close-icon' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#csv-finish').isVisible()).to.equal(false)
    expect(wrapper.find('#csv-import').isVisible()).to.equal(true)
    await resolveParsing()
    await parse.returnValues[1]

    // Loading indicator is not shown when parsing is compete
    expect(
      wrapper.findComponent({ name: 'logs' }).findComponent({ name: 'LoadingIndicator' }).exists()
    ).to.equal(false)
  })

  it('parsing is completed successfully', async () => {
    const parse = sinon.stub(csv, 'parse')
    parse.onCall(0).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: [
          [1, 'foo']
        ]
      },
      hasErrors: false,
      messages: []
    })

    parse.onCall(1).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: [
          [1, 'foo'],
          [2, 'bar']
        ]
      },
      hasErrors: false,
      messages: []
    })

    await wrapper.find('.drop-area').trigger('click')
    await csv.parse.returnValues[0]
    await wrapper.vm.animationPromise
    await wrapper.vm.$nextTick()

    await wrapper.find('#csv-import').trigger('click')
    await csv.parse.returnValues[1]
    await wrapper.vm.$nextTick()

    // Parsing success in the logs
    expect(wrapper.findComponent({ name: 'logs' }).findAll('.msg').at(1).text())
      .to.include('2 rows are parsed successfully in')

    // All the dialog controls are disabled
    expect(wrapper.findComponent({ name: 'delimiter-selector' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#quote-char input').element.disabled).to.equal(true)
    expect(wrapper.find('#escape-char input').element.disabled).to.equal(true)
    expect(wrapper.findComponent({ name: 'check-box' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#csv-cancel').element.disabled).to.equal(true)
    expect(wrapper.find('#csv-finish').element.disabled).to.equal(true)
    expect(wrapper.findComponent({ name: 'close-icon' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#csv-finish').isVisible()).to.equal(false)
    expect(wrapper.find('#csv-import').isVisible()).to.equal(true)
  })

  it('parsing is completed with notes', async () => {
    const parse = sinon.stub(csv, 'parse')
    parse.onCall(0).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: [
          [1, 'foo']
        ]
      },
      hasErrors: false,
      messages: []
    })

    parse.onCall(1).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: [
          [1, 'foo'],
          [2, 'bar']
        ]
      },
      hasErrors: false,
      messages: [{
        code: 'UndetectableDelimiter',
        message: 'Comma was used as a standart delimiter',
        type: 'info',
        hint: undefined
      }]
    })

    await wrapper.find('.drop-area').trigger('click')
    await csv.parse.returnValues[0]
    await wrapper.vm.animationPromise
    await wrapper.vm.$nextTick()

    await wrapper.find('#csv-import').trigger('click')
    await csv.parse.returnValues[1]
    await wrapper.vm.$nextTick()

    // Parsing success in the logs
    const logs = wrapper.findComponent({ name: 'logs' }).findAll('.msg')
    expect(logs).to.have.lengthOf(4)
    expect(logs.at(1).text()).to.include('2 rows are parsed in')
    expect(logs.at(2).text()).to.equals('Comma was used as a standart delimiter.')

    // All the dialog controls are disabled
    expect(wrapper.findComponent({ name: 'delimiter-selector' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#quote-char input').element.disabled).to.equal(true)
    expect(wrapper.find('#escape-char input').element.disabled).to.equal(true)
    expect(wrapper.findComponent({ name: 'check-box' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#csv-cancel').element.disabled).to.equal(true)
    expect(wrapper.find('#csv-finish').element.disabled).to.equal(true)
    expect(wrapper.findComponent({ name: 'close-icon' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#csv-finish').isVisible()).to.equal(false)
    expect(wrapper.find('#csv-import').isVisible()).to.equal(true)
  })

  it('parsing is completed with errors', async () => {
    const parse = sinon.stub(csv, 'parse')
    parse.onCall(0).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: [
          [1, 'foo']
        ]
      },
      hasErrors: false,
      messages: []
    })

    parse.onCall(1).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: [
          [1, 'foo'],
          [2, 'bar']
        ]
      },
      hasErrors: true,
      messages: [{
        code: 'Error',
        message: 'Something is wrong',
        type: 'error',
        hint: undefined
      }]
    })

    await wrapper.find('.drop-area').trigger('click')
    await csv.parse.returnValues[0]
    await wrapper.vm.animationPromise
    await wrapper.vm.$nextTick()

    await wrapper.find('#csv-import').trigger('click')
    await csv.parse.returnValues[1]
    await wrapper.vm.$nextTick()

    // Parsing success in the logs
    const logs = wrapper.findComponent({ name: 'logs' }).findAll('.msg')
    expect(logs).to.have.lengthOf(3)
    expect(logs.at(1).text()).to.include('Parsing ended with errors.')
    expect(logs.at(2).text()).to.equals('Something is wrong.')

    // All the dialog controls are enabled
    expect(wrapper.findComponent({ name: 'delimiter-selector' }).vm.disabled).to.equal(false)
    expect(wrapper.find('#quote-char input').element.disabled).to.equal(false)
    expect(wrapper.find('#escape-char input').element.disabled).to.equal(false)
    expect(wrapper.findComponent({ name: 'check-box' }).vm.disabled).to.equal(false)
    expect(wrapper.find('#csv-cancel').element.disabled).to.equal(false)
    expect(wrapper.find('#csv-finish').element.disabled).to.equal(false)
    expect(wrapper.findComponent({ name: 'close-icon' }).vm.disabled).to.equal(false)
    expect(wrapper.find('#csv-finish').isVisible()).to.equal(false)
    expect(wrapper.find('#csv-import').isVisible()).to.equal(true)
  })

  it('has proper state before import is completed', async () => {
    const parse = sinon.stub(csv, 'parse')
    parse.onCall(0).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: [
          [1, 'foo']
        ]
      },
      hasErrors: false,
      messages: []
    })

    parse.onCall(1).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: [
          [1, 'foo'],
          [2, 'bar']
        ]
      },
      hasErrors: false,
      messages: []
    })

    let resolveImport = sinon.stub()
    const newDb = {
      createDb: sinon.stub().resolves(new Promise(resolve => { resolveImport = resolve })),
      createProgressCounter: sinon.stub().returns(1),
      deleteProgressCounter: sinon.stub()
    }
    sinon.stub(database, 'getNewDatabase').returns(newDb)

    await wrapper.find('.drop-area').trigger('click')
    await csv.parse.returnValues[0]
    await wrapper.vm.animationPromise
    await wrapper.vm.$nextTick()

    await wrapper.find('#csv-import').trigger('click')
    await csv.parse.returnValues[1]
    await wrapper.vm.$nextTick()

    // Parsing success in the logs
    expect(wrapper.findComponent({ name: 'logs' }).findAll('.msg').at(2).text())
      .to.equal('Importing CSV into a SQLite database...')

    // After 1 second - loading indicator is shown
    await clock.tick(1000)
    expect(
      wrapper.findComponent({ name: 'logs' }).findComponent({ name: 'LoadingIndicator' }).exists()
    ).to.equal(true)

    // All the dialog controls are disabled
    expect(wrapper.findComponent({ name: 'delimiter-selector' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#quote-char input').element.disabled).to.equal(true)
    expect(wrapper.find('#escape-char input').element.disabled).to.equal(true)
    expect(wrapper.findComponent({ name: 'check-box' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#csv-cancel').element.disabled).to.equal(true)
    expect(wrapper.find('#csv-finish').element.disabled).to.equal(true)
    expect(wrapper.findComponent({ name: 'close-icon' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#csv-finish').isVisible()).to.equal(false)
    expect(wrapper.find('#csv-import').isVisible()).to.equal(true)
    expect(newDb.createDb.getCall(0).args[0]).to.equal('foo') // file name

    // After resolving - loading indicator is not shown
    await resolveImport()
    await newDb.createDb.returnValues[0]
    expect(
      wrapper.findComponent({ name: 'logs' }).findComponent({ name: 'LoadingIndicator' }).exists()
    ).to.equal(false)
  })

  it('import success', async () => {
    const parse = sinon.stub(csv, 'parse')
    parse.onCall(0).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: [
          [1, 'foo']
        ]
      },
      hasErrors: false,
      messages: []
    })

    parse.onCall(1).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: [
          [1, 'foo'],
          [2, 'bar']
        ]
      },
      hasErrors: false,
      messages: []
    })

    const schema = {}
    const newDb = {
      createDb: sinon.stub().resolves(schema),
      createProgressCounter: sinon.stub().returns(1),
      deleteProgressCounter: sinon.stub()
    }
    sinon.stub(database, 'getNewDatabase').returns(newDb)

    await wrapper.find('.drop-area').trigger('click')
    await csv.parse.returnValues[0]
    await wrapper.vm.animationPromise
    await wrapper.vm.$nextTick()

    await wrapper.find('#csv-import').trigger('click')
    await csv.parse.returnValues[1]
    await wrapper.vm.$nextTick()

    // Import success in the logs
    const logs = wrapper.findComponent({ name: 'logs' }).findAll('.msg')
    expect(logs).to.have.lengthOf(3)
    expect(logs.at(2).text()).to.contain('Importing CSV into a SQLite database is completed in')

    // All the dialog controls are enabled
    expect(wrapper.findComponent({ name: 'delimiter-selector' }).vm.disabled).to.equal(false)
    expect(wrapper.find('#quote-char input').element.disabled).to.equal(false)
    expect(wrapper.find('#escape-char input').element.disabled).to.equal(false)
    expect(wrapper.findComponent({ name: 'check-box' }).vm.disabled).to.equal(false)
    expect(wrapper.find('#csv-cancel').element.disabled).to.equal(false)
    expect(wrapper.find('#csv-finish').element.disabled).to.equal(false)
    expect(wrapper.findComponent({ name: 'close-icon' }).vm.disabled).to.equal(false)
    expect(wrapper.find('#csv-finish').isVisible()).to.equal(true)
  })

  it('import fails', async () => {
    const parse = sinon.stub(csv, 'parse')
    parse.onCall(0).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: [
          [1, 'foo']
        ]
      },
      hasErrors: false,
      messages: []
    })

    parse.onCall(1).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: [
          [1, 'foo'],
          [2, 'bar']
        ]
      },
      hasErrors: false,
      messages: []
    })

    const newDb = {
      createDb: sinon.stub().rejects(new Error('fail')),
      createProgressCounter: sinon.stub().returns(1),
      deleteProgressCounter: sinon.stub()
    }
    sinon.stub(database, 'getNewDatabase').returns(newDb)

    await wrapper.find('.drop-area').trigger('click')
    await csv.parse.returnValues[0]
    await wrapper.vm.animationPromise
    await wrapper.vm.$nextTick()

    await wrapper.find('#csv-import').trigger('click')
    await csv.parse.returnValues[1]
    await wrapper.vm.$nextTick()

    // Import success in the logs
    const logs = wrapper.findComponent({ name: 'logs' }).findAll('.msg')
    expect(logs).to.have.lengthOf(4)
    expect(logs.at(2).text()).to.contain('Importing CSV into a SQLite database...')
    expect(logs.at(3).text()).to.equal('Error: fail.')

    // All the dialog controls are enabled
    expect(wrapper.findComponent({ name: 'delimiter-selector' }).vm.disabled).to.equal(false)
    expect(wrapper.find('#quote-char input').element.disabled).to.equal(false)
    expect(wrapper.find('#escape-char input').element.disabled).to.equal(false)
    expect(wrapper.findComponent({ name: 'check-box' }).vm.disabled).to.equal(false)
    expect(wrapper.find('#csv-cancel').element.disabled).to.equal(false)
    expect(wrapper.find('#csv-finish').element.disabled).to.equal(false)
    expect(wrapper.findComponent({ name: 'close-icon' }).vm.disabled).to.equal(false)
    expect(wrapper.find('#csv-finish').isVisible()).to.equal(false)
  })

  it('import final', async () => {
    const parse = sinon.stub(csv, 'parse')
    parse.onCall(0).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: [
          [1, 'foo']
        ]
      },
      hasErrors: false,
      messages: []
    })

    parse.onCall(1).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: [
          [1, 'foo'],
          [2, 'bar']
        ]
      },
      hasErrors: false,
      messages: []
    })

    const schema = {}
    const newDb = {
      createDb: sinon.stub().resolves(schema),
      createProgressCounter: sinon.stub().returns(1),
      deleteProgressCounter: sinon.stub()
    }
    sinon.stub(database, 'getNewDatabase').returns(newDb)

    await wrapper.find('.drop-area').trigger('click')
    await csv.parse.returnValues[0]
    await wrapper.vm.animationPromise
    await wrapper.vm.$nextTick()

    await wrapper.find('#csv-import').trigger('click')
    await csv.parse.returnValues[1]
    await wrapper.vm.$nextTick()

    await wrapper.find('#csv-finish').trigger('click')

    expect(mutations.setDb.calledOnceWith(state, newDb)).to.equal(true)
    expect(mutations.saveSchema.calledOnceWith(state, schema)).to.equal(true)
    expect(actions.addTab.calledOnce).to.equal(true)
    await actions.addTab.returnValues[0]
    expect(mutations.setCurrentTabId.calledOnceWith(state, newTabId)).to.equal(true)
    expect($router.push.calledOnceWith('/editor')).to.equal(true)
    expect(wrapper.find('[data-modal="parse"]').exists()).to.equal(false)
  })

  it('import cancel', async () => {
    const parse = sinon.stub(csv, 'parse')
    parse.onCall(0).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: [
          [1, 'foo']
        ]
      },
      hasErrors: false,
      messages: []
    })

    parse.onCall(1).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: [
          [1, 'foo'],
          [2, 'bar']
        ]
      },
      hasErrors: false,
      messages: []
    })

    const schema = {}
    const newDb = {
      createDb: sinon.stub().resolves(schema),
      createProgressCounter: sinon.stub().returns(1),
      deleteProgressCounter: sinon.stub(),
      shutDown: sinon.stub()
    }
    sinon.stub(database, 'getNewDatabase').returns(newDb)

    await wrapper.find('.drop-area').trigger('click')
    await csv.parse.returnValues[0]
    await wrapper.vm.animationPromise
    await wrapper.vm.$nextTick()

    await wrapper.find('#csv-import').trigger('click')
    await csv.parse.returnValues[1]
    await wrapper.vm.$nextTick()

    await wrapper.find('#csv-cancel').trigger('click')

    expect(mutations.setDb.called).to.equal(false)
    expect(mutations.saveSchema.called).to.equal(false)
    expect(actions.addTab.called).to.equal(false)
    expect(mutations.setCurrentTabId.called).to.equal(false)
    expect($router.push.called).to.equal(false)
    expect(newDb.shutDown.calledOnce).to.equal(true)
    expect(wrapper.find('[data-modal="parse"]').exists()).to.equal(false)
  })

  it("doesn't open new tab when load db after importing CSV", async () => {
    fu.getFileFromUser.onCall(0).resolves({ type: 'text/csv', name: 'foo.csv' })
    fu.getFileFromUser.onCall(1).resolves({ type: 'application/x-sqlite3', name: 'bar.sqlite3' })
    sinon.stub(csv, 'parse').resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: [
          [1, 'foo']
        ]
      },
      hasErrors: false,
      messages: []
    })

    const schema = {}
    const newDb = {
      createDb: sinon.stub().resolves(schema),
      createProgressCounter: sinon.stub().returns(1),
      deleteProgressCounter: sinon.stub(),
      loadDb: sinon.stub().resolves()
    }
    sinon.stub(database, 'getNewDatabase').returns(newDb)

    await wrapper.find('.drop-area').trigger('click')
    await csv.parse.returnValues[0]
    await wrapper.vm.animationPromise
    await wrapper.vm.$nextTick()

    await wrapper.find('#csv-import').trigger('click')
    await csv.parse.returnValues[1]
    await wrapper.vm.$nextTick()

    await wrapper.find('#csv-finish').trigger('click')

    expect(actions.addTab.calledOnce).to.equal(true)
    await actions.addTab.returnValues[0]
    expect(mutations.setCurrentTabId.calledOnceWith(state, newTabId)).to.equal(true)

    await wrapper.find('.drop-area').trigger('click')
    await newDb.loadDb.returnValues[0]
    expect(actions.addTab.calledOnce).to.equal(true)
    expect(mutations.setCurrentTabId.calledOnce).to.equal(true)
  })
})
