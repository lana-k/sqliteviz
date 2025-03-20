import { expect } from 'chai'
import sinon from 'sinon'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import actions from '@/store/actions'
import mutations from '@/store/mutations'
import Schema from '@/views/Main/Workspace/Schema'
import TableDescription from '@/views/Main/Workspace/Schema/TableDescription'
import database from '@/lib/database'
import fIo from '@/lib/utils/fileIo'
import csv from '@/lib/csv'
import { nextTick } from 'vue'

describe('Schema.vue', () => {
  let clock

  beforeEach(() => {
    clock = sinon.useFakeTimers()
  })

  afterEach(() => {
    sinon.restore()
  })

  it('Renders DB name on initial', () => {
    // mock store state
    const state = {
      db: {
        dbName: 'fooDB'
      }
    }
    const store = createStore({ state })

    // mout the component
    const wrapper = mount(Schema, {
      global: {
        plugins: [store]
      }
    })

    // check DB name and schema visibility
    expect(wrapper.find('.db-name').text()).to.equal('fooDB')
    expect(wrapper.find('.schema').isVisible()).to.equal(true)
    wrapper.unmount()
  })

  it('Schema visibility is toggled when click on DB name', async () => {
    // mock store state
    const state = {
      db: {
        dbName: 'fooDB'
      }
    }
    const store = createStore({ state })

    // mout the component
    const wrapper = mount(Schema, {
      attachTo: document.body,
      global: {
        plugins: [store]
      }
    })

    // click and check visibility
    await wrapper.find('.db-name').trigger('click')
    expect(wrapper.find('.schema').isVisible()).to.equal(false)
    await wrapper.find('.db-name').trigger('click')
    expect(wrapper.find('.schema').isVisible()).to.equal(true)
    wrapper.unmount()
  })

  it('Schema filter', async () => {
    // mock store state
    const state = {
      db: {
        dbName: 'fooDB',
        schema: [
          {
            name: 'foo',
            columns: [
              { name: 'id', type: 'INTEGER' },
              { name: 'title', type: 'NVARCHAR(24)' }
            ]
          },
          {
            name: 'bar',
            columns: [
              { name: 'id', type: 'INTEGER' },
              { name: 'price', type: 'INTEGER' }
            ]
          },
          {
            name: 'foobar',
            columns: [
              { name: 'id', type: 'INTEGER' },
              { name: 'price', type: 'INTEGER' }
            ]
          }
        ]
      }
    }
    const store = createStore({ state })

    // mount the component
    const wrapper = mount(Schema, {
      global: {
        plugins: [store]
      }
    })

    // apply filters and check the list of tables
    await wrapper.find('#schema-filter input').setValue('foo')
    let tables = wrapper.findAllComponents(TableDescription)
    expect(tables).to.have.lengthOf(2)
    expect(tables[0].vm.name).to.equal('foo')
    expect(tables[1].vm.name).to.equal('foobar')

    await wrapper.find('#schema-filter input').setValue('bar')
    tables = wrapper.findAllComponents(TableDescription)
    expect(tables).to.have.lengthOf(2)
    expect(tables[0].vm.name).to.equal('bar')
    expect(tables[1].vm.name).to.equal('foobar')

    await wrapper.find('#schema-filter input').setValue('')
    tables = wrapper.findAllComponents(TableDescription)
    expect(tables).to.have.lengthOf(3)
    expect(tables[0].vm.name).to.equal('foo')
    expect(tables[1].vm.name).to.equal('bar')
    expect(tables[2].vm.name).to.equal('foobar')
    wrapper.unmount()
  })

  it('exports db', async () => {
    const state = {
      db: {
        dbName: 'fooDB',
        export: sinon.stub().resolves()
      }
    }
    const store = createStore({ state })
    const wrapper = mount(Schema, {
      global: {
        plugins: [store]
      }
    })

    await wrapper
      .findComponent({ name: 'export-icon' })
      .find('svg')
      .trigger('click')
    expect(state.db.export.calledOnceWith('fooDB'))
    wrapper.unmount()
  })

  it('adds table', async () => {
    const file = new File([], 'test.csv')
    sinon.stub(fIo, 'getFileFromUser').resolves(file)

    sinon.stub(csv, 'parse').resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: {
          col1: [1],
          col2: ['foo']
        }
      },
      hasErrors: false,
      messages: []
    })

    const state = {
      db: database.getNewDatabase(),
      tabs: []
    }
    state.db.dbName = 'db'
    state.db.execute('CREATE TABLE foo(id)')
    state.db.refreshSchema()
    sinon.spy(state.db, 'refreshSchema')

    const store = createStore({ state, actions, mutations })
    const wrapper = mount(Schema, {
      attachTo: document.body,
      global: {
        plugins: [store],
        stubs: { teleport: true, transition: false }
      }
    })
    sinon.spy(wrapper.vm.$refs.addCsvJson, 'preview')
    sinon.spy(wrapper.vm, 'addCsvJson')
    sinon.spy(wrapper.vm.$refs.addCsvJson, 'loadToDb')

    await wrapper
      .findComponent({ name: 'add-table-icon' })
      .find('svg')
      .trigger('click')
    await wrapper.vm.$refs.addCsvJson.preview.returnValues[0]
    await wrapper.vm.addCsvJson.returnValues[0]
    await nextTick()
    await nextTick()
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(true)
    expect(wrapper.find('.dialog.vfm .dialog-header').text()).to.contain(
      'CSV import'
    )
    await wrapper.find('#import-start').trigger('click')
    await wrapper.vm.$refs.addCsvJson.loadToDb.returnValues[0]
    await wrapper.find('#import-finish').trigger('click')
    await clock.tick(100)
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(false)
    await state.db.refreshSchema.returnValues[0]

    expect(wrapper.vm.$store.state.db.schema).to.eql([
      { name: 'foo', columns: [{ name: 'id', type: 'N/A' }] },
      {
        name: 'test',
        columns: [
          { name: 'col1', type: 'REAL' },
          { name: 'col2', type: 'TEXT' }
        ]
      }
    ])

    const res = await wrapper.vm.$store.state.db.execute('select * from test')
    expect(res.values).to.eql({
      col1: [1],
      col2: ['foo']
    })
    wrapper.unmount()
  })
})
