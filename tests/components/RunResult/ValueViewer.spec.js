import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import ValueViewer from '@/components/RunResult/ValueViewer.vue'
import sinon from 'sinon'

describe('ValueViewer.vue', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('shows value in text mode', () => {
    const wrapper = mount(ValueViewer, {
      props: {
        cellValue: 'foo'
      }
    })

    expect(wrapper.find('.value-body').text()).to.equals('foo')
  })

  it('shows error in json mode if the value is not json', async () => {
    const wrapper = mount(ValueViewer, {
      props: {
        cellValue: 'foo'
      }
    })
    await wrapper.find('button.json').trigger('click')
    expect(wrapper.find('.value-body').text()).to.equals("Can't parse JSON.")
  })

  it('copy to clipboard', async () => {
    sinon.stub(window.navigator.clipboard, 'writeText').resolves()
    const wrapper = mount(ValueViewer, {
      props: {
        cellValue: 'foo'
      }
    })

    await wrapper.find('button.copy').trigger('click')

    expect(window.navigator.clipboard.writeText.calledOnceWith('foo')).to.equal(
      true
    )
  })

  it('wraps lines', async () => {
    const wrapper = mount(ValueViewer, {
      attachTo: document.body,
      props: {
        cellValue: 'foo'
      }
    })

    wrapper.wrapperElement.parentElement.style.width = '50px'
    const valueBody = wrapper.find('.value-body').wrapperElement
    expect(valueBody.scrollWidth).to.equal(valueBody.clientWidth)

    await wrapper.setProps({ cellValue: 'foo'.repeat(100) })
    expect(valueBody.scrollWidth).not.to.equal(valueBody.clientWidth)

    await wrapper.find('button.line-wrap').trigger('click')
    expect(valueBody.scrollWidth).to.equal(valueBody.clientWidth)
    wrapper.unmount()
  })

  it('wraps lines in code mirror', async () => {
    const wrapper = mount(ValueViewer, {
      attachTo: document.body,
      props: {
        cellValue: '{"foo": "foofoofoofoofoofoofoofoofoofoo"}'
      }
    })

    await wrapper.find('button.json').trigger('click')

    wrapper.wrapperElement.parentElement.style.width = '50px'
    const codeMirrorScroll = wrapper.find('.CodeMirror-scroll').wrapperElement
    expect(codeMirrorScroll.scrollWidth).not.to.equal(
      codeMirrorScroll.clientWidth
    )

    await wrapper.find('button.line-wrap').trigger('click')
    expect(codeMirrorScroll.scrollWidth).to.equal(codeMirrorScroll.clientWidth)
    wrapper.unmount()
  })
})
