import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import tooltipMixin from '@/tooltipMixin'
import sinon from 'sinon'

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
    const wrapper = mount(component, { attachTo: container })
    expect(wrapper.find('div').isVisible()).to.equal(false)
  })

  it('tooltipStyle is correct when showTooltip: top-right', async () => {
    const clock = sinon.useFakeTimers()
    const component = {
      template:
        '<div :style="{...tooltipStyle, width: \'100px\'}" ref="tooltip"></div>',
      mixins: [tooltipMixin]
    }

    const wrapper = mount(component, { attachTo: container })

    // by default top-right
    await wrapper.vm.showTooltip(
      new MouseEvent('mouseenter', {
        clientX: 10,
        clientY: 20
      })
    )
    await clock.tick(500)
    expect(wrapper.vm.tooltipStyle).to.eql({
      visibility: 'visible',
      top: '8px',
      left: '22px'
    })
    expect(wrapper.find('div').isVisible()).to.equal(true)
    clock.restore()
  })

  it('tooltipStyle is correct when showTooltip: top-left', async () => {
    const clock = sinon.useFakeTimers()
    const component = {
      template:
        '<div :style="{...tooltipStyle, width: \'100px\'}" ref="tooltip"></div>',
      mixins: [tooltipMixin]
    }
    const wrapper = mount(component, { attachTo: container })

    await wrapper.vm.showTooltip(
      new MouseEvent('mouseenter', {
        clientX: 212,
        clientY: 20
      }),
      'top-left'
    )
    await clock.tick(500)

    expect(wrapper.vm.tooltipStyle).to.eql({
      visibility: 'visible',
      top: '8px',
      left: '100px'
    })

    expect(wrapper.find('div').isVisible()).to.equal(true)
    clock.restore()
  })

  it('tooltipStyle is correct when showTooltip: bottom-right', async () => {
    const clock = sinon.useFakeTimers()
    const component = {
      template:
        '<div :style="{...tooltipStyle, width: \'100px\'}" ref="tooltip"></div>',
      mixins: [tooltipMixin]
    }
    const wrapper = mount(component, { attachTo: container })

    await wrapper.vm.showTooltip(
      new MouseEvent('mouseenter', {
        clientX: 10,
        clientY: 20
      }),
      'bottom-right'
    )
    await clock.tick(500)
    expect(wrapper.vm.tooltipStyle).to.eql({
      visibility: 'visible',
      top: '32px',
      left: '22px'
    })
    expect(wrapper.find('div').isVisible()).to.equal(true)
    clock.restore()
  })

  it('tooltipStyle is correct when showTooltip: bottom-left', async () => {
    const clock = sinon.useFakeTimers()
    const component = {
      template:
        '<div :style="{...tooltipStyle, width: \'100px\'}" ref="tooltip"></div>',
      mixins: [tooltipMixin]
    }
    const wrapper = mount(component, { attachTo: container })

    await wrapper.vm.showTooltip(
      new MouseEvent('mouseenter', {
        clientX: 212,
        clientY: 20
      }),
      'bottom-left'
    )
    await clock.tick(500)

    expect(wrapper.vm.tooltipStyle).to.eql({
      visibility: 'visible',
      top: '32px',
      left: '100px'
    })
    expect(wrapper.find('div').isVisible()).to.equal(true)
    clock.restore()
  })

  it('tooltip is not visible after hideTooltip', async () => {
    const clock = sinon.useFakeTimers()
    const component = {
      template: '<div :style="tooltipStyle"></div>',
      mixins: [tooltipMixin]
    }
    const wrapper = mount(component, { attachTo: container })
    await wrapper.vm.showTooltip(
      new MouseEvent('mouseenter', {
        clientX: 10,
        clientY: 20
      })
    )
    await wrapper.vm.hideTooltip()
    await clock.tick(500)
    expect(wrapper.find('div').isVisible()).to.equal(false)
    clock.restore()
  })
})
