import { expect } from 'chai'
import sinon from 'sinon'
import { mount, flushPromises } from '@vue/test-utils'
import Chart from '@/views/MainView/Workspace/Tabs/Tab/DataView/Chart/index.vue'
import chartHelper from '@/lib/chartHelper'
import * as dereference from 'react-chart-editor/lib/lib/dereference'
import fIo from '@/lib/utils/fileIo'
import { nextTick } from 'vue'

describe('Chart.vue', () => {
  const $store = { state: { isWorkspaceVisible: true } }

  afterEach(() => {
    sinon.restore()
  })

  it('getOptionsForSave called with proper arguments', () => {
    const wrapper = mount(Chart, {
      global: {
        mocks: { $store }
      }
    })
    const vm = wrapper.vm
    const stub = sinon.stub(chartHelper, 'getOptionsForSave').returns('result')
    const chartData = vm.getOptionsForSave()
    expect(stub.calledOnceWith(vm.state, vm.dataSources)).to.equal(true)
    expect(chartData).to.equal('result')
    wrapper.unmount()
  })

  it('emits update when plotly updates', async () => {
    const wrapper = mount(Chart, {
      global: {
        mocks: { $store }
      }
    })
    wrapper.findComponent({ ref: 'plotlyEditor' }).vm.$emit('update')
    expect(wrapper.emitted('update')).to.have.lengthOf(1)
    wrapper.unmount()
  })

  it('calls dereference and updates chart when dataSources is changed', async () => {
    sinon.spy(dereference, 'default')
    const dataSources = {
      name: ['Gryffindor'],
      points: [80]
    }

    const wrapper = mount(Chart, {
      props: {
        dataSources,
        initOptions: {
          data: [
            {
              type: 'bar',
              mode: 'markers',
              x: null,
              xsrc: 'name',
              meta: {
                columnNames: {
                  x: 'name',
                  y: 'points',
                  text: 'points'
                }
              },
              orientation: 'v',
              y: null,
              ysrc: 'points',
              text: null,
              textsrc: 'points'
            }
          ],
          layout: {},
          frames: []
        }
      },
      global: {
        mocks: { $store }
      }
    })
    await flushPromises()

    expect(wrapper.find('svg.main-svg .overplot text').text()).to.equal('80')
    const newDataSources = {
      name: ['Gryffindor'],
      points: [100]
    }

    await wrapper.setProps({ dataSources: newDataSources })
    await flushPromises()
    expect(dereference.default.called).to.equal(true)
    expect(wrapper.find('svg.main-svg .overplot text').text()).to.equal('100')
  })

  it('the plot resizes when the container resizes', async () => {
    const wrapper = mount(Chart, {
      attachTo: document.body,
      props: {
        dataSources: null
      },
      global: {
        mocks: { $store }
      }
    })

    // don't call flushPromises here, otherwize resize observer will be call to often
    // which causes ResizeObserver loop completed with undelivered notifications.
    await nextTick()

    const container =
      wrapper.find('.chart-container').wrapperElement.parentElement
    const plot = wrapper.find('.svg-container').wrapperElement

    const initialContainerWidth = container.scrollWidth
    const initialContainerHeight = container.scrollHeight

    const initialPlotWidth = plot.scrollWidth
    const initialPlotHeight = plot.scrollHeight

    const newContainerWidth = initialContainerWidth * 2 || 1000
    const newContainerHeight = initialContainerHeight * 2 || 2000

    container.style.width = `${newContainerWidth}px`
    container.style.height = `${newContainerHeight}px`

    await flushPromises()

    expect(plot.scrollWidth).not.to.equal(initialPlotWidth)
    expect(plot.scrollHeight).not.to.equal(initialPlotHeight)

    wrapper.unmount()
  })

  it("doesn't calls dereference when dataSources is null", async () => {
    sinon.stub(dereference, 'default')
    const dataSources = {
      id: [1],
      name: ['foo']
    }

    // mount the component
    const wrapper = mount(Chart, {
      props: { dataSources },
      global: {
        mocks: { $store }
      }
    })

    await wrapper.setProps({ dataSources: null })
    expect(dereference.default.calledOnce).to.equal(true)
    wrapper.unmount()
  })

  it('saveAsPng', async () => {
    sinon.spy(fIo, 'downloadFromUrl')
    const dataSources = {
      id: [1],
      name: ['foo']
    }

    const wrapper = mount(Chart, {
      props: { dataSources },
      global: {
        mocks: { $store }
      }
    })
    sinon.spy(wrapper.vm, 'prepareCopy')

    await nextTick() // chart is rendered
    await wrapper.vm.saveAsPng()

    const url = await wrapper.vm.prepareCopy.returnValues[0]
    expect(wrapper.emitted().loadingImageCompleted.length).to.equal(1)
    expect(fIo.downloadFromUrl.calledOnceWith(url, 'chart'))
    wrapper.unmount()
  })

  it('dataSources are passed correctly', async () => {
    const dataSources = {
      name: ['Gryffindor'],
      points: [80]
    }

    const wrapper = mount(Chart, {
      attachTo: document.body,
      props: {
        dataSources,
        showViewSettings: true
      },
      global: {
        mocks: { $store }
      }
    })
    await flushPromises()
    await wrapper.find('button.js-add-button').wrapperElement.click()

    await flushPromises()

    await wrapper
      .find('.field .dropdown-container .Select__indicator')
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )

    expect(wrapper.find('.Select__menu').text()).to.contain('name' + 'points')
    wrapper.unmount()
  })

  it('hides and shows controls depending on showViewSettings and resizes the plot', async () => {
    const wrapper = mount(Chart, {
      attachTo: document.body,
      props: {
        dataSources: null,
        showViewSettings: false
      },
      global: {
        mocks: { $store }
      }
    })

    // don't call flushPromises here, otherwize resize observer will be call to often
    // which causes ResizeObserver loop completed with undelivered notifications.
    await nextTick()

    const plot = wrapper.find('.svg-container').wrapperElement
    await flushPromises()
    const initialPlotWidth = plot.scrollWidth
    const initialPlotHeight = plot.scrollHeight

    expect(wrapper.find('.plotly_editor .editor_controls').exists()).to.equal(
      false
    )

    await wrapper.setProps({ showViewSettings: true })

    await flushPromises()

    expect(plot.scrollWidth).not.to.equal(initialPlotWidth)
    expect(plot.scrollHeight).to.equal(initialPlotHeight)
    expect(wrapper.find('.plotly_editor .editor_controls').exists()).to.equal(
      true
    )
    wrapper.unmount()
  })
})
