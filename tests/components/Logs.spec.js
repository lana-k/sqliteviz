import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import Logs from '@/components/Logs'
import { nextTick } from 'vue'

let place
describe('Logs.vue', () => {
  beforeEach(() => {
    place = document.createElement('div')
    document.body.appendChild(place)
  })

  afterEach(() => {
    place.remove()
  })

  it('Scrolled to bottom on mounted', async () => {
    const messages = [
      { type: 'error', message: 'msg 1' },
      { type: 'error', message: 'msg 2' },
      { type: 'error', message: 'msg 3' },
      { type: 'error', message: 'msg 4' }
    ]

    const containerHeight = 160
    const borderWidth = 1
    const viewHeight = containerHeight - 2 * borderWidth
    const wrapper = shallowMount(Logs, {
      attachTo: place,
      props: { messages, style: `height: ${containerHeight}px` }
    })
    await nextTick()
    const height = wrapper.find('.logs-container').element.scrollHeight
    expect(wrapper.find('.logs-container').element.scrollTop).to.equal(
      height - viewHeight
    )
    wrapper.unmount()
  })

  it('Scrolled to bottom when a message added', async () => {
    const messages = [
      { type: 'error', message: 'msg 1' },
      { type: 'error', message: 'msg 2' },
      { type: 'error', message: 'msg 3' },
      { type: 'error', message: 'msg 4' }
    ]

    const containerHeight = 160
    const borderWidth = 1
    const viewHeight = containerHeight - 2 * borderWidth
    const wrapper = shallowMount(Logs, {
      attachTo: place,
      props: { messages, style: `height: ${containerHeight}px` }
    })

    await nextTick()
    messages.push({ type: 'error', message: 'msg 5' })

    await nextTick()
    await nextTick()
    const height = wrapper.find('.logs-container').element.scrollHeight
    expect(wrapper.find('.logs-container').element.scrollTop).to.equal(
      height - viewHeight
    )
    wrapper.unmount()
  })

  it('Serializes messages', async () => {
    const messages = [
      { type: 'error', message: 'msg 1.', row: 0, hint: 'Try again later.' },
      { type: 'error', message: 'msg 2!', row: 2, hint: undefined },
      { type: 'error', message: 'msg 3?', hint: 'Be happy!' },
      { type: 'error', message: 'msg 4' }
    ]

    const wrapper = shallowMount(Logs, {
      props: { messages }
    })

    const logs = wrapper.findAll('.msg')
    expect(logs[0].text()).to.equal('Error in row 0. msg 1. Try again later.')
    expect(logs[1].text()).to.equal('Error in row 2. msg 2!')
    expect(logs[2].text()).to.equal('msg 3? Be happy!')
    expect(logs[3].text()).to.equal('msg 4.')
  })
})
