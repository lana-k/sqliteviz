import { expect } from 'chai'
import sinon from 'sinon'
import { mount } from '@vue/test-utils'
import Pager from '@/components/SqlTable/Pager'

describe('Pager.vue', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('emits update:modelValue event with a page', async () => {
    const wrapper = mount(Pager, {
      props: {
        pageCount: 5,
        'onUpdate:modelValue': (e) => wrapper.setProps({ modelValue: e })
      }
    })

    // click on 'next page' link
    await wrapper.find('.paginator-next').trigger('click')
    expect(wrapper.props('modelValue')).to.eql(2)

    // click on the link to page 3 (it has index 2)
    await wrapper.findAll('.paginator-page-link')[2].trigger('click')
    expect(wrapper.props('modelValue')).to.eql(3)
  })
})
