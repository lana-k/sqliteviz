import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import DataView from '@/components/DataView.vue'
import sinon from 'sinon'
import { nextTick } from 'vue'
import cIo from '@/lib/utils/clipboardIo'

describe('DataView.vue', () => {
  const $store = { state: { isWorkspaceVisible: true } }

  afterEach(() => {
    sinon.restore()
  })

  it('emits update on mode changing', async () => {
    const wrapper = mount(DataView, {
      global: {
        mocks: { $store }
      }
    })

    const pivotBtn = wrapper.findComponent({ ref: 'pivotBtn' })
    await pivotBtn.trigger('click')

    expect(wrapper.emitted('update')).to.have.lengthOf(1)
    wrapper.unmount()
  })

  it('method getOptionsForSave calls the same method of the current view component', async () => {
    const wrapper = mount(DataView, {
      global: {
        mocks: { $store },
        provide: {
          tabLayout: { dataView: 'above' }
        }
      }
    })

    const chart = wrapper.findComponent({ name: 'Chart' }).vm
    sinon
      .stub(chart, 'getOptionsForSave')
      .returns({ here_are: 'chart_settings' })

    expect(wrapper.vm.getOptionsForSave()).to.eql({
      here_are: 'chart_settings'
    })

    const pivotBtn = wrapper.findComponent({ ref: 'pivotBtn' })
    await pivotBtn.trigger('click')

    const pivot = wrapper.findComponent({ name: 'pivot' }).vm
    sinon
      .stub(pivot, 'getOptionsForSave')
      .returns({ here_are: 'pivot_settings' })

    expect(wrapper.vm.getOptionsForSave()).to.eql({
      here_are: 'pivot_settings'
    })

    const graphBtn = wrapper.findComponent({ ref: 'graphBtn' })
    await graphBtn.trigger('click')

    const graph = wrapper.findComponent({ name: 'graph' }).vm
    sinon
      .stub(graph, 'getOptionsForSave')
      .returns({ here_are: 'graph_settings' })

    expect(wrapper.vm.getOptionsForSave()).to.eql({
      here_are: 'graph_settings'
    })
    wrapper.unmount()
  })

  it('method saveAsSvg calls the same method of the current view component', async () => {
    const wrapper = mount(DataView, {
      global: {
        mocks: { $store },
        provide: {
          tabLayout: { dataView: 'above' }
        }
      }
    })

    // Find chart and spy the method
    const chart = wrapper.findComponent({ name: 'Chart' }).vm
    sinon.stub(chart, 'saveAsSvg')

    // Export to svg
    const svgBtn = wrapper.findComponent({ ref: 'svgExportBtn' })
    await svgBtn.trigger('click')
    expect(chart.saveAsSvg.calledOnce).to.equal(true)

    // Switch to pivot
    const pivotBtn = wrapper.findComponent({ ref: 'pivotBtn' })
    await pivotBtn.trigger('click')

    // Find pivot and spy the method
    const pivot = wrapper.findComponent({ name: 'pivot' }).vm
    sinon.stub(pivot, 'saveAsSvg')

    // Switch to Custom Chart renderer
    pivot.pivotOptions.rendererName = 'Custom chart'
    await pivot.$nextTick()

    // Export to svg
    await svgBtn.trigger('click')
    expect(pivot.saveAsSvg.calledOnce).to.equal(true)

    // Switch to graph - svg disabled
    const graphBtn = wrapper.findComponent({ ref: 'graphBtn' })
    await graphBtn.trigger('click')
    expect(svgBtn.attributes('disabled')).to.not.equal(undefined)

    wrapper.unmount()
  })

  it('method saveAsHtml calls the same method of the current view component', async () => {
    const wrapper = mount(DataView, {
      global: {
        mocks: { $store },
        provide: {
          tabLayout: { dataView: 'above' }
        }
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

    // Export to html
    await htmlBtn.trigger('click')
    expect(pivot.saveAsHtml.calledOnce).to.equal(true)

    // Switch to graph - htmlBtn disabled
    const graphBtn = wrapper.findComponent({ ref: 'graphBtn' })
    await graphBtn.trigger('click')
    expect(htmlBtn.attributes('disabled')).to.not.equal(undefined)

    wrapper.unmount()
  })

  it('method saveAsPng calls the same method of the current view component', async () => {
    const clock = sinon.useFakeTimers()
    const wrapper = mount(DataView, {
      global: {
        mocks: { $store },
        provide: {
          tabLayout: { dataView: 'above' }
        }
      }
    })

    // Find chart and stub the method
    const chart = wrapper.findComponent({ name: 'Chart' }).vm
    sinon.stub(chart, 'saveAsPng').callsFake(() => {
      chart.$emit('loadingImageCompleted')
    })

    // Export to png
    const pngBtn = wrapper.findComponent({ ref: 'pngExportBtn' })
    await pngBtn.trigger('click')
    await clock.tick(0)
    expect(chart.saveAsPng.calledOnce).to.equal(true)

    // Switch to pivot
    const pivotBtn = wrapper.findComponent({ ref: 'pivotBtn' })
    await pivotBtn.trigger('click')

    // Find pivot and stub the method
    const pivot = wrapper.findComponent({ name: 'pivot' }).vm
    sinon.stub(pivot, 'saveAsPng').callsFake(() => {
      pivot.$emit('loadingImageCompleted')
    })

    // Export to png
    await pngBtn.trigger('click')
    await clock.tick(0)
    expect(pivot.saveAsPng.calledOnce).to.equal(true)

    // Switch to graph
    const graphBtn = wrapper.findComponent({ ref: 'graphBtn' })
    await graphBtn.trigger('click')

    // Save as png is disabled because there is no data
    expect(pngBtn.attributes('disabled')).to.not.equal(undefined)

    await wrapper.setProps({ dataSource: { doc: [] } })

    // Find graph and stub the method
    const graph = wrapper.findComponent({ name: 'graph' }).vm
    sinon.stub(graph, 'saveAsPng').callsFake(() => {
      graph.$emit('loadingImageCompleted')
    })

    // Export to png
    await pngBtn.trigger('click')
    await clock.tick(0)
    expect(graph.saveAsPng.calledOnce).to.equal(true)

    wrapper.unmount()
  })

  it('shows alert when ClipboardItem is not supported', async () => {
    const ClipboardItem = window.ClipboardItem
    delete window.ClipboardItem
    sinon.spy(window, 'alert')
    const wrapper = mount(DataView, {
      global: {
        stubs: { chart: true }
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
    sinon.stub(cIo, 'copyImage')
    const clock = sinon.useFakeTimers()
    const wrapper = mount(DataView, {
      attachTo: document.body,
      global: {
        stubs: { teleport: true, transition: false },
        mocks: { $store }
      }
    })
    sinon
      .stub(wrapper.vm.$refs.viewComponent, 'prepareCopy')
      .callsFake(async () => {
        await clock.tick(5000)
      })

    // Click copy to clipboard
    const copyBtn = wrapper.findComponent({ ref: 'copyToClipboardBtn' })
    await copyBtn.trigger('click')

    // The dialog is shown...
    expect(wrapper.find('.dialog.vfm .vfm__content').exists()).to.equal(true)
    expect(wrapper.find('.dialog.vfm .dialog-header').text()).to.contain(
      'Copy to clipboard'
    )

    // ... with Rendering message...
    expect(wrapper.find('.dialog-body').text()).to.equal(
      'Rendering the visualisation...'
    )

    // Switch to microtasks (let prepareCopy run)
    await clock.tick(0)
    // Wait untill prepareCopy is finished
    await wrapper.vm.$refs.viewComponent.prepareCopy.returnValues[0]

    await nextTick()

    // The dialog is shown...
    expect(wrapper.find('.dialog.vfm .vfm__content').exists()).to.equal(true)

    // ... with Ready message...
    expect(wrapper.find('.dialog-body').text()).to.equal('Image is ready')

    // Click copy
    await wrapper
      .find('.dialog-buttons-container button.primary')
      .trigger('click')

    // The dialog is not shown...
    await clock.tick(100)
    expect(wrapper.find('.dialog.vfm .vfm__content').exists()).to.equal(false)
    wrapper.unmount()
  })

  it('copy to clipboard less than 1 sec', async () => {
    sinon.stub(window.navigator.clipboard, 'write').resolves()
    sinon.stub(cIo, 'copyImage')
    const clock = sinon.useFakeTimers()
    const wrapper = mount(DataView, {
      attachTo: document.body,
      global: {
        stubs: { teleport: true, transition: false },
        mocks: { $store }
      }
    })
    sinon.spy(wrapper.vm, 'copyToClipboard')
    sinon
      .stub(wrapper.vm.$refs.viewComponent, 'prepareCopy')
      .callsFake(async () => {
        await clock.tick(500)
      })

    // Click copy to clipboard
    const copyBtn = wrapper.findComponent({ ref: 'copyToClipboardBtn' })
    await copyBtn.trigger('click')

    // Switch to microtasks (let prepareCopy run)
    await clock.tick(0)
    // Wait untill prepareCopy is finished
    await wrapper.vm.$refs.viewComponent.prepareCopy.returnValues[0]

    // The dialog is not shown...
    await clock.tick(100)
    expect(wrapper.find('.dialog.vfm .vfm__content').exists()).to.equal(false)
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
    sinon
      .stub(wrapper.vm.$refs.viewComponent, 'prepareCopy')
      .callsFake(async () => {
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
    await wrapper
      .find('.dialog-buttons-container button.secondary')
      .trigger('click')

    // The dialog is not shown...
    await clock.tick(100)
    expect(wrapper.find('.dialog.vfm .vfm__content').exists()).to.equal(false)
    // copyToClipboard is not called
    expect(wrapper.vm.copyToClipboard.calledOnce).to.equal(false)
    wrapper.unmount()
  })

  it('saves visualisation options and restores them when switch between modes', async () => {
    const wrapper = mount(DataView, {
      props: {
        initMode: 'graph',
        initOptions: { test_options: 'graph_options_from_inquiery' }
      },
      global: {
        mocks: { $store },
        stubs: {
          chart: true,
          graph: true,
          pivot: true
        }
      }
    })
    const getOptionsForSaveStub = sinon.stub(wrapper.vm, 'getOptionsForSave')

    expect(
      wrapper.findComponent({ name: 'graph' }).props('initOptions')
    ).to.eql({ test_options: 'graph_options_from_inquiery' })

    getOptionsForSaveStub.returns({ test_options: 'latest_graph_options' })
    const chartBtn = wrapper.findComponent({ ref: 'chartBtn' })
    await chartBtn.trigger('click')

    getOptionsForSaveStub.returns({ test_options: 'chart_settings' })

    const pivotBtn = wrapper.findComponent({ ref: 'pivotBtn' })
    await pivotBtn.trigger('click')

    getOptionsForSaveStub.returns({ test_options: 'pivot_settings' })
    await chartBtn.trigger('click')
    expect(
      wrapper.findComponent({ name: 'chart' }).props('initOptions')
    ).to.eql({ test_options: 'chart_settings' })

    await pivotBtn.trigger('click')
    expect(
      wrapper.findComponent({ name: 'pivot' }).props('initOptions')
    ).to.eql({ test_options: 'pivot_settings' })

    const graphBtn = wrapper.findComponent({ ref: 'graphBtn' })
    await graphBtn.trigger('click')
    expect(
      wrapper.findComponent({ name: 'graph' }).props('initOptions')
    ).to.eql({ test_options: 'latest_graph_options' })
  })

  it('switches visibility of node or edge in graph mode', async () => {
    const wrapper = mount(DataView, {
      global: {
        mocks: { $store },
        provide: {
          tabLayout: { dataView: 'above' }
        }
      }
    })

    // viewNodeOrEdgeBtn is not disaplyed in chart mode
    expect(
      wrapper.findComponent({ ref: 'viewNodeOrEdgeBtn' }).exists()
    ).to.equal(false)

    // Switch to pivot
    const pivotBtn = wrapper.findComponent({ ref: 'pivotBtn' })
    await pivotBtn.trigger('click')

    // viewNodeOrEdgeBtn is not disaplyed in pivot mode
    expect(
      wrapper.findComponent({ ref: 'viewNodeOrEdgeBtn' }).exists()
    ).to.equal(false)

    // Switch to graph
    const graphBtn = wrapper.findComponent({ ref: 'graphBtn' })
    await graphBtn.trigger('click')

    // viewNodeOrEdgeBtn is disaplyed in graph mode
    const viewNodeOrEdgeBtn = wrapper.findComponent({
      ref: 'viewNodeOrEdgeBtn'
    })
    expect(viewNodeOrEdgeBtn.exists()).to.equal(true)

    // by default node viewer is hidden
    expect(wrapper.findComponent({ name: 'value-viewer' }).exists()).to.equal(
      false
    )

    // Click to show node viewer
    await viewNodeOrEdgeBtn.trigger('click')
    expect(wrapper.findComponent({ name: 'value-viewer' }).exists()).to.equal(
      true
    )

    wrapper.unmount()
  })
})
