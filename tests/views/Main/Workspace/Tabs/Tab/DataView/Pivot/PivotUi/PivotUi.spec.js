import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import PivotUi from '@/views/Main/Workspace/Tabs/Tab/DataView/Pivot/PivotUi'

describe('PivotUi.vue', () => {
  it('returns value when settings changed', async () => {
    const wrapper = mount(PivotUi, {
      propsData: {
        keyNames: ['foo', 'bar']
      }
    })

    // choose columns
    await wrapper.findAll('.sqliteviz-select.cols .multiselect__element > span').at(0)
      .trigger('click')

    expect(wrapper.emitted().update.length).to.equal(1)
    expect(wrapper.emitted().input[0][0].rows).to.eql([])
    expect(wrapper.emitted().input[0][0].cols).to.eql(['foo'])
    expect(wrapper.emitted().input[0][0].colOrder).to.equal('key_a_to_z')
    expect(wrapper.emitted().input[0][0].rowOrder).to.equal('key_a_to_z')
    expect(wrapper.emitted().input[0][0].aggregatorName).to.equal('Count')
    expect(wrapper.emitted().input[0][0].rendererName).to.equal('Table')
    expect(wrapper.emitted().input[0][0].rendererOptions).to.equal(undefined)
    expect(wrapper.emitted().input[0][0].vals).to.eql([])

    // choose rows
    await wrapper.findAll('.sqliteviz-select.rows .multiselect__element > span').at(0)
      .trigger('click')

    expect(wrapper.emitted().update.length).to.equal(2)
    expect(wrapper.emitted().input[1][0].rows).to.eql(['bar'])
    expect(wrapper.emitted().input[1][0].cols).to.eql(['foo'])
    expect(wrapper.emitted().input[1][0].colOrder).to.equal('key_a_to_z')
    expect(wrapper.emitted().input[1][0].rowOrder).to.equal('key_a_to_z')
    expect(wrapper.emitted().input[1][0].aggregatorName).to.equal('Count')
    expect(wrapper.emitted().input[1][0].rendererName).to.equal('Table')
    expect(wrapper.emitted().input[1][0].rendererOptions).to.equal(undefined)
    expect(wrapper.emitted().input[1][0].vals).to.eql([])

    // change column order
    await wrapper.find('.pivot-sort-btn.col').trigger('click')

    expect(wrapper.emitted().update.length).to.equal(3)
    expect(wrapper.emitted().input[2][0].rows).to.eql(['bar'])
    expect(wrapper.emitted().input[2][0].cols).to.eql(['foo'])
    expect(wrapper.emitted().input[2][0].colOrder).to.equal('value_a_to_z')
    expect(wrapper.emitted().input[2][0].rowOrder).to.equal('key_a_to_z')
    expect(wrapper.emitted().input[2][0].aggregatorName).to.equal('Count')
    expect(wrapper.emitted().input[2][0].rendererName).to.equal('Table')
    expect(wrapper.emitted().input[2][0].rendererOptions).to.equal(undefined)
    expect(wrapper.emitted().input[2][0].vals).to.eql([])

    // change row order
    await wrapper.find('.pivot-sort-btn.row').trigger('click')

    expect(wrapper.emitted().update.length).to.equal(4)
    expect(wrapper.emitted().input[3][0].rows).to.eql(['bar'])
    expect(wrapper.emitted().input[3][0].cols).to.eql(['foo'])
    expect(wrapper.emitted().input[3][0].colOrder).to.equal('value_a_to_z')
    expect(wrapper.emitted().input[3][0].rowOrder).to.equal('value_a_to_z')
    expect(wrapper.emitted().input[3][0].aggregatorName).to.equal('Count')
    expect(wrapper.emitted().input[3][0].rendererName).to.equal('Table')
    expect(wrapper.emitted().input[3][0].rendererOptions).to.equal(undefined)
    expect(wrapper.emitted().input[3][0].vals).to.eql([])

    // change aggregator
    await wrapper.findAll('.sqliteviz-select.aggregator .multiselect__element > span').at(12)
      .trigger('click')

    expect(wrapper.emitted().update.length).to.equal(5)
    expect(wrapper.emitted().input[4][0].rows).to.eql(['bar'])
    expect(wrapper.emitted().input[4][0].cols).to.eql(['foo'])
    expect(wrapper.emitted().input[4][0].colOrder).to.equal('value_a_to_z')
    expect(wrapper.emitted().input[4][0].rowOrder).to.equal('value_a_to_z')
    expect(wrapper.emitted().input[4][0].aggregatorName).to.equal('Sum over Sum')
    expect(wrapper.emitted().input[4][0].rendererName).to.equal('Table')
    expect(wrapper.emitted().input[4][0].rendererOptions).to.equal(undefined)
    expect(wrapper.emitted().input[4][0].vals).to.eql(['', ''])

    // set first aggregator argument
    await wrapper
      .findAll('.sqliteviz-select.aggr-arg').at(0)
      .findAll('.multiselect__element > span').at(0)
      .trigger('click')

    expect(wrapper.emitted().update.length).to.equal(6)
    expect(wrapper.emitted().input[5][0].rows).to.eql(['bar'])
    expect(wrapper.emitted().input[5][0].cols).to.eql(['foo'])
    expect(wrapper.emitted().input[5][0].colOrder).to.equal('value_a_to_z')
    expect(wrapper.emitted().input[5][0].rowOrder).to.equal('value_a_to_z')
    expect(wrapper.emitted().input[5][0].aggregatorName).to.equal('Sum over Sum')
    expect(wrapper.emitted().input[5][0].rendererName).to.equal('Table')
    expect(wrapper.emitted().input[5][0].rendererOptions).to.equal(undefined)
    expect(wrapper.emitted().input[5][0].vals).to.eql(['foo', ''])

    // set second aggregator argument
    await wrapper
      .findAll('.sqliteviz-select.aggr-arg').at(1)
      .findAll('.multiselect__element > span').at(1)
      .trigger('click')

    expect(wrapper.emitted().update.length).to.equal(7)
    expect(wrapper.emitted().input[6][0].rows).to.eql(['bar'])
    expect(wrapper.emitted().input[6][0].cols).to.eql(['foo'])
    expect(wrapper.emitted().input[6][0].colOrder).to.equal('value_a_to_z')
    expect(wrapper.emitted().input[6][0].rowOrder).to.equal('value_a_to_z')
    expect(wrapper.emitted().input[6][0].aggregatorName).to.equal('Sum over Sum')
    expect(wrapper.emitted().input[6][0].rendererName).to.equal('Table')
    expect(wrapper.emitted().input[6][0].rendererOptions).to.equal(undefined)
    expect(wrapper.emitted().input[6][0].vals).to.eql(['foo', 'bar'])

    // change renderer
    await wrapper.findAll('.sqliteviz-select.renderer .multiselect__element > span').at(13)
      .trigger('click')

    expect(wrapper.emitted().update.length).to.equal(8)
    expect(wrapper.emitted().input[7][0].rows).to.eql(['bar'])
    expect(wrapper.emitted().input[7][0].cols).to.eql(['foo'])
    expect(wrapper.emitted().input[7][0].colOrder).to.equal('value_a_to_z')
    expect(wrapper.emitted().input[7][0].rowOrder).to.equal('value_a_to_z')
    expect(wrapper.emitted().input[7][0].aggregatorName).to.equal('Sum over Sum')
    expect(wrapper.emitted().input[7][0].rendererName).to.equal('Custom chart')
    expect(wrapper.emitted().input[7][0].rendererOptions.customChartComponent)
      .to.not.equal(undefined)
    expect(wrapper.emitted().input[7][0].vals).to.eql(['foo', 'bar'])

    // change aggregator again
    await wrapper.findAll('.sqliteviz-select.aggregator .multiselect__element > span').at(3)
      .trigger('click')

    expect(wrapper.emitted().update.length).to.equal(9)
    expect(wrapper.emitted().input[8][0].rows).to.eql(['bar'])
    expect(wrapper.emitted().input[8][0].cols).to.eql(['foo'])
    expect(wrapper.emitted().input[8][0].colOrder).to.equal('value_a_to_z')
    expect(wrapper.emitted().input[8][0].rowOrder).to.equal('value_a_to_z')
    expect(wrapper.emitted().input[8][0].aggregatorName).to.equal('Sum')
    expect(wrapper.emitted().input[8][0].rendererName).to.equal('Custom chart')
    expect(wrapper.emitted().input[8][0].rendererOptions.customChartComponent)
      .to.not.equal(undefined)
    expect(wrapper.emitted().input[8][0].vals).to.eql(['foo'])
  })
})
