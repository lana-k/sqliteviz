import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import TableDescription from '@/views/Main/Workspace/Schema/TableDescription'

describe('TableDescription.vue', () => {
  it('Initially the columns are hidden and table name is rendered', () => {
    const wrapper = shallowMount(TableDescription, {
      propsData: {
        name: 'Test table',
        columns: [
          { name: 'id', type: 'number' },
          { name: 'title', type: 'nvarchar(24)' }
        ]
      }
    })
    expect(wrapper.find('.table-name').text()).to.equal('Test table')
    expect(wrapper.find('.columns').isVisible()).to.equal(false)
  })

  it('Columns are visible and correct when click on table name', async () => {
    const wrapper = shallowMount(TableDescription, {
      stubs: ['router-link'],
      propsData: {
        name: 'Test table',
        columns: [
          { name: 'id', type: 'number' },
          { name: 'title', type: 'nvarchar(24)' }
        ]
      }
    })
    await wrapper.find('.table-name').trigger('click')

    expect(wrapper.find('.columns').isVisible()).to.equal(true)
    expect(wrapper.findAll('.column').length).to.equal(2)
    expect(wrapper.findAll('.column').at(0).text()).to.include('id').and.include('number')
    expect(wrapper.findAll('.column').at(1).text()).to.include('title').and.include('nvarchar(24)')
  })
})
