import { expect } from 'chai'
import sinon from 'sinon'
import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Schema from '@/components/Schema.vue'
import TableDescription from '@/components/TableDescription.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('Schema.vue', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('Renders DB name on initial', () => {
    // mock store state
    const state = {
      dbName: 'fooDB'
    }
    const store = new Vuex.Store({ state })

    // mout the component
    const wrapper = mount(Schema, { store, localVue })

    // check DB name and schema visibility
    expect(wrapper.find('.db-name').text()).to.equal('fooDB')
    expect(wrapper.find('.schema').isVisible()).to.equal(true)
  })

  it('Schema visibility is toggled when click on DB name', async () => {
    // mock store state
    const state = {
      dbName: 'fooDB'
    }
    const store = new Vuex.Store({ state })

    // mout the component
    const wrapper = mount(Schema, { store, localVue })

    // click and check visibility
    await wrapper.find('.db-name').trigger('click')
    expect(wrapper.find('.schema').isVisible()).to.equal(false)
    await wrapper.find('.db-name').trigger('click')
    expect(wrapper.find('.schema').isVisible()).to.equal(true)
  })

  it('Schema filter', async () => {
    // mock store state
    const state = {
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
    const store = new Vuex.Store({ state })

    // mount the component
    const wrapper = mount(Schema, { store, localVue })

    // apply filters and check the list of tables
    await wrapper.find('#schema-filter input').setValue('foo')
    let tables = wrapper.findAllComponents(TableDescription)
    expect(tables).to.have.lengthOf(2)
    expect(tables.at(0).vm.name).to.equal('foo')
    expect(tables.at(1).vm.name).to.equal('foobar')

    await wrapper.find('#schema-filter input').setValue('bar')
    tables = wrapper.findAllComponents(TableDescription)
    expect(tables).to.have.lengthOf(2)
    expect(tables.at(0).vm.name).to.equal('bar')
    expect(tables.at(1).vm.name).to.equal('foobar')

    await wrapper.find('#schema-filter input').setValue('')
    tables = wrapper.findAllComponents(TableDescription)
    expect(tables).to.have.lengthOf(3)
    expect(tables.at(0).vm.name).to.equal('foo')
    expect(tables.at(1).vm.name).to.equal('bar')
    expect(tables.at(2).vm.name).to.equal('foobar')
  })

  it('exports db', async () => {
    const state = {
      dbName: 'fooDB',
      db: {
        export: sinon.stub().resolves()
      }
    }
    const store = new Vuex.Store({ state })
    const wrapper = mount(Schema, { store, localVue })

    await wrapper.findComponent({ name: 'export-icon' }).trigger('click')
    expect(state.db.export.calledOnceWith('fooDB'))
  })
})
