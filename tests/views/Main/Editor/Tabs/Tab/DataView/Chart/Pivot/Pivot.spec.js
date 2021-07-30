import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import Pivot from '@/views/Main/Editor/Tabs/Tab/DataView/Pivot'
import $ from 'jquery'

describe('Pivot.vue', () => {
  it('renders pivot table', () => {
    const wrapper = mount(Pivot, {
      propsData: {
        dataSources: {
          item: ['foo', 'bar', 'bar', 'bar'],
          year: [2021, 2021, 2020, 2020]
        },
        initOptions: {
          rows: ['item'],
          cols: ['year'],
          colOrder: 'key_a_to_z',
          rowOrder: 'key_a_to_z',
          aggregatorName: 'Count',
          vals: [],
          rendererName: 'Table'
        }
      }
    })
    const colLabels = wrapper.findAll('.pivot-output thead th.pvtColLabel')
    expect(colLabels.at(0).text()).to.equal('2020')
    expect(colLabels.at(1).text()).to.equal('2021')
    const rows = wrapper.findAll('.pivot-output tbody tr')
    // row0: bar - 2 - 1
    expect(rows.at(0).find('th').text()).to.equal('bar')
    expect(rows.at(0).find('td.col0').text()).to.equal('2')
    expect(rows.at(0).find('td.col1').text()).to.equal('1')
    expect(rows.at(0).find('td.rowTotal').text()).to.equal('3')

    // row1: foo -  - 2
    expect(rows.at(1).find('th').text()).to.equal('foo')
    expect(rows.at(1).find('td.col0').text()).to.equal('')
    expect(rows.at(1).find('td.col1').text()).to.equal('1')
    expect(rows.at(1).find('td.rowTotal').text()).to.equal('1')
  })

  it('updates when dataSource changes', async () => {
    const wrapper = mount(Pivot, {
      propsData: {
        dataSources: {
          item: ['foo', 'bar', 'bar', 'bar'],
          year: [2021, 2021, 2020, 2020]
        },
        initOptions: {
          rows: ['item'],
          cols: ['year'],
          colOrder: 'key_a_to_z',
          rowOrder: 'key_a_to_z',
          aggregatorName: 'Count',
          vals: [],
          rendererName: 'Table'
        }
      }
    })

    await wrapper.setProps({
      dataSources: {
        item: ['foo', 'bar', 'bar', 'bar', 'foo', 'baz'],
        year: [2021, 2021, 2020, 2020, 2021, 2020]
      }
    })

    const colLabels = wrapper.findAll('.pivot-output thead th.pvtColLabel')
    expect(colLabels.at(0).text()).to.equal('2020')
    expect(colLabels.at(1).text()).to.equal('2021')
    const rows = wrapper.findAll('.pivot-output tbody tr')
    // row0: bar - 2 - 1
    expect(rows.at(0).find('th').text()).to.equal('bar')
    expect(rows.at(0).find('td.col0').text()).to.equal('2')
    expect(rows.at(0).find('td.col1').text()).to.equal('1')
    expect(rows.at(0).find('td.rowTotal').text()).to.equal('3')

    // row1: baz - 1 -
    expect(rows.at(1).find('th').text()).to.equal('baz')
    expect(rows.at(1).find('td.col0').text()).to.equal('1')
    expect(rows.at(1).find('td.col1').text()).to.equal('')
    expect(rows.at(1).find('td.rowTotal').text()).to.equal('1')

    // row2: foo -  - 2
    expect(rows.at(2).find('th').text()).to.equal('foo')
    expect(rows.at(2).find('td.col0').text()).to.equal('')
    expect(rows.at(2).find('td.col1').text()).to.equal('2')
    expect(rows.at(2).find('td.rowTotal').text()).to.equal('2')
  })

  it('updates when pivot settings changes', async () => {
    const wrapper = mount(Pivot, {
      propsData: {
        dataSources: {
          item: ['foo', 'bar', 'bar', 'bar'],
          year: [2021, 2021, 2020, 2020]
        },
        initOptions: {
          rows: ['item'],
          cols: ['year'],
          colOrder: 'key_a_to_z',
          rowOrder: 'key_a_to_z',
          aggregatorName: 'Count',
          vals: [],
          rendererName: 'Table'
        }
      }
    })

    await wrapper.findComponent({ name: 'pivotUi' }).vm.$emit('input', {
      rows: ['year'],
      cols: ['item'],
      colOrder: 'key_a_to_z',
      rowOrder: 'key_a_to_z',
      aggregator: $.pivotUtilities.aggregators.Count(),
      aggregatorName: 'Count',
      renderer: $.pivotUtilities.renderers.Table,
      rendererName: 'Table',
      rendererOptions: undefined,
      vals: []
    })

    const colLabels = wrapper.findAll('.pivot-output thead th.pvtColLabel')
    expect(colLabels.at(0).text()).to.equal('bar')
    expect(colLabels.at(1).text()).to.equal('foo')
    const rows = wrapper.findAll('.pivot-output tbody tr')
    // row0: 2020 - 2 -
    expect(rows.at(0).find('th').text()).to.equal('2020')
    expect(rows.at(0).find('td.col0').text()).to.equal('2')
    expect(rows.at(0).find('td.col1').text()).to.equal('')
    expect(rows.at(0).find('td.rowTotal').text()).to.equal('2')

    // row1: 2021 - 1 - 1
    expect(rows.at(1).find('th').text()).to.equal('2021')
    expect(rows.at(1).find('td.col0').text()).to.equal('1')
    expect(rows.at(1).find('td.col1').text()).to.equal('1')
    expect(rows.at(1).find('td.rowTotal').text()).to.equal('2')
  })

  it('returns options for save', async () => {
    const wrapper = mount(Pivot, {
      propsData: {
        dataSources: {
          item: ['foo', 'bar', 'bar', 'bar'],
          year: [2021, 2021, 2020, 2020]
        },
        initOptions: {
          rows: ['item'],
          cols: ['year'],
          colOrder: 'key_a_to_z',
          rowOrder: 'key_a_to_z',
          aggregatorName: 'Count',
          vals: [],
          rendererName: 'Table'
        }
      }
    })

    await wrapper.findComponent({ name: 'pivotUi' }).vm.$emit('input', {
      rows: ['year'],
      cols: ['item'],
      colOrder: 'value_a_to_z',
      rowOrder: 'value_z_to_a',
      aggregator: $.pivotUtilities.aggregators.Count(),
      aggregatorName: 'Count',
      renderer: $.pivotUtilities.renderers.Table,
      rendererName: 'Table',
      rendererOptions: undefined,
      vals: []
    })

    let optionsForSave = wrapper.vm.getOptionsForSave()

    expect(optionsForSave.rows).to.eql(['year'])
    expect(optionsForSave.cols).to.eql(['item'])
    expect(optionsForSave.colOrder).to.equal('value_a_to_z')
    expect(optionsForSave.rowOrder).to.equal('value_z_to_a')
    expect(optionsForSave.aggregatorName).to.equal('Count')
    expect(optionsForSave.rendererName).to.equal('Table')
    expect(optionsForSave.rendererOptions).to.equal(undefined)
    expect(optionsForSave.vals).to.eql([])

    await wrapper.findComponent({ name: 'pivotUi' }).vm.$emit('input', {
      rows: ['item'],
      cols: ['year'],
      colOrder: 'value_a_to_z',
      rowOrder: 'value_z_to_a',
      aggregator: $.pivotUtilities.aggregators.Count(),
      aggregatorName: 'Count',
      renderer: $.pivotUtilities.renderers['Custom chart'],
      rendererName: 'Custom chart',
      rendererOptions: {
        customChartComponent: {
          getOptionsForSave () {
            return { here_are: 'custom chart settings' }
          }
        }
      },
      vals: []
    })

    optionsForSave = wrapper.vm.getOptionsForSave()
    expect(optionsForSave.rows).to.eql(['item'])
    expect(optionsForSave.cols).to.eql(['year'])
    expect(optionsForSave.colOrder).to.equal('value_a_to_z')
    expect(optionsForSave.rowOrder).to.equal('value_z_to_a')
    expect(optionsForSave.aggregatorName).to.equal('Count')
    expect(optionsForSave.rendererName).to.equal('Custom chart')
    expect(optionsForSave.rendererOptions).to.eql({
      customChartOptions: { here_are: 'custom chart settings' }
    })
    expect(optionsForSave.vals).to.eql([])
  })
})
