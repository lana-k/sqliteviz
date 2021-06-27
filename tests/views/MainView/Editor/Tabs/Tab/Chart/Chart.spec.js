import { expect } from 'chai'
import sinon from 'sinon'
import { mount, shallowMount } from '@vue/test-utils'
import Chart from '@/views/Main/Editor/Tabs/Tab/Chart'
import chartHelper from '@/views/Main/Editor/Tabs/Tab/Chart/chartHelper'
import * as dereference from 'react-chart-editor/lib/lib/dereference'

describe('Chart.vue', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('getChartStateForSave called with proper arguments', () => {
    // mount the component
    const wrapper = shallowMount(Chart)
    const vm = wrapper.vm
    const stub = sinon.stub(chartHelper, 'getChartStateForSave').returns('result')
    const chartData = vm.getChartStateForSave()
    expect(stub.calledOnceWith(vm.state, vm.dataSources)).to.equal(true)
    expect(chartData).to.equal('result')
  })

  it('is not visible when visible is false', () => {
    // mount the component
    const wrapper = shallowMount(Chart, {
      propsData: { visible: false }
    })

    expect(wrapper.find('.chart-container').isVisible()).to.equal(false)
  })

  it('is visible when visible is true', () => {
    // mount the component
    const wrapper = shallowMount(Chart, {
      propsData: { visible: true }
    })

    expect(wrapper.find('.chart-container').isVisible()).to.equal(true)
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
