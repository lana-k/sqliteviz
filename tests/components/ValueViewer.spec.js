import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import ValueViewer from '@/components/ValueViewer.vue'
import sinon from 'sinon'

describe('ValueViewer.vue', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('shows value in text mode', () => {
    const wrapper = mount(ValueViewer, {
      props: {
        value: 'foo'
      }
    })

    expect(wrapper.find('.value-body').text()).to.equals('foo')
    expect(wrapper.find('button.text').attributes('aria-selected')).to.equal(
      'true'
    )
  })

  it('shows meta values', async () => {
    const wrapper = mount(ValueViewer, {
      props: {
        value: new Uint8Array()
      }
    })

    expect(wrapper.find('.value-body').text()).to.equals('BLOB')

    await wrapper.setProps({ value: null })
    expect(wrapper.find('.value-body').text()).to.equals('NULL')
  })

  it('shows error in json mode if the value is not json', async () => {
    const wrapper = mount(ValueViewer, {
      props: {
        value: 'foo',
        defaultFormat: 'json'
      }
    })
    expect(wrapper.find('.value-body').text()).to.equals("Can't parse JSON.")
    expect(wrapper.find('button[aria-selected="true"]').text()).contains('JSON')
  })

  it('copy to clipboard', async () => {
    sinon.stub(window.navigator.clipboard, 'writeText').resolves()
    const wrapper = mount(ValueViewer, {
      props: {
        value: 'foo'
      }
    })

    await wrapper.find('button.copy').trigger('click')

    expect(window.navigator.clipboard.writeText.calledOnceWith('foo')).to.equal(
      true
    )

    await wrapper.setProps({ value: '{"foo": "bar"}' })
    await wrapper.find('button.json').trigger('click')
    await wrapper.find('button.copy').trigger('click')
    expect(window.navigator.clipboard.writeText.args[1][0]).to.equal(
      '{\n    "foo": "bar"\n}'
    )
  })

  it('wraps lines', async () => {
    const wrapper = mount(ValueViewer, {
      attachTo: document.body,
      props: {
        value: 'foo'
      }
    })

    wrapper.wrapperElement.parentElement.style.width = '50px'
    const valueBody = wrapper.find('.value-body').wrapperElement
    expect(valueBody.scrollWidth).to.equal(valueBody.clientWidth)

    await wrapper.setProps({ value: 'foo'.repeat(100) })
    expect(valueBody.scrollWidth).not.to.equal(valueBody.clientWidth)

    await wrapper.find('button.line-wrap').trigger('click')
    expect(valueBody.scrollWidth).to.equal(valueBody.clientWidth)
    wrapper.unmount()
  })

  it('wraps lines in code mirror', async () => {
    const wrapper = mount(ValueViewer, {
      attachTo: document.body,
      props: {
        value: '{"foo": "foofoofoofoofoofoofoofoofoofoo"}'
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

  it('shows empty message if empty is true', () => {
    const wrapper = mount(ValueViewer, {
      props: {
        empty: true,
        emptyMessage: 'I am empty'
      }
    })

    expect(wrapper.find('.value-viewer').text()).to.equals('I am empty')
  })
})
