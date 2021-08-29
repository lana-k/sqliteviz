import { expect } from 'chai'
import { mount, createWrapper } from '@vue/test-utils'
import DataView from '@/views/Main/Workspace/Tabs/Tab/DataView'
import sinon from 'sinon'

describe('DataView.vue', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('emits update on mode changing', async () => {
    const wrapper = mount(DataView)

    const pivotBtn = createWrapper(wrapper.findComponent({ name: 'pivotIcon' }).vm.$parent)
    await pivotBtn.trigger('click')

    expect(wrapper.emitted('update')).to.have.lengthOf(1)
  })

  it('method getOptionsForSave calls the same method of the current view component', async () => {
    const wrapper = mount(DataView)

    const chart = wrapper.findComponent({ name: 'Chart' }).vm
    sinon.stub(chart, 'getOptionsForSave').returns({ here_are: 'chart_settings' })

    expect(wrapper.vm.getOptionsForSave()).to.eql({ here_are: 'chart_settings' })

    const pivotBtn = createWrapper(wrapper.findComponent({ name: 'pivotIcon' }).vm.$parent)
    await pivotBtn.trigger('click')

    const pivot = wrapper.findComponent({ name: 'pivot' }).vm
    sinon.stub(pivot, 'getOptionsForSave').returns({ here_are: 'pivot_settings' })

    expect(wrapper.vm.getOptionsForSave()).to.eql({ here_are: 'pivot_settings' })
  })

  it('method saveAsSvg calls the same method of the current view component', async () => {
    const wrapper = mount(DataView)

    // Find chart and spy the method
    const chart = wrapper.findComponent({ name: 'Chart' }).vm
    sinon.spy(chart, 'saveAsSvg')

    // Export to svg
    const svgBtn = createWrapper(wrapper.findComponent({ name: 'exportToSvgIcon' }).vm.$parent)
    await svgBtn.trigger('click')
    expect(chart.saveAsSvg.calledOnce).to.equal(true)

    // Switch to pivot
    const pivotBtn = createWrapper(wrapper.findComponent({ name: 'pivotIcon' }).vm.$parent)
    await pivotBtn.trigger('click')

    // Find pivot and spy the method
    const pivot = wrapper.findComponent({ name: 'pivot' }).vm
    sinon.spy(pivot, 'saveAsSvg')

    // Export to svg
    await svgBtn.trigger('click')
    expect(pivot.saveAsSvg.calledOnce).to.equal(true)
  })

  it('shows alert when ClipboardItem is not supported', async () => {
    const ClipboardItem = window.ClipboardItem
    delete window.ClipboardItem
    sinon.spy(window, 'alert')
    const wrapper = mount(DataView)

    const copyBtn = createWrapper(wrapper.findComponent({ name: 'clipboardIcon' }).vm.$parent)
    await copyBtn.trigger('click')

    expect(
      window.alert.calledOnceWith(
        "Your browser doesn't support copying images into the clipboard. " +
        'If you use Firefox you can enable it ' +
        'by setting dom.events.asyncClipboard.clipboardItem to true.'
      )
    ).to.equal(true)

    window.ClipboardItem = ClipboardItem
  })
})
