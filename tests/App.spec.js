import { expect } from 'chai'
import sinon from 'sinon'
import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'
import App from '@/App.vue'
import storedInquiries from '@/lib/storedInquiries'
import mutations from '@/store/mutations'
import { nextTick } from 'vue'

describe('App.vue', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('Gets inquiries', () => {
    sinon
      .stub(storedInquiries, 'getStoredInquiries')
      .returns([{ id: 1 }, { id: 2 }, { id: 3 }])
    const state = {
      predefinedInquiries: [],
      inquiries: []
    }
    const store = createStore({ state, mutations })
    shallowMount(App, {
      global: {
        stubs: ['router-view'],
        plugins: [store]
      }
    })

    expect(state.inquiries).to.eql([{ id: 1 }, { id: 2 }, { id: 3 }])
  })

  it('Updates inquiries when they change in store', async () => {
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([
      { id: 1, name: 'foo' },
      { id: 2, name: 'baz' },
      { id: 3, name: 'bar' }
    ])
    sinon.spy(storedInquiries, 'updateStorage')

    const state = {
      predefinedInquiries: [],
      inquiries: []
    }
    const store = createStore({ state, mutations })
    shallowMount(App, {
      global: { stubs: ['router-view'], plugins: [store] }
    })

    store.state.inquiries.splice(0, 1, { id: 1, name: 'new foo name' })
    await nextTick()

    expect(storedInquiries.updateStorage.calledTwice).to.equal(true)

    expect(storedInquiries.updateStorage.args[1][0]).to.eql([
      { id: 1, name: 'new foo name' },
      { id: 2, name: 'baz' },
      { id: 3, name: 'bar' }
    ])
  })

  it('Updates store when inquirires change in local storage', async () => {
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([
      { id: 1, name: 'foo' },
      { id: 2, name: 'baz' },
      { id: 3, name: 'bar' }
    ])

    const state = {
      predefinedInquiries: [],
      inquiries: []
    }
    const store = createStore({ state, mutations })
    shallowMount(App, {
      global: { stubs: ['router-view'], plugins: [store] }
    })

    expect(state.inquiries).to.eql([
      { id: 1, name: 'foo' },
      { id: 2, name: 'baz' },
      { id: 3, name: 'bar' }
    ])

    storedInquiries.getStoredInquiries.returns([
      { id: 1, name: 'foo' },
      { id: 3, name: 'bar' }
    ])
    window.dispatchEvent(new StorageEvent('storage', { key: 'myInquiries' }))
    expect(state.inquiries).to.eql([
      { id: 1, name: 'foo' },
      { id: 3, name: 'bar' }
    ])
  })
})
