import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import actions from '@/store/actions'
import Vuex from 'vuex'
import Editor from '@/views/Main/Editor'

describe('Editor.vue', () => {
  it('Creates a tab with example if schema is empty', () => {
    const state = {
      db: {},
      tabs: []
    }
    const store = new Vuex.Store({ state, actions })
    mount(Editor, { store })

    expect(state.tabs[0].query).to.include('Your database is empty.')
    expect(state.tabs[0].tempName).to.equal('Untitled')
    expect(state.tabs[0].name).to.equal(null)
    expect(state.tabs[0].viewType).to.equal('chart')
    expect(state.tabs[0].viewOptions).to.equal(undefined)
    expect(state.tabs[0].isSaved).to.equal(false)
  })
})
