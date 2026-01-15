import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import Splitpanes from '@/components/Common/Splitpanes'
import { nextTick } from 'vue'

describe('Splitpanes.vue', () => {
  it('renders correctly - vertical', () => {
    // mount the component
    const wrapper = shallowMount(Splitpanes, {
      slots: {
        'left-pane': '<div />',
        'right-pane': '<div />'
      },
      props: {
        before: { size: 60, max: 100 },
        after: { size: 40, max: 100 }
      }
    })

    expect(wrapper.findAll('.splitpanes-pane')).to.have.lengthOf(2)
    expect(wrapper.findAll('.splitpanes-pane')[0].element.style.width).to.equal(
      '60%'
    )
    expect(wrapper.findAll('.splitpanes-pane')[1].element.style.width).to.equal(
      '40%'
    )
  })

  it('renders correctly - horizontal', () => {
    // mount the component
    const wrapper = shallowMount(Splitpanes, {
      slots: {
        leftPane: '<div />',
        rightPane: '<div />'
      },
      props: {
        before: { size: 60, max: 100 },
        after: { size: 40, max: 100 },
        horizontal: true
      }
    })

    expect(wrapper.findAll('.splitpanes-pane')).to.have.lengthOf(2)
    expect(
      wrapper.findAll('.splitpanes-pane')[0].element.style.height
    ).to.equal('60%')
    expect(
      wrapper.findAll('.splitpanes-pane')[1].element.style.height
    ).to.equal('40%')
  })

  it('toggles correctly - no maximized initially', async () => {
    // mount the component
    const wrapper = shallowMount(Splitpanes, {
      slots: {
        'left-pane': '<div />',
        'right-pane': '<div />'
      },
      props: {
        before: { size: 60, max: 100 },
        after: { size: 40, max: 100 }
      }
    })

    await wrapper.find('.toggle-btn').trigger('click')
    expect(wrapper.findAll('.splitpanes-pane')[0].element.style.width).to.equal(
      '0%'
    )
    expect(wrapper.findAll('.splitpanes-pane')[1].element.style.width).to.equal(
      '100%'
    )

    await wrapper.find('.toggle-btn').trigger('click')
    expect(wrapper.findAll('.splitpanes-pane')[0].element.style.width).to.equal(
      '60%'
    )
    expect(wrapper.findAll('.splitpanes-pane')[1].element.style.width).to.equal(
      '40%'
    )

    await wrapper.findAll('.toggle-btn')[1].trigger('click')
    expect(wrapper.findAll('.splitpanes-pane')[0].element.style.width).to.equal(
      '100%'
    )
    expect(wrapper.findAll('.splitpanes-pane')[1].element.style.width).to.equal(
      '0%'
    )

    await wrapper.find('.toggle-btn').trigger('click')
    expect(wrapper.findAll('.splitpanes-pane')[0].element.style.width).to.equal(
      '60%'
    )
    expect(wrapper.findAll('.splitpanes-pane')[1].element.style.width).to.equal(
      '40%'
    )
  })

  it('toggles correctly - with maximized initially', async () => {
    // mount the component
    let wrapper = shallowMount(Splitpanes, {
      slots: {
        'left-pane': '<div />',
        'right-pane': '<div />'
      },
      props: {
        before: { size: 0, max: 100 },
        after: { size: 100, max: 100 },
        default: { before: 20, after: 80 }
      }
    })

    await wrapper.find('.toggle-btn').trigger('click')
    expect(wrapper.findAll('.splitpanes-pane')[0].element.style.width).to.equal(
      '20%'
    )
    expect(wrapper.findAll('.splitpanes-pane')[1].element.style.width).to.equal(
      '80%'
    )

    await wrapper.findAll('.toggle-btn')[0].trigger('click')
    expect(wrapper.findAll('.splitpanes-pane')[0].element.style.width).to.equal(
      '0%'
    )
    expect(wrapper.findAll('.splitpanes-pane')[1].element.style.width).to.equal(
      '100%'
    )

    await wrapper.find('.toggle-btn').trigger('click')
    expect(wrapper.findAll('.splitpanes-pane')[0].element.style.width).to.equal(
      '20%'
    )
    expect(wrapper.findAll('.splitpanes-pane')[1].element.style.width).to.equal(
      '80%'
    )

    await wrapper.findAll('.toggle-btn')[1].trigger('click')
    expect(wrapper.findAll('.splitpanes-pane')[0].element.style.width).to.equal(
      '100%'
    )
    expect(wrapper.findAll('.splitpanes-pane')[1].element.style.width).to.equal(
      '0%'
    )

    wrapper = shallowMount(Splitpanes, {
      slots: {
        leftPane: '<div />',
        rightPane: '<div />'
      },
      props: {
        before: { size: 100, max: 100 },
        after: { size: 0, max: 100 }
      }
    })

    await wrapper.find('.toggle-btn').trigger('click')
    expect(wrapper.findAll('.splitpanes-pane')[0].element.style.width).to.equal(
      '50%'
    )
    expect(wrapper.findAll('.splitpanes-pane')[1].element.style.width).to.equal(
      '50%'
    )

    await wrapper.findAll('.toggle-btn')[0].trigger('click')
    expect(wrapper.findAll('.splitpanes-pane')[0].element.style.width).to.equal(
      '0%'
    )
    expect(wrapper.findAll('.splitpanes-pane')[1].element.style.width).to.equal(
      '100%'
    )

    await wrapper.find('.toggle-btn').trigger('click')
    expect(wrapper.findAll('.splitpanes-pane')[0].element.style.width).to.equal(
      '50%'
    )
    expect(wrapper.findAll('.splitpanes-pane')[1].element.style.width).to.equal(
      '50%'
    )

    await wrapper.findAll('.toggle-btn')[1].trigger('click')
    expect(wrapper.findAll('.splitpanes-pane')[0].element.style.width).to.equal(
      '100%'
    )
    expect(wrapper.findAll('.splitpanes-pane')[1].element.style.width).to.equal(
      '0%'
    )
  })

  it('drag - vertical', async () => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    document.body.style.margin = 0

    // mount the component
    const wrapper = shallowMount(Splitpanes, {
      attachTo: root,
      slots: {
        'left-pane': '<div />',
        'right-pane': '<div />'
      },
      props: {
        before: { size: 60, max: 100 },
        after: { size: 40, max: 100 }
      }
    })
    const parent = root.querySelector('[data-v-app=""]')
    parent.style.width = '600px'
    parent.style.height = '500px'

    await wrapper.find('.splitpanes-splitter').trigger('mousedown')
    document.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX: 300,
        clientY: 80
      })
    )
    document.dispatchEvent(new MouseEvent('mouseup'))
    await nextTick()
    expect(wrapper.findAll('.splitpanes-pane')[0].element.style.width).to.equal(
      '50%'
    )
    wrapper.unmount()
    root.remove()
  })

  it('drag - horizontal', async () => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    document.body.style.margin = 0

    // mount the component
    const wrapper = shallowMount(Splitpanes, {
      attachTo: root,
      slots: {
        'left-pane': '<div />',
        'right-pane': '<div />'
      },
      props: {
        before: { size: 10, max: 100 },
        after: { size: 90, max: 100 },
        horizontal: true
      }
    })

    const parent = root.querySelector('[data-v-app=""]')
    parent.style.width = '600px'
    parent.style.height = '500px'

    await wrapper.find('.splitpanes-splitter').trigger('mousedown')
    document.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX: 10,
        clientY: 250
      })
    )
    document.dispatchEvent(new MouseEvent('mouseup'))
    await nextTick()
    await nextTick()
    expect(
      wrapper.findAll('.splitpanes-pane')[0].element.style.height
    ).to.equal('50%')
    wrapper.unmount()
    root.remove()
  })

  it('drag - horizontal - touch', async () => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    document.body.style.margin = 0

    // mount the component
    const wrapper = shallowMount(Splitpanes, {
      attachTo: root,
      slots: {
        'left-pane': '<div />',
        'right-pane': '<div />'
      },
      props: {
        before: { size: 10, max: 100 },
        after: { size: 90, max: 100 },
        horizontal: true
      }
    })

    const parent = root.querySelector('[data-v-app=""]')
    parent.style.width = '600px'
    parent.style.height = '500px'

    window.ontouchstart = null
    await wrapper.find('.splitpanes-splitter').trigger('touchstart')
    const event = new TouchEvent('touchmove')
    Object.defineProperty(event, 'touches', {
      value: [
        {
          clientX: 10,
          clientY: 250
        }
      ],
      writable: true
    })
    document.dispatchEvent(event)
    document.dispatchEvent(new MouseEvent('touchend'))
    await nextTick()
    expect(
      wrapper.findAll('.splitpanes-pane')[0].element.style.height
    ).to.equal('50%')
    wrapper.unmount()
    root.remove()
    delete window.ontouchstart
  })

  it('drag - vertical - touch', async () => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    document.body.style.margin = 0

    // mount the component
    const wrapper = shallowMount(Splitpanes, {
      attachTo: root,
      slots: {
        'left-pane': '<div />',
        'right-pane': '<div />'
      },
      props: {
        before: { size: 60, max: 100 },
        after: { size: 40, max: 100 }
      }
    })
    window.ontouchstart = null
    const parent = root.querySelector('[data-v-app=""]')
    parent.style.width = '600px'
    parent.style.height = '500px'

    await wrapper.find('.splitpanes-splitter').trigger('touchstart')
    const event = new TouchEvent('touchmove')
    Object.defineProperty(event, 'touches', {
      value: [
        {
          clientX: 300,
          clientY: 80
        }
      ],
      writable: true
    })
    document.dispatchEvent(event)
    document.dispatchEvent(new MouseEvent('touchend'))
    await nextTick()
    expect(wrapper.findAll('.splitpanes-pane')[0].element.style.width).to.equal(
      '50%'
    )
    wrapper.unmount()
    root.remove()
    delete window.ontouchstart
  })
})
