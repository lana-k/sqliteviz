import { expect } from 'chai'
import sinon from 'sinon'
import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Schema from '@/components/Schema.vue'
import TableDescription from '@/components/TableDescription.vue'
import fu from '@/fileUtils.js'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('Schema.vue', () => {
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

  it('Change DB', async () => {
    // mock store state and mutations
    const mutations = {
      saveSchema: sinon.stub()
    }

    const state = {
      dbName: 'fooDB',
      schema: [
        {
          name: 'foo',
          columns: [
            { name: 'foo_id', type: 'INTEGER' },
            { name: 'foo_title', type: 'NVARCHAR(24)' }
          ]
        },
        {
          name: 'foo_prices',
          columns: [
            { name: 'foo_id', type: 'INTEGER' },
            { name: 'foo_price', type: 'INTEGER' }
          ]
        }
      ]
    }

    const store = new Vuex.Store({ state, mutations })

    // stub getFileFromUser
    const file = { file: 'hello' }
    sinon.stub(fu, 'getFileFromUser').resolves(file)

    // mock $db.loadDb()
    const newSchema = {
      dbName: 'barDB',
      schema: [
        {
          name: 'bar',
          columns: [
            { name: 'bar_id', type: 'INTEGER' },
            { name: 'bar_title', type: 'NVARCHAR(24)' }
          ]
        },
        {
          name: 'bar_prices',
          columns: [
            { name: 'bar_id', type: 'INTEGER' },
            { name: 'bar_price', type: 'INTEGER' }
          ]
        }
      ]
    }
    const $db = {
      loadDb (file) {
        return Promise.resolve(newSchema)
      }
    }

    // spy on $db.loadDb()
    sinon.spy($db, 'loadDb')

    // mount the component
    const wrapper = mount(Schema, { store, localVue, mocks: { $db } })

    // trigger the event
    await wrapper.find('#db-edit').trigger('click')

    expect(fu.getFileFromUser.calledOnceWith('.db,.sqlite,.sqlite3')).to.equal(true)

    await fu.getFileFromUser.returnValues[0]
    expect($db.loadDb.calledOnceWith(file)).to.equal(true)

    await $db.loadDb.returnValues[0]
    expect(mutations.saveSchema.calledOnceWith(state, newSchema)).to.equal(true)
  })
})
