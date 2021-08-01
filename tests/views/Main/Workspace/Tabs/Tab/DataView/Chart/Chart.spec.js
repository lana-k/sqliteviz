import { expect } from 'chai'
import sinon from 'sinon'
import { mount, shallowMount } from '@vue/test-utils'
import Chart from '@/views/Main/Workspace/Tabs/Tab/DataView/Chart'
import chartHelper from '@/views/Main/Workspace/Tabs/Tab/DataView/Chart/chartHelper'
import * as dereference from 'react-chart-editor/lib/lib/dereference'

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

  it('calls dereference when sqlResult is changed', async () => {
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
})
