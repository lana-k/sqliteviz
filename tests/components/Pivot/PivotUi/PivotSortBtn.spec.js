import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import PivotSortBtn from '@/components/Pivot/PivotUi/PivotSortBtn'

describe('PivotSortBtn.vue', () => {
  it('switches order', async () => {
    const wrapper = shallowMount(PivotSortBtn, {
      props: {
        modelValue: 'key_a_to_z',
        'onUpdate:modelValue': e => wrapper.setProps({ modelValue: e })
      }
    })

    expect(wrapper.props('modelValue')).to.equal('key_a_to_z')
    await wrapper.find('.pivot-sort-btn').trigger('click')
    expect(wrapper.props('modelValue')).to.equal('value_a_to_z')

    await wrapper.setValue('value_a_to_z')
    await wrapper.find('.pivot-sort-btn').trigger('click')
    expect(wrapper.props('modelValue')).to.equal('value_z_to_a')

    await wrapper.setValue('value_z_to_a')
    await wrapper.find('.pivot-sort-btn').trigger('click')
    expect(wrapper.props('modelValue')).to.equal('key_a_to_z')
  })
})
