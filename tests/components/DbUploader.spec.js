import { expect } from 'chai'
import sinon from 'sinon'
import Vuex from 'vuex'
import { shallowMount, mount } from '@vue/test-utils'
import DbUploader from '@/components/DbUploader'
import fu from '@/lib/utils/fileIo'
import database from '@/lib/database'

describe('DbUploader.vue', () => {
  let state = {}
  let mutations = {}
  let store = {}
  let place

  beforeEach(() => {
    // mock store state and mutations
    state = {}
    mutations = {
      setDb: sinon.stub()
    }
    store = new Vuex.Store({ state, mutations })

    place = document.createElement('div')
    document.body.appendChild(place)
  })

  afterEach(() => {
    sinon.restore()
    place.remove()
  })

  it('loads db on click and redirects to /workspace', async () => {
    // mock getting a file from user
    const file = { name: 'test.db' }
    sinon.stub(fu, 'getFileFromUser').resolves(file)

    // mock db loading
    const db = {
      loadDb: sinon.stub().resolves()
    }
    sinon.stub(database, 'getNewDatabase').returns(db)

    // mock router
    const $router = { push: sinon.stub() }
    const $route = { path: '/' }

    // mount the component
    const wrapper = shallowMount(DbUploader, {
      attachTo: place,
      store,
      mocks: { $router, $route },
      propsData: {
        type: 'illustrated'
      }
    })

    await wrapper.find('.drop-area').trigger('click')
    expect(db.loadDb.calledOnceWith(file)).to.equal(true)
    await db.loadDb.returnValues[0]
    await wrapper.vm.animationPromise
    await wrapper.vm.$nextTick()
    expect($router.push.calledOnceWith('/workspace')).to.equal(true)
    wrapper.destroy()
  })

  it('loads db on drop and redirects to /workspace', async () => {
    // mock db loading
    const db = {
      loadDb: sinon.stub().resolves()
    }
    sinon.stub(database, 'getNewDatabase').returns(db)

    // mock router
    const $router = { push: sinon.stub() }
    const $route = { path: '/' }

    // mount the component
    const wrapper = shallowMount(DbUploader, {
      attachTo: place,
      store,
      mocks: { $router, $route },
      propsData: {
        type: 'illustrated'
      }
    })

    // mock a file dropped by a user
    const file = { name: 'test.db' }
    const dropData = { dataTransfer: new DataTransfer() }
    Object.defineProperty(dropData.dataTransfer, 'files', {
      value: [file],
      writable: false
    })

    await wrapper.find('.drop-area').trigger('drop', dropData)
    expect(db.loadDb.calledOnceWith(file)).to.equal(true)
    await db.loadDb.returnValues[0]
    await wrapper.vm.animationPromise
    await wrapper.vm.$nextTick()
    expect($router.push.calledOnceWith('/workspace')).to.equal(true)
    wrapper.destroy()
  })

  it("doesn't redirect if already on /workspace", async () => {
    // mock getting a file from user
    const file = { name: 'test.db' }
    sinon.stub(fu, 'getFileFromUser').resolves(file)

    // mock db loading
    const db = {
      loadDb: sinon.stub().resolves()
    }
    sinon.stub(database, 'getNewDatabase').returns(db)

    // mock router
    const $router = { push: sinon.stub() }
    const $route = { path: '/workspace' }

    // mount the component
    const wrapper = shallowMount(DbUploader, {
      attachTo: place,
      store,
      mocks: { $router, $route },
      propsData: {
        type: 'illustrated'
      }
    })

    await wrapper.find('.drop-area').trigger('click')
    await db.loadDb.returnValues[0]
    await wrapper.vm.animationPromise
    await wrapper.vm.$nextTick()
    expect($router.push.called).to.equal(false)
    wrapper.destroy()
  })

  it('shows parse dialog if gets csv file', async () => {
    // mock getting a file from user
    const file = { name: 'test.csv' }
    sinon.stub(fu, 'getFileFromUser').resolves(file)

    // mock router
    const $router = { push: sinon.stub() }
    const $route = { path: '/workspace' }

    // mount the component
    const wrapper = mount(DbUploader, {
      attachTo: place,
      store,
      mocks: { $router, $route },
      propsData: {
        type: 'illustrated'
      }
    })

    const CsvImport = wrapper.vm.$refs.addCsv
    sinon.stub(CsvImport, 'reset')
    sinon.stub(CsvImport, 'previewCsv').resolves()
    sinon.stub(CsvImport, 'open')

    await wrapper.find('.drop-area').trigger('click')
    await wrapper.vm.$nextTick()
    expect(CsvImport.reset.calledOnce).to.equal(true)
    await wrapper.vm.animationPromise
    expect(CsvImport.previewCsv.calledOnce).to.equal(true)
    await wrapper.vm.$nextTick()
    expect(CsvImport.open.calledOnce).to.equal(true)
    wrapper.destroy()
  })

  it('deletes temporary db if CSV import is canceled', async () => {
    // mock getting a file from user
    const file = { name: 'test.csv' }
    sinon.stub(fu, 'getFileFromUser').resolves(file)

    // mock router
    const $router = { push: sinon.stub() }
    const $route = { path: '/workspace' }

    // mount the component
    const wrapper = mount(DbUploader, {
      store,
      mocks: { $router, $route },
      propsData: {
        type: 'illustrated'
      }
    })

    const CsvImport = wrapper.vm.$refs.addCsv
    sinon.stub(CsvImport, 'reset')
    sinon.stub(CsvImport, 'previewCsv').resolves()
    sinon.stub(CsvImport, 'open')

    await wrapper.find('.drop-area').trigger('click')
    await wrapper.vm.$nextTick()
    await CsvImport.$emit('cancel')
    expect(wrapper.vm.newDb).to.equal(null)
  })
})
