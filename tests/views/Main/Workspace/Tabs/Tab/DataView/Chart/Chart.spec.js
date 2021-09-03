import { expect } from 'chai'
import sinon from 'sinon'
import { mount, shallowMount } from '@vue/test-utils'
import Chart from '@/views/Main/Workspace/Tabs/Tab/DataView/Chart'
import chartHelper from '@/lib/chartHelper'
import * as dereference from 'react-chart-editor/lib/lib/dereference'
import fIo from '@/lib/utils/fileIo'

describe('Chart.vue', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('getOptionsForSave called with proper arguments', () => {
    // mount the component
    const wrapper = shallowMount(Chart)
    const vm = wrapper.vm
    const stub = sinon.stub(chartHelper, 'getOptionsForSave').returns('result')
    const chartData = vm.getOptionsForSave()
    expect(stub.calledOnceWith(vm.state, vm.dataSources)).to.equal(true)
    expect(chartData).to.equal('result')
  })

  it('emits update when plotly updates', async () => {
    // mount the component
    const wrapper = mount(Chart)
    wrapper.findComponent({ ref: 'plotlyEditor' }).vm.$emit('onUpdate')
    expect(wrapper.emitted('update')).to.have.lengthOf(1)
  })

  it('calls dereference when dataSources is changed', async () => {
    sinon.stub(dereference, 'default')
    const dataSources = {
      id: [1],
      name: ['foo']
    }

    // mount the component
    const wrapper = shallowMount(Chart, {
      propsData: { dataSources }
    })

    const newDataSources = {
      id: [2],
      name: ['bar']
    }

    await wrapper.setProps({ dataSources: newDataSources })
    expect(dereference.default.called).to.equal(true)
  })

  it("doesn't calls dereference when dataSources is null", async () => {
    sinon.stub(dereference, 'default')
    const dataSources = {
      id: [1],
      name: ['foo']
    }

    // mount the component
    const wrapper = shallowMount(Chart, {
      propsData: { dataSources }
    })

    await wrapper.setProps({ dataSources: null })
    expect(dereference.default.called).to.equal(false)
  })

  it('saveAsPng', async () => {
    sinon.spy(fIo, 'downloadFromUrl')
    const dataSources = {
      id: [1],
      name: ['foo']
    }

    const wrapper = mount(Chart, {
      propsData: { dataSources }
    })
    sinon.spy(wrapper.vm, 'prepareCopy')

    await wrapper.vm.$nextTick() // chart is rendered
    await wrapper.vm.saveAsPng()

    const url = await wrapper.vm.prepareCopy.returnValues[0]
    expect(wrapper.emitted().loadingImageCompleted.length).to.equal(1)
    expect(fIo.downloadFromUrl.calledOnceWith(url, 'chart'))
  })
})
