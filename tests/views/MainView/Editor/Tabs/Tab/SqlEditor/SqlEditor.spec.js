import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import SqlEditor from '@/views/Main/Editor/Tabs/Tab/SqlEditor'

describe('SqlEditor.vue', () => {
  it('Emits input event when a query is changed', async () => {
    const wrapper = mount(SqlEditor)
    await wrapper.findComponent({ name: 'codemirror' }).vm.$emit('input', 'SELECT * FROM foo')
    expect(wrapper.emitted('input')[0]).to.eql(['SELECT * FROM foo'])
  })
})
