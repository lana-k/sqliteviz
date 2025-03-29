import { expect } from 'chai'
import sinon from 'sinon'
import { mount } from '@vue/test-utils'
import Chart from '@/views/Main/Workspace/Tabs/Tab/DataView/Chart/index.vue'
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
    // mount the component
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
    // mount the component
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

    // mount the component
    const wrapper = mount(Chart, {
      appendTo: document.body,
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
    await nextTick()
    await nextTick()

    expect(wrapper.find('svg.main-svg .overplot text').text()).to.equal('80')
    const newDataSources = {
      name: ['Gryffindor'],
      points: [100]
    }

    await wrapper.setProps({ dataSources: newDataSources })

    await nextTick()
    await nextTick()
    await nextTick()
    await nextTick()
    await nextTick()
    await nextTick()
    expect(dereference.default.called).to.equal(true)
    expect(wrapper.find('svg.main-svg .overplot text').text()).to.equal('100')
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
})
