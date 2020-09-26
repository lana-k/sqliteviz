import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    schema: null,
    dbFile: null,
    dbName: null,
    worker: new Worker('/js/worker.sql-wasm.js')
  },
  mutations: {
    saveSchema (state, schema) {
      state.schema = schema
    },
    saveDbFile (state, file) {
      state.dbFile = file
    },
    saveDbName (state, name) {
      state.dbName = name
    }
  },
  actions: {
  },
  modules: {
  }
})
