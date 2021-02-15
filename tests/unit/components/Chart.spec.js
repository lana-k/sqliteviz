import { expect } from 'chai'
import sinon from 'sinon'
import { mount, shallowMount } from '@vue/test-utils'
import Chart from '@/components/Chart.vue'
import chart  from '@/chart.js'
import * as dereference from 'react-chart-editor/lib/lib/dereference'

describe('Chart.vue', () => {
  afterEach(() => {
    sinon.restore()
  })
  
  it('getChartStateForSave called with proper arguments', () => {
    // mount the component
    const wrapper = shallowMount(Chart)
    const vm = wrapper.vm
    const stub = sinon.stub(chart, 'getChartStateForSave').returns('result')
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
    const sqlResult = {
      columns: ['id', 'name'],
      values: [[1, 'foo']]
    }

    // mount the component
    const wrapper = shallowMount(Chart, {
      propsData: { sqlResult: sqlResult }
    })

    const newSqlResult = {
      columns: ['id', 'name'],
      values: [[2, 'bar']]
    }

    await wrapper.setProps({sqlResult: newSqlResult})
    expect(dereference.default.called).to.equal(true)
  })
})
