import { expect } from 'chai'
import sinon from 'sinon'
import Vuex from 'vuex'
import { shallowMount, mount } from '@vue/test-utils'
import DbUploader from '@/components/DbUploader.vue'
import fu from '@/file.utils'
import database from '@/database.js'
import csv from '@/csv'

let state = {}
let mutations = {}
let store = {}

describe('DbUploader.vue', () => {
  beforeEach(() => {
    // mock store state and mutations
    state = {}
    mutations = {
      saveSchema: sinon.stub()
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

  it('shows parse dialog if gets csv file', async () => {
    // mock getting a file from user
    const file = { type: 'text/csv' }
    sinon.stub(fu, 'getFileFromUser').resolves(file)

    // mock router
    const $router = { push: sinon.stub() }
    const $route = { path: '/editor' }

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

    // mount the component
    const wrapper = mount(DbUploader, {
      store,
      mocks: { $router, $route }
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
  })

  it('reparses when parameters changes', async () => {
    // mock getting a file from user
    const file = { type: 'text/csv' }
    sinon.stub(fu, 'getFileFromUser').resolves(file)

    // mock router
    const $router = { push: sinon.stub() }
    const $route = { path: '/editor' }

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

    // mount the component
    const wrapper = mount(DbUploader, {
      store,
      mocks: { $router, $route }
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
})
