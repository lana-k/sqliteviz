import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import DataView from '@/views/Main/Workspace/Tabs/Tab/DataView'
import sinon from 'sinon'
import { nextTick } from 'vue'

describe('DataView.vue', () => {
  const $store = { state: { isWorkspaceVisible: true } }

  afterEach(() => {
    sinon.restore()
  })

  it('emits update on mode changing', async () => {
    const wrapper = mount(DataView, { 
      global: {
        stubs: { 'chart': true }
      }
    })

    const pivotBtn = wrapper.findComponent({ ref: 'pivotBtn' })
    await pivotBtn.trigger('click')

    expect(wrapper.emitted('update')).to.have.lengthOf(1)
    wrapper.unmount()
  })

  it('method getOptionsForSave calls the same method of the current view component', async () => {
    const wrapper = mount(DataView,  {
      global: {
        mocks: { $store }
      }
    })

    const chart = wrapper.findComponent({ name: 'Chart' }).vm
    sinon.stub(chart, 'getOptionsForSave').returns({ here_are: 'chart_settings' })

    expect(wrapper.vm.getOptionsForSave()).to.eql({ here_are: 'chart_settings' })

    const pivotBtn = wrapper.findComponent({ ref: 'pivotBtn' })
    await pivotBtn.trigger('click')

    const pivot = wrapper.findComponent({ name: 'pivot' }).vm
    sinon.stub(pivot, 'getOptionsForSave').returns({ here_are: 'pivot_settings' })

    expect(wrapper.vm.getOptionsForSave()).to.eql({ here_are: 'pivot_settings' })
    wrapper.unmount()
  })

  it('method saveAsSvg calls the same method of the current view component', async () => {
    const wrapper = mount(DataView, {
      global: {
        mocks: { $store }
      }
    })

    // Find chart and spy the method
    const chart = wrapper.findComponent({ name: 'Chart' }).vm
    sinon.spy(chart, 'saveAsSvg')

    // Export to svg
    const svgBtn = wrapper.findComponent({ ref: 'svgExportBtn' })
    await svgBtn.trigger('click')
    expect(chart.saveAsSvg.calledOnce).to.equal(true)

    // Switch to pivot
    const pivotBtn = wrapper.findComponent({ ref: 'pivotBtn' })
    await pivotBtn.trigger('click')

    // Find pivot and spy the method
    const pivot = wrapper.findComponent({ name: 'pivot' }).vm
    sinon.spy(pivot, 'saveAsSvg')

    // Switch to Custom Chart renderer
    pivot.pivotOptions.rendererName = 'Custom chart'
    await pivot.$nextTick()

    // Export to svg
    await svgBtn.trigger('click')
    expect(pivot.saveAsSvg.calledOnce).to.equal(true)
    wrapper.unmount()
  })

  it('method saveAsHtml calls the same method of the current view component', async () => {
    const wrapper = mount(DataView, {
      global: {
        mocks: { $store }
      }
    })

    // Find chart and spy the method
    const chart = wrapper.findComponent({ name: 'Chart' }).vm
    sinon.spy(chart, 'saveAsHtml')

    // Export to html
    const htmlBtn = wrapper.findComponent({ ref: 'htmlExportBtn' })
    await htmlBtn.trigger('click')
    expect(chart.saveAsHtml.calledOnce).to.equal(true)

    // Switch to pivot
    const pivotBtn = wrapper.findComponent({ ref: 'pivotBtn' })
    await pivotBtn.trigger('click')

    // Find pivot and spy the method
    const pivot = wrapper.findComponent({ name: 'pivot' }).vm
    sinon.spy(pivot, 'saveAsHtml')

    // Export to svg
    await htmlBtn.trigger('click')
    expect(pivot.saveAsHtml.calledOnce).to.equal(true)
    wrapper.unmount()
  })

  it('shows alert when ClipboardItem is not supported', async () => {
    const ClipboardItem = window.ClipboardItem
    delete window.ClipboardItem
    sinon.spy(window, 'alert')
    const wrapper = mount(DataView, {
      global: {
        stubs: { 'chart': true }
      }
    })

    const copyBtn = wrapper.findComponent({ ref: 'copyToClipboardBtn' })
    await copyBtn.trigger('click')

    expect(
      window.alert.calledOnceWith(
        "Your browser doesn't support copying images into the clipboard. " +
        'If you use Firefox you can enable it ' +
        'by setting dom.events.asyncClipboard.clipboardItem to true.'
      )
    ).to.equal(true)

    window.ClipboardItem = ClipboardItem
    wrapper.unmount()
  })

  it('copy to clipboard more than 1 sec', async () => {
    sinon.stub(window.navigator.clipboard, 'write').resolves()
    const clock = sinon.useFakeTimers()
    const wrapper = mount(DataView, {
      attachTo: document.body,
      global: {
        stubs: { teleport: true, transition: false },
        mocks: { $store }
      }
    })
    sinon.stub(wrapper.vm.$refs.viewComponent, 'prepareCopy').callsFake(async () => {
      await clock.tick(5000)
    })

    // Click copy to clipboard
    const copyBtn = wrapper.findComponent({ ref: 'copyToClipboardBtn' })
    await copyBtn.trigger('click')

    // The dialog is shown...
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(true)
    expect(wrapper.find('.dialog.vfm .dialog-header').text())
      .to.contain('Copy to clipboard')

    // ... with Rendering message...
    expect(wrapper.find('.dialog-body').text()).to.equal('Rendering the visualisation...')

    // Switch to microtasks (let prepareCopy run)
    await clock.tick(0)
    // Wait untill prepareCopy is finished
    await wrapper.vm.$refs.viewComponent.prepareCopy.returnValues[0]

    await nextTick()
    await nextTick()

    // The dialog is shown...
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(true)

    // ... with Ready message...
    expect(wrapper.find('.dialog-body').text()).to.equal('Image is ready')

    // Click copy
    await wrapper.find('.dialog-buttons-container button.primary').trigger('click')

    // The dialog is not shown...
    await clock.tick(100)
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(false)
    wrapper.unmount()
  })

  it('copy to clipboard less than 1 sec', async () => {
    sinon.stub(window.navigator.clipboard, 'write').resolves()
    const clock = sinon.useFakeTimers()
    const wrapper = mount(DataView, {
      attachTo: document.body,
      global: {
        stubs: { teleport: true, transition: false },
        mocks: { $store }
      }
    })
    sinon.spy(wrapper.vm, 'copyToClipboard')
    sinon.stub(wrapper.vm.$refs.viewComponent, 'prepareCopy').callsFake(async () => {
      await clock.tick(500)
    })

    // Click copy to clipboard
    const copyBtn = wrapper.findComponent({ ref: 'copyToClipboardBtn' })
    await copyBtn.trigger('click')

    // Switch to microtasks (let prepareCopy run)
    await clock.tick(0)
    // Wait untill prepareCopy is finished
    await wrapper.vm.$refs.viewComponent.prepareCopy.returnValues[0]

    await nextTick()
    // The dialog is not shown...
    await clock.tick(100)
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(false)
    // copyToClipboard is called
    expect(wrapper.vm.copyToClipboard.calledOnce).to.equal(true)
    wrapper.unmount()
  })

  it('cancel long copy', async () => {
    sinon.stub(window.navigator.clipboard, 'write').resolves()
    const clock = sinon.useFakeTimers()
    const wrapper = mount(DataView, {
      attachTo: document.body,
      global: {
        stubs: { teleport: true, transition: false },
        mocks: { $store }
      }
    })
    sinon.spy(wrapper.vm, 'copyToClipboard')
    sinon.stub(wrapper.vm.$refs.viewComponent, 'prepareCopy').callsFake(async () => {
      await clock.tick(5000)
    })

    // Click copy to clipboard
    const copyBtn = wrapper.findComponent({ ref: 'copyToClipboardBtn' })
    await copyBtn.trigger('click')

    // Switch to microtasks (let prepareCopy run)
    await clock.tick(0)
    // Wait untill prepareCopy is finished
    await wrapper.vm.$refs.viewComponent.prepareCopy.returnValues[0]

    await nextTick()

    // Click cancel
    await wrapper.find('.dialog-buttons-container button.secondary').trigger('click')

    // The dialog is not shown...
    await clock.tick(100)
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(false)
    // copyToClipboard is not called
    expect(wrapper.vm.copyToClipboard.calledOnce).to.equal(false)
    wrapper.unmount()
  })
})
