import { expect } from 'chai'
import sinon from 'sinon'
import { shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import App from '@/App'
import storedInquiries from '@/lib/storedInquiries'
import mutations from '@/store/mutations'

describe('App.vue', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('Gets inquiries', () => {
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([
      {id: 1}, {id: 2}, {id: 3}
    ])
    const state = {
      predefinedInquiries: [],
      inquiries: []
    }
    const store = new Vuex.Store({ state, mutations })
    shallowMount(App, { store, stubs: ['router-view'] })

    expect(state.inquiries).to.eql([{id: 1}, {id: 2}, {id: 3}])
  })

  it('Updates inquiries when they change in store', async () => {
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([
      {id: 1, name: 'foo'}, {id: 2, name: 'baz'}, {id: 3, name: 'bar'}
    ])
    sinon.spy(storedInquiries, 'updateStorage')

    
    const state = {
      predefinedInquiries: [],
      inquiries: []
    }
    const store = new Vuex.Store({ state, mutations })
    const wrapper = shallowMount(App, { store, stubs: ['router-view'] })

    store.state.inquiries.splice(0, 1, {id: 1, name: 'new foo name'})
    await wrapper.vm.$nextTick()

    expect(storedInquiries.updateStorage.calledTwice).to.equal(true)

    expect(storedInquiries.updateStorage.args[1][0]).to.eql([
      {id: 1, name: 'new foo name'}, {id: 2, name: 'baz'}, {id: 3, name: 'bar'}
    ])
  })
})
