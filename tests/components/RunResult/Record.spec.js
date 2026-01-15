import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import Record from '@/components/RunResult/Record'

describe('Record.vue', () => {
  it('shows record with selected cell', async () => {
    const wrapper = mount(Record, {
      props: {
        dataSet: {
          columns: ['id', 'name'],
          values: {
            id: [1, 2],
            name: ['foo', 'bar']
          }
        },
        rowIndex: 1,
        selectedColumnIndex: 1
      }
    })

    const rows = wrapper.findAll('tbody tr')
    expect(rows).to.have.lengthOf(2)
    expect(rows[0].findAll('th')[0].text()).to.equals('id')
    expect(rows[0].findAll('td')[0].text()).to.equals('2')
    expect(rows[1].findAll('th')[0].text()).to.equals('name')
    expect(rows[1].findAll('td')[0].text()).to.equals('bar')

    const selectedCell = wrapper.find(
      '.sqliteviz-table tbody td[aria-selected="true"]'
    )
    expect(selectedCell.text()).to.equals('bar')
  })

  it('switches to the next or previous row', async () => {
    const wrapper = mount(Record, {
      props: {
        dataSet: {
          columns: ['id', 'name'],
          values: {
            id: [1, 2, 3],
            name: ['foo', 'bar', 'baz']
          }
        },
        rowIndex: 0,
        selectedColumnIndex: 0
      }
    })

    let rows = wrapper.findAll('tbody tr')
    expect(rows).to.have.lengthOf(2)
    expect(rows[0].findAll('td')[0].text()).to.equals('1')
    expect(rows[1].findAll('td')[0].text()).to.equals('foo')
    let selectedCell = wrapper.find(
      '.sqliteviz-table tbody td[aria-selected="true"]'
    )
    expect(selectedCell.text()).to.equals('1')

    await wrapper.find('.next').trigger('click')

    rows = wrapper.findAll('tbody tr')
    expect(rows[0].findAll('td')[0].text()).to.equals('2')
    expect(rows[1].findAll('td')[0].text()).to.equals('bar')
    selectedCell = wrapper.find(
      '.sqliteviz-table tbody td[aria-selected="true"]'
    )
    expect(selectedCell.text()).to.equals('2')

    await wrapper.find('.prev').trigger('click')

    rows = wrapper.findAll('tbody tr')
    expect(rows[0].findAll('td')[0].text()).to.equals('1')
    expect(rows[1].findAll('td')[0].text()).to.equals('foo')
    selectedCell = wrapper.find(
      '.sqliteviz-table tbody td[aria-selected="true"]'
    )
    expect(selectedCell.text()).to.equals('1')

    await wrapper.find('.last').trigger('click')

    rows = wrapper.findAll('tbody tr')
    expect(rows[0].findAll('td')[0].text()).to.equals('3')
    expect(rows[1].findAll('td')[0].text()).to.equals('baz')
    selectedCell = wrapper.find(
      '.sqliteviz-table tbody td[aria-selected="true"]'
    )
    expect(selectedCell.text()).to.equals('3')

    await wrapper.find('.first').trigger('click')

    rows = wrapper.findAll('tbody tr')
    expect(rows[0].findAll('td')[0].text()).to.equals('1')
    expect(rows[1].findAll('td')[0].text()).to.equals('foo')
    selectedCell = wrapper.find(
      '.sqliteviz-table tbody td[aria-selected="true"]'
    )
    expect(selectedCell.text()).to.equals('1')
  })

  it('removes selection when click on selected cell', async () => {
    const wrapper = mount(Record, {
      props: {
        dataSet: {
          columns: ['id', 'name'],
          values: {
            id: [1, 2],
            name: ['foo', 'bar']
          }
        },
        rowIndex: 1,
        selectedColumnIndex: 1
      }
    })

    const selectedCell = wrapper.find(
      '.sqliteviz-table tbody td[aria-selected="true"]'
    )
    await selectedCell.trigger('click')

    const selectedCellAfterClick = wrapper.find(
      '.sqliteviz-table tbody td[aria-selected="true"]'
    )
    expect(selectedCellAfterClick.exists()).to.equals(false)
  })
})
