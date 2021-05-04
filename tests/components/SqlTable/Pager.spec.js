import { expect } from 'chai'
import sinon from 'sinon'
import { mount } from '@vue/test-utils'
import Pager from '@/components/SqlTable/Pager'

describe('Pager.vue', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('emits input event with a page', async () => {
    const wrapper = mount(Pager, {
      propsData: {
        pageCount: 5
      }
    })

    // click on 'next page' link
    await wrapper.find('.paginator-next').trigger('click')
    expect(wrapper.emitted('input')[0]).to.eql([2])

    // click on the link to page 3 (it has index 2)
    await wrapper.findAll('.paginator-page-link').at(2).trigger('click')
    expect(wrapper.emitted('input')[1]).to.eql([3])
  })

  it('changes the page when value is changed', async () => {
    const wrapper = mount(Pager, {
      propsData: {
        pageCount: 5
      }
    })

    await wrapper.setProps({ value: 5 })
    expect(wrapper.emitted('input')[0]).to.eql([5])
  })
})
