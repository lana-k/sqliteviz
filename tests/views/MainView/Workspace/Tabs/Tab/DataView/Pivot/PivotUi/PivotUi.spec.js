import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import PivotUi from '@/views/MainView/Workspace/Tabs/Tab/DataView/Pivot/PivotUi'

describe('PivotUi.vue', () => {
  it('returns value when settings changed', async () => {
    const wrapper = mount(PivotUi, {
      props: {
        keyNames: ['foo', 'bar'],
        'onUpdate:modelValue': e => wrapper.setProps({ modelValue: e })
      }
    })

    // choose columns
    await wrapper
      .findAll('.sqliteviz-select.cols .multiselect__element > span')[0]
      .trigger('click')

    expect(wrapper.emitted().update.length).to.equal(1)

    let value = wrapper.props('modelValue')
    expect(value.rows).to.eql([])
    expect(value.cols).to.eql(['foo'])
    expect(value.colOrder).to.equal('key_a_to_z')
    expect(value.rowOrder).to.equal('key_a_to_z')
    expect(value.aggregatorName).to.equal('Count')
    expect(value.rendererName).to.equal('Table')
    expect(value.rendererOptions).to.equal(undefined)
    expect(value.vals).to.eql([])

    // choose rows
    await wrapper
      .findAll('.sqliteviz-select.rows .multiselect__element > span')[0]
      .trigger('click')

    expect(wrapper.emitted().update.length).to.equal(2)
    value = wrapper.props('modelValue')
    expect(value.rows).to.eql(['bar'])
    expect(value.cols).to.eql(['foo'])
    expect(value.colOrder).to.equal('key_a_to_z')
    expect(value.rowOrder).to.equal('key_a_to_z')
    expect(value.aggregatorName).to.equal('Count')
    expect(value.rendererName).to.equal('Table')
    expect(value.rendererOptions).to.equal(undefined)
    expect(value.vals).to.eql([])

    // change column order
    await wrapper.find('.pivot-sort-btn.col').trigger('click')

    expect(wrapper.emitted().update.length).to.equal(3)
    value = wrapper.props('modelValue')
    expect(value.rows).to.eql(['bar'])
    expect(value.cols).to.eql(['foo'])
    expect(value.colOrder).to.equal('value_a_to_z')
    expect(value.rowOrder).to.equal('key_a_to_z')
    expect(value.aggregatorName).to.equal('Count')
    expect(value.rendererName).to.equal('Table')
    expect(value.rendererOptions).to.equal(undefined)
    expect(value.vals).to.eql([])

    // change row order
    await wrapper.find('.pivot-sort-btn.row').trigger('click')

    expect(wrapper.emitted().update.length).to.equal(4)
    value = wrapper.props('modelValue')
    expect(value.rows).to.eql(['bar'])
    expect(value.cols).to.eql(['foo'])
    expect(value.colOrder).to.equal('value_a_to_z')
    expect(value.rowOrder).to.equal('value_a_to_z')
    expect(value.aggregatorName).to.equal('Count')
    expect(value.rendererName).to.equal('Table')
    expect(value.rendererOptions).to.equal(undefined)
    expect(value.vals).to.eql([])

    // change aggregator
    await wrapper
      .findAll('.sqliteviz-select.aggregator .multiselect__element > span')[12]
      .trigger('click')

    expect(wrapper.emitted().update.length).to.equal(5)
    value = wrapper.props('modelValue')
    expect(value.rows).to.eql(['bar'])
    expect(value.cols).to.eql(['foo'])
    expect(value.colOrder).to.equal('value_a_to_z')
    expect(value.rowOrder).to.equal('value_a_to_z')
    expect(value.aggregatorName).to.equal('Sum over Sum')
    expect(value.rendererName).to.equal('Table')
    expect(value.rendererOptions).to.equal(undefined)
    expect(value.vals).to.eql(['', ''])

    // set first aggregator argument
    await wrapper
      .findAll('.sqliteviz-select.aggr-arg')[0]
      .findAll('.multiselect__element > span')[0]
      .trigger('click')

    expect(wrapper.emitted().update.length).to.equal(6)
    value = wrapper.props('modelValue')
    expect(value.rows).to.eql(['bar'])
    expect(value.cols).to.eql(['foo'])
    expect(value.colOrder).to.equal('value_a_to_z')
    expect(value.rowOrder).to.equal('value_a_to_z')
    expect(value.aggregatorName).to.equal('Sum over Sum')
    expect(value.rendererName).to.equal('Table')
    expect(value.rendererOptions).to.equal(undefined)
    expect(value.vals).to.eql(['foo', ''])

    // set second aggregator argument
    await wrapper
      .findAll('.sqliteviz-select.aggr-arg')[1]
      .findAll('.multiselect__element > span')[1]
      .trigger('click')

    expect(wrapper.emitted().update.length).to.equal(7)
    value = wrapper.props('modelValue')
    expect(value.rows).to.eql(['bar'])
    expect(value.cols).to.eql(['foo'])
    expect(value.colOrder).to.equal('value_a_to_z')
    expect(value.rowOrder).to.equal('value_a_to_z')
    expect(value.aggregatorName).to.equal('Sum over Sum')
    expect(value.rendererName).to.equal('Table')
    expect(value.rendererOptions).to.equal(undefined)
    expect(value.vals).to.eql(['foo', 'bar'])

    // change renderer
    await wrapper
      .findAll('.sqliteviz-select.renderer .multiselect__element > span')[13]
      .trigger('click')

    expect(wrapper.emitted().update.length).to.equal(8)
    value = wrapper.props('modelValue')
    expect(value.rows).to.eql(['bar'])
    expect(value.cols).to.eql(['foo'])
    expect(value.colOrder).to.equal('value_a_to_z')
    expect(value.rowOrder).to.equal('value_a_to_z')
    expect(value.aggregatorName).to.equal('Sum over Sum')
    expect(value.rendererName).to.equal('Custom chart')
    expect(value.vals).to.eql(['foo', 'bar'])

    // change aggregator again
    await wrapper
      .findAll('.sqliteviz-select.aggregator .multiselect__element > span')[3]
      .trigger('click')

    expect(wrapper.emitted().update.length).to.equal(9)
    value = wrapper.props('modelValue')
    expect(value.rows).to.eql(['bar'])
    expect(value.cols).to.eql(['foo'])
    expect(value.colOrder).to.equal('value_a_to_z')
    expect(value.rowOrder).to.equal('value_a_to_z')
    expect(value.aggregatorName).to.equal('Sum')
    expect(value.rendererName).to.equal('Custom chart')
    expect(value.vals).to.eql(['foo'])
  })
})
