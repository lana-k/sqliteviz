import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import SqlEditor from '@/views/Main/Workspace/Tabs/Tab/SqlEditor'
import { nextTick } from 'vue'

describe('SqlEditor.vue', () => {
  it('Emits update:modelValue event when a query is changed', async () => {
    // mock store state
    const state = {
      db: {}
    }

    const store = createStore({ state })

    const wrapper = mount(SqlEditor, {
      global: {
        plugins: [store]
      }
    })
    await wrapper
      .findComponent({ ref: 'cm' })
      .setValue('SELECT * FROM foo', 'value')
    expect(wrapper.emitted()['update:modelValue'][0]).to.eql([
      'SELECT * FROM foo'
    ])
  })

  it('Run is disabled if there is no db or no query or is getting result set', async () => {
    const state = {
      db: null
    }
    const store = createStore({ state })

    const wrapper = mount(SqlEditor, {
      global: { plugins: [store] },
      props: { isGettingResults: false }
    })
    await wrapper
      .findComponent({ ref: 'cm' })
      .setValue('SELECT * FROM foo', 'value')
    const runButton = wrapper.findComponent({ ref: 'runBtn' })

    expect(runButton.props('disabled')).to.equal(true)

    store.state.db = {}
    await nextTick()
    expect(runButton.props('disabled')).to.equal(false)

    await wrapper.findComponent({ ref: 'cm' }).setValue('', 'value')
    expect(runButton.props('disabled')).to.equal(true)

    await wrapper
      .findComponent({ ref: 'cm' })
      .setValue('SELECT * FROM foo', 'value')
    expect(runButton.props('disabled')).to.equal(false)

    await wrapper.setProps({ isGettingResults: true })
    expect(runButton.props('disabled')).to.equal(true)
  })
})
