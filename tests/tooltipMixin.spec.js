import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import tooltipMixin from '@/tooltipMixin'

describe('tooltipMixin.js', () => {
  it('tooltip is hidden in initial', () => {
    const component = {
      template: '<div :style="tooltipStyle"></div>',
      mixins: [tooltipMixin]
    }
    const wrapper = mount(component)
    expect(wrapper.find('div').isVisible()).to.equal(false)
  })

  it('tooltipStyle is correct when showTooltip', async () => {
    const component = {
      template: '<div :style="tooltipStyle"></div>',
      mixins: [tooltipMixin]
    }
    const wrapper = mount(component)
    await wrapper.vm.showTooltip(new MouseEvent('mouseover', {
      clientX: 10,
      clientY: 20
    }))
    expect(wrapper.vm.tooltipStyle).to.eql({
      visibility: 'visible',
      top: '8px',
      left: '22px'
    })
    expect(wrapper.find('div').isVisible()).to.equal(true)
  })

  it('tooltip is not visible after hideTooltip', async () => {
    const component = {
      template: '<div :style="tooltipStyle"></div>',
      mixins: [tooltipMixin]
    }
    const wrapper = mount(component)
    await wrapper.vm.showTooltip(new MouseEvent('mouseover', {
      clientX: 10,
      clientY: 20
    }))
    await wrapper.vm.hideTooltip()
    expect(wrapper.find('div').isVisible()).to.equal(false)
  })
})
