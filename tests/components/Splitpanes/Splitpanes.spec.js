import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import Splitpanes from '@/components/Splitpanes'

describe('Splitpanes.vue', () => {
  it('renders correctly - vertical', () => {
    // mount the component
    const wrapper = shallowMount(Splitpanes, {
      slots: {
        leftPane: '<div />',
        rightPane: '<div />'
      },
      propsData: {
        before: { size: 60, max: 100 },
        after: { size: 40, max: 100 }
      }
    })

    expect(wrapper.findAll('.splitpanes-pane')).to.have.lengthOf(2)
    expect(wrapper.findAll('.splitpanes-pane').at(0).element.style.width).to.equal('60%')
    expect(wrapper.findAll('.splitpanes-pane').at(1).element.style.width).to.equal('40%')
  })

  it('renders correctly - horizontal', () => {
    // mount the component
    const wrapper = shallowMount(Splitpanes, {
      slots: {
        leftPane: '<div />',
        rightPane: '<div />'
      },
      propsData: {
        before: { size: 60, max: 100 },
        after: { size: 40, max: 100 },
        horizontal: true
      }
    })

    expect(wrapper.findAll('.splitpanes-pane')).to.have.lengthOf(2)
    expect(wrapper.findAll('.splitpanes-pane').at(0).element.style.height).to.equal('60%')
    expect(wrapper.findAll('.splitpanes-pane').at(1).element.style.height).to.equal('40%')
  })

  it('toggles correctly', async () => {
    // mount the component
    const wrapper = shallowMount(Splitpanes, {
      slots: {
        leftPane: '<div />',
        rightPane: '<div />'
      },
      propsData: {
        before: { size: 60, max: 100 },
        after: { size: 40, max: 100 }
      }
    })

    await wrapper.find('.toggle-btn').trigger('click')
    expect(wrapper.findAll('.splitpanes-pane').at(0).element.style.width).to.equal('0%')
    expect(wrapper.findAll('.splitpanes-pane').at(1).element.style.width).to.equal('100%')

    await wrapper.find('.toggle-btn').trigger('click')
    expect(wrapper.findAll('.splitpanes-pane').at(0).element.style.width).to.equal('60%')
    expect(wrapper.findAll('.splitpanes-pane').at(1).element.style.width).to.equal('40%')

    await wrapper.findAll('.toggle-btn').at(1).trigger('click')
    expect(wrapper.findAll('.splitpanes-pane').at(0).element.style.width).to.equal('100%')
    expect(wrapper.findAll('.splitpanes-pane').at(1).element.style.width).to.equal('0%')

    await wrapper.find('.toggle-btn').trigger('click')
    expect(wrapper.findAll('.splitpanes-pane').at(0).element.style.width).to.equal('60%')
    expect(wrapper.findAll('.splitpanes-pane').at(1).element.style.width).to.equal('40%')
  })

  it('drag - vertical', async () => {
    const root = document.createElement('div')
    const place = document.createElement('div')
    root.style.width = '600px'
    root.style.height = '500px'
    root.appendChild(place)
    document.body.appendChild(root)

    // mount the component
    const wrapper = shallowMount(Splitpanes, {
      attachTo: place,
      slots: {
        leftPane: '<div />',
        rightPane: '<div />'
      },
      propsData: {
        before: { size: 60, max: 100 },
        after: { size: 40, max: 100 }
      }
    })

    await wrapper.find('.splitpanes-splitter').trigger('mousedown')
    document.dispatchEvent(new MouseEvent('mousemove', {
      clientX: 300,
      clientY: 80
    }))
    document.dispatchEvent(new MouseEvent('mouseup'))
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.splitpanes-pane').at(0).element.style.width).to.equal('50%')
    wrapper.destroy()
    root.remove()
  })

  it('drag - horizontal', async () => {
    const root = document.createElement('div')
    const place = document.createElement('div')
    root.style.width = '600px'
    root.style.height = '500px'
    root.appendChild(place)
    document.body.appendChild(root)

    // mount the component
    const wrapper = shallowMount(Splitpanes, {
      attachTo: place,
      slots: {
        leftPane: '<div />',
        rightPane: '<div />'
      },
      propsData: {
        before: { size: 10, max: 100 },
        after: { size: 90, max: 100 },
        horizontal: true
      }
    })

    await wrapper.find('.splitpanes-splitter').trigger('mousedown')
    document.dispatchEvent(new MouseEvent('mousemove', {
      clientX: 10,
      clientY: 250
    }))
    document.dispatchEvent(new MouseEvent('mouseup'))
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.splitpanes-pane').at(0).element.style.height).to.equal('50%')
    wrapper.destroy()
    root.remove()
  })

  it('drag - horizontal - touch', async () => {
    const root = document.createElement('div')
    const place = document.createElement('div')
    root.style.width = '600px'
    root.style.height = '500px'
    root.appendChild(place)
    document.body.appendChild(root)

    // mount the component
    const wrapper = shallowMount(Splitpanes, {
      attachTo: place,
      slots: {
        leftPane: '<div />',
        rightPane: '<div />'
      },
      propsData: {
        before: { size: 10, max: 100 },
        after: { size: 90, max: 100 },
        horizontal: true
      }
    })

    window.ontouchstart = null
    await wrapper.find('.splitpanes-splitter').trigger('touchstart')
    const event = new TouchEvent('touchmove')
    Object.defineProperty(event, 'touches', {
      value: [{
        clientX: 10,
        clientY: 250
      }],
      writable: true
    })
    document.dispatchEvent(event)
    document.dispatchEvent(new MouseEvent('touchend'))
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.splitpanes-pane').at(0).element.style.height).to.equal('50%')
    wrapper.destroy()
    root.remove()
    delete window.ontouchstart
  })

  it('drag - vertical - touch', async () => {
    const root = document.createElement('div')
    const place = document.createElement('div')
    root.style.width = '600px'
    root.style.height = '500px'
    root.appendChild(place)
    document.body.appendChild(root)

    // mount the component
    const wrapper = shallowMount(Splitpanes, {
      attachTo: place,
      slots: {
        leftPane: '<div />',
        rightPane: '<div />'
      },
      propsData: {
        before: { size: 60, max: 100 },
        after: { size: 40, max: 100 }
      }
    })
    window.ontouchstart = null

    await wrapper.find('.splitpanes-splitter').trigger('touchstart')
    const event = new TouchEvent('touchmove')
    Object.defineProperty(event, 'touches', {
      value: [{
        clientX: 300,
        clientY: 80
      }],
      writable: true
    })
    document.dispatchEvent(event)
    document.dispatchEvent(new MouseEvent('touchend'))
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.splitpanes-pane').at(0).element.style.width).to.equal('50%')
    wrapper.destroy()
    root.remove()
    delete window.ontouchstart
  })
})
