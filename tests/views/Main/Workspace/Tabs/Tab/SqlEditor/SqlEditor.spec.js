import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import Vuex from 'vuex'
import SqlEditor from '@/views/Main/Workspace/Tabs/Tab/SqlEditor'

describe('SqlEditor.vue', () => {
  it('Emits input event when a query is changed', async () => {
    // mock store state
    const state = {
      db: {}
    }

    const store = new Vuex.Store({ state })

    const wrapper = mount(SqlEditor, { store })
    await wrapper.findComponent({ name: 'codemirror' }).vm.$emit('input', 'SELECT * FROM foo')
    expect(wrapper.emitted('input')[0]).to.eql(['SELECT * FROM foo'])
  })

  it('Run is disabled if there is no db or no query or is getting result set', async () => {
    const state = {
      db: null
    }
    const store = new Vuex.Store({ state })

    const wrapper = mount(SqlEditor, { store, propsData: { isGettingResults: false } })
    await wrapper.findComponent({ name: 'codemirror' }).vm.$emit('input', 'SELECT * FROM foo')
    const runButton = wrapper.findComponent({ name: 'RunIcon' }).vm.$parent

    expect(runButton.disabled).to.equal(true)

    await wrapper.vm.$set(store.state, 'db', {})
    expect(runButton.disabled).to.equal(false)

    await wrapper.findComponent({ name: 'codemirror' }).vm.$emit('input', '')
    expect(runButton.disabled).to.equal(true)

    await wrapper.findComponent({ name: 'codemirror' }).vm.$emit('input', 'SELECT * FROM foo')
    expect(runButton.disabled).to.equal(false)

    await wrapper.setProps({ isGettingResults: true })
    expect(runButton.disabled).to.equal(true)
  })
})
