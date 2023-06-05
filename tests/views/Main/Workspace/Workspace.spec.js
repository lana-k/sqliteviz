import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import actions from '@/store/actions'
import mutations from '@/store/mutations'
import Vuex from 'vuex'
import Workspace from '@/views/Main/Workspace'

describe('Workspace.vue', () => {
  it('Creates a tab with example if schema is empty', () => {
    const state = {
      db: {},
      tabs: []
    }
    const store = new Vuex.Store({ state, actions, mutations })
    const $route = { path: '/workspace', query: {} }
    mount(Workspace, {
      store,
      stubs: ['router-link'],
      mocks: { $route }
    })

    expect(state.tabs[0].query).to.include('Your database is empty.')
    expect(state.tabs[0].tempName).to.equal('Untitled')
    expect(state.tabs[0].name).to.equal(null)
    expect(state.tabs[0].viewType).to.equal('chart')
    expect(state.tabs[0].viewOptions).to.equal(undefined)
    expect(state.tabs[0].isSaved).to.equal(false)
  })

  it('Collapse schema if hide_schema is 1', () => {
    const state = {
      db: {},
      tabs: []
    }
    const store = new Vuex.Store({ state, actions, mutations })
    const $route = { path: '/workspace', query: { hide_schema: '1' } }
    const vm = mount(Workspace, {
      store,
      stubs: ['router-link'],
      mocks: { $route }
    })

    expect(vm.find('#schema-container').element.offsetWidth).to.equal(0)
  })
})
