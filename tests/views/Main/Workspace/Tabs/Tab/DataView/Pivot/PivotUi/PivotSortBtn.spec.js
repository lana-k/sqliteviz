import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import PivotSortBtn from '@/views/Main/Workspace/Tabs/Tab/DataView/Pivot/PivotUi/PivotSortBtn'

describe('PivotSortBtn.vue', () => {
  it('switches order', async () => {
    const wrapper = shallowMount(PivotSortBtn, { propsData: { value: 'key_a_to_z' } })

    expect(wrapper.vm.value).to.equal('key_a_to_z')
    await wrapper.find('.pivot-sort-btn').trigger('click')
    expect(wrapper.emitted('input')[0]).to.eql(['value_a_to_z'])

    await wrapper.setProps({ value: 'value_a_to_z' })
    await wrapper.find('.pivot-sort-btn').trigger('click')
    expect(wrapper.emitted('input')[1]).to.eql(['value_z_to_a'])

    await wrapper.setProps({ value: 'value_z_to_a' })
    await wrapper.find('.pivot-sort-btn').trigger('click')
    expect(wrapper.emitted('input')[2]).to.eql(['key_a_to_z'])
  })
})
