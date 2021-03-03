import { expect } from 'chai'
import sinon from 'sinon'
import Vuex from 'vuex'
import { shallowMount } from '@vue/test-utils'
import DbUpload from '@/components/DbUpload.vue'
import fu from '@/fileUtils'

describe('DbUploader.vue', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('loads db on click and redirects to /editor', async () => {
    // mock store state and mutations
    const state = {}
    const mutations = {
      saveSchema: sinon.stub()
    }
    const store = new Vuex.Store({ state, mutations })

    // mock getting a file from user
    const file = {}
    sinon.stub(fu, 'getFileFromUser').resolves(file)

    // mock db loading
    const schema = {}
    const $db = { loadDb: sinon.stub().resolves(schema) }

    // mock router
    const $router = { push: sinon.stub() }
    const $route = { path: '/' }

    // mount the component
    const wrapper = shallowMount(DbUpload, {
      store,
      mocks: { $db, $router, $route }
    })

    await wrapper.find('.drop-area').trigger('click')
    expect($db.loadDb.calledOnceWith(file)).to.equal(true)
    await $db.loadDb.returnValues[0]
    expect(mutations.saveSchema.calledOnceWith(state, schema)).to.equal(true)
    expect($router.push.calledOnceWith('/editor')).to.equal(true)
  })

  it('loads db on drop and redirects to /editor', async () => {
    // mock store state and mutations
    const state = {}
    const mutations = {
      saveSchema: sinon.stub()
    }
    const store = new Vuex.Store({ state, mutations })

    // mock db loading
    const schema = {}
    const $db = { loadDb: sinon.stub().resolves(schema) }

    // mock router
    const $router = { push: sinon.stub() }
    const $route = { path: '/' }

    // mount the component
    const wrapper = shallowMount(DbUpload, {
      store,
      mocks: { $db, $router, $route }
    })

    // mock a file dropped by a user
    const file = {}
    const dropData = { dataTransfer: new DataTransfer() }
    Object.defineProperty(dropData.dataTransfer, 'files', {
      value: [file],
      writable: false
    })

    await wrapper.find('.drop-area').trigger('drop', dropData)
    expect($db.loadDb.calledOnceWith(file)).to.equal(true)
    await $db.loadDb.returnValues[0]
    expect(mutations.saveSchema.calledOnceWith(state, schema)).to.equal(true)
    expect($router.push.calledOnceWith('/editor')).to.equal(true)
  })

  it("doesn't redirect if already on /editor", async () => {
    // mock store state and mutations
    const state = {}
    const mutations = {
      saveSchema: sinon.stub()
    }
    const store = new Vuex.Store({ state, mutations })

    // mock db loading
    const schema = {}
    const $db = { loadDb: sinon.stub().resolves(schema) }

    // mock router
    const $router = { push: sinon.stub() }
    const $route = { path: '/' }

    // mount the component
    const wrapper = shallowMount(DbUpload, {
      store,
      mocks: { $db, $router, $route }
    })

    await wrapper.find('.drop-area').trigger('click')
    expect($router.push.called).to.equal(false)
  })
})
