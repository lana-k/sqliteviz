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
      dataBase.run("CREATE TABLE test (col1, col2);")

      const data = dataBase.export()
      const buffer = new Blob([data])
      return db.loadDb(buffer)
    })
    .then(schema => {
      expect(schema.length).to.equal(1)
      expect(schema[0][0]).to.equal('test') 
      expect(schema[0][1]).to.equal('CREATE TABLE test (col1, col2)') 
    })
  })
})