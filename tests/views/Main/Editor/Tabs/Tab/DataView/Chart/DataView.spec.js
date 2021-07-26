import { expect } from 'chai'
import { mount, createWrapper } from '@vue/test-utils'
import DataView from '@/views/Main/Editor/Tabs/Tab/DataView'

describe('DataView.vue', () => {
  it('emits update on mode changing', async () => {
    const wrapper = mount(DataView)

    const pivotBtn = createWrapper(wrapper.findComponent({ name: 'pivotIcon' }).vm.$parent)
    await pivotBtn.trigger('click')

    expect(wrapper.emitted('update')).to.have.lengthOf(1)
  })
})
