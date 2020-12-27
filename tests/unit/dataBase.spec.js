/* import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import HelloWorld from '@/components/HelloWorld.vue'

describe('HelloWorld.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallowMount(HelloWorld, {
      propsData: { msg }
    })
    expect(wrapper.text()).to.include(msg)
  })
})
 */
import { expect } from 'chai'
import initSqlJs from 'sql.js'
import db from '@/dataBase.js'

describe('dataBase.js', () => {
  it('creates schema', () => {
    const config = {
      locateFile: filename => `js/sql-wasm.wasm`
    }
    return initSqlJs(config)
    .then(SQL => {
      const dataBase = new SQL.Database()
      dataBase.run('CREATE TABLE test (col1, col2);')

      const data = dataBase.export()
      const buffer = new Blob([data])
      return db.loadDb(buffer)
    })
    .then(({dbName, schema}) => {
      console.log(schema[0].columns)
      expect(schema.length).to.equal(1)
      expect(schema[0].name).to.equal('test') 
      expect(schema[0].columns[0].name).to.equal('col1') 
      expect(schema[0].columns[0].type).to.equal('N/A') 
      expect(schema[0].columns[1].name).to.equal('col2') 
      expect(schema[0].columns[1].type).to.equal('N/A') 
    })
  })
})