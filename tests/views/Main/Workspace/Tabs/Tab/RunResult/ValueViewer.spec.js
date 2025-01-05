import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import ValueViewer from '@/views/Main/Workspace/Tabs/Tab/RunResult/ValueViewer'
import sinon from 'sinon'

describe('ValueViewer.vue', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('shows value in text mode', async () => {
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
    expect(wrapper.find('.value-body').text()).to.equals('Can\'t parse JSON.')
  })

  it('copy to clipboard', async () => {
    sinon.stub(window.navigator.clipboard, 'writeText').resolves()
    const wrapper = mount(ValueViewer, {
      props: {
        cellValue: 'foo'
      }
    })

    await wrapper.find('button.copy').trigger('click')

    expect(window.navigator.clipboard.writeText.calledOnceWith('foo'))
      .to.equal(true)
  })
})
