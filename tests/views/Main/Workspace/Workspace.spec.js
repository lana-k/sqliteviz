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
    mount(Workspace, {
      store,
      stubs: ['router-link']
    })

    expect(state.tabs[0].query).to.include('Your database is empty.')
    expect(state.tabs[0].tempName).to.equal('Untitled')
    expect(state.tabs[0].name).to.equal(null)
    expect(state.tabs[0].viewType).to.equal('chart')
    expect(state.tabs[0].viewOptions).to.equal(undefined)
    expect(state.tabs[0].isSaved).to.equal(false)
  })
})
