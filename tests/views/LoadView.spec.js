import { expect } from 'chai'
import sinon from 'sinon'
import { mount } from '@vue/test-utils'
import Vuex from 'vuex'
import LoadView from '@/views/LoadView'
import fu from '@/lib/utils/fileIo'
import database from '@/lib/database'
import realMutations from '@/store/mutations'
import realActions from '@/store/actions'
import flushPromises from 'flush-promises'
import Tab from '@/lib/tab'

describe('LoadView.vue', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('Loads db and inquiries and redirects to workspace if no errors', async () => {
    const state = {
      tabs: []
    }
    const mutations = {
      setCurrentTabId: sinon.stub().callsFake(realMutations.setCurrentTabId),
      setDb: sinon.stub().callsFake(realMutations.setDb)
    }
    const actions = {
      addTab: sinon.stub().callsFake(realActions.addTab)
    }
    const store = new Vuex.Store({ state, mutations, actions })
    const $route = {
      path: '/workspace',
      query: {
        data_url: 'https://my-url/test.db',
        data_format: 'sqlite',
        inquiry_url: 'https://my-url/test_inquiries.json',
        inquiry_id: [1],
        maximize: 'dataView'
      }
    }

    const $router = { push: sinon.stub() }

    const readFile = sinon.stub(fu, 'readFile')
    const dataRes = new Response()
    dataRes.blob = sinon.stub().resolves({})
    readFile.onCall(0).returns(Promise.resolve(dataRes))

    const inquiriesRes = new Response()
    inquiriesRes.json = sinon.stub().resolves({
      version: 2,
      inquiries: [{ id: 1, name: 'foo' }, { id: 2, name: 'bar' }]
    })
    readFile.onCall(1).returns(Promise.resolve(inquiriesRes))
    const db = {
      loadDb: sinon.stub().resolves()
    }
    sinon.stub(database, 'getNewDatabase').returns(db)
    Tab.prototype.execute = sinon.stub()

    const wrapper = mount(LoadView, {
      store,
      mocks: { $route, $router },
      stubs: ['router-link']
    })

    await flushPromises()

    // DB file is read
    expect(fu.readFile.firstCall.args[0]).to.equal('https://my-url/test.db')

    // Db is loaded
    expect(db.loadDb.firstCall.args[0]).to.equal(await dataRes.blob.returnValues[0])

    // Inquiries file is read
    expect(fu.readFile.secondCall.args[0])
      .to.equal('https://my-url/test_inquiries.json')

    // Tab for inquiry is created
    expect(actions.addTab.calledOnce).to.equal(true)
    expect(actions.addTab.firstCall.args[1]).eql({
      id: undefined,
      name: 'foo',
      layout: {
        dataView: 'bottom',
        sqlEditor: 'hidden',
        table: 'above'
      },
      maximize: 'dataView'
    })
    const executedTab = Tab.prototype.execute.firstCall.thisValue
    expect(executedTab.tempName).to.equal('foo')
    expect(wrapper.find('#open-workspace-btn').exists()).to.equal(false)
    expect($router.push.called).to.equal(true)
  })

  it('Doesn\'t redirect and show the button if there is an error', async () => {
    const state = {
      tabs: []
    }
    const mutations = {
      setCurrentTabId: sinon.stub().callsFake(realMutations.setCurrentTabId),
      setDb: sinon.stub().callsFake(realMutations.setDb)
    }
    const actions = {
      addTab: sinon.stub().callsFake(realActions.addTab)
    }
    const store = new Vuex.Store({ state, mutations, actions })
    const $route = {
      path: '/workspace',
      query: {
        data_url: 'https://my-url/test.db',
        data_format: 'sqlite',
        inquiry_url: 'https://my-url/test_inquiries.json',
        inquiry_id: [1],
        maximize: 'dataView'
      }
    }

    const $router = { push: sinon.stub() }

    const readFile = sinon.stub(fu, 'readFile')
    const dataRes = new Response()
    dataRes.blob = sinon.stub().rejects(new Error('Something is wrong'))
    readFile.onCall(0).returns(Promise.resolve(dataRes))

    const inquiriesRes = new Response()
    inquiriesRes.json = sinon.stub().resolves({
      version: 2,
      inquiries: [{ id: 1 }]
    })
    readFile.onCall(1).returns(Promise.resolve(inquiriesRes))
    sinon.stub(database, 'getNewDatabase').returns({
      loadDb: sinon.stub().resolves()
    })

    const wrapper = mount(LoadView, {
      store,
      mocks: { $route, $router },
      stubs: ['router-link']
    })

    await flushPromises()
    expect(wrapper.find('#open-workspace-btn').exists()).to.equal(true)
    expect($router.push.called).to.equal(false)
    expect(wrapper.find('#logs').text()).to.include('Something is wrong')
  })
})
