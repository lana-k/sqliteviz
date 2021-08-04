import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import tooltipMixin from '@/tooltipMixin'

describe('tooltipMixin.js', () => {
  let container
  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
  })

  it('tooltip is hidden in initial', () => {
    const component = {
      template: '<div :style="tooltipStyle"></div>',
      mixins: [tooltipMixin]
    }
    const wrapper = mount(component)
    expect(wrapper.find('div').isVisible()).to.equal(false)
  })

  it('tooltipStyle is correct when showTooltip: top-right', async () => {
    const component = {
      template: '<div :style="{...tooltipStyle, width: \'100px\'}" ref="tooltip"></div>',
      mixins: [tooltipMixin]
    }

    const wrapper = mount(component, { attachTo: container })

    // by default top-right
    await wrapper.vm.showTooltip(new MouseEvent('mouseenter', {
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

  it('tooltipStyle is correct when showTooltip: top-left', async () => {
    const component = {
      template: '<div :style="{...tooltipStyle, width: \'100px\'}" ref="tooltip"></div>',
      mixins: [tooltipMixin]
    }
    const wrapper = mount(component, { attachTo: container })

    await wrapper.vm.showTooltip(new MouseEvent('mouseenter', {
      clientX: 212,
      clientY: 20
    }), 'top-left')

    expect(wrapper.vm.tooltipStyle).to.eql({
      visibility: 'visible',
      top: '8px',
      left: '100px'
    })

    expect(wrapper.find('div').isVisible()).to.equal(true)
  })

  it('tooltipStyle is correct when showTooltip: bottom-right', async () => {
    const component = {
      template: '<div :style="{...tooltipStyle, width: \'100px\'}" ref="tooltip"></div>',
      mixins: [tooltipMixin]
    }
    const wrapper = mount(component, { attachTo: container })

    await wrapper.vm.showTooltip(new MouseEvent('mouseenter', {
      clientX: 10,
      clientY: 20
    }), 'bottom-right')
    expect(wrapper.vm.tooltipStyle).to.eql({
      visibility: 'visible',
      top: '32px',
      left: '22px'
    })
    expect(wrapper.find('div').isVisible()).to.equal(true)
  })

  it('tooltipStyle is correct when showTooltip: bottom-left', async () => {
    const component = {
      template: '<div :style="{...tooltipStyle, width: \'100px\'}" ref="tooltip"></div>',
      mixins: [tooltipMixin]
    }
    const wrapper = mount(component, { attachTo: container })

    await wrapper.vm.showTooltip(new MouseEvent('mouseenter', {
      clientX: 212,
      clientY: 20
    }), 'bottom-left')

    expect(wrapper.vm.tooltipStyle).to.eql({
      visibility: 'visible',
      top: '32px',
      left: '100px'
    })
    expect(wrapper.find('div').isVisible()).to.equal(true)
  })

  it('tooltip is not visible after hideTooltip', async () => {
    const component = {
      template: '<div :style="tooltipStyle"></div>',
      mixins: [tooltipMixin]
    }
    const wrapper = mount(component)
    await wrapper.vm.showTooltip(new MouseEvent('mouseenter', {
      clientX: 10,
      clientY: 20
    }))
    await wrapper.vm.hideTooltip()
    expect(wrapper.find('div').isVisible()).to.equal(false)
  })
})
