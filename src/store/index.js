import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    schema: null,
    dbFile: null,
    dbName: null,
    worker: new Worker('js/worker.sql-wasm.js'),
    tabs: [],
    currentTab: null,
    currentTabId: null,
    untitledLastIndex: 0
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
    },
    addTab (state, tab) {
      state.tabs.push(tab)
    },
    updateTabName (state, { index, newName }) {
      const tab = state.tabs[index]
      tab.name = newName
      Vue.set(state.tabs, index, tab)
    },
    updateTabState (state, { index, newValue }) {
      console.log(index, newValue)
      const tab = state.tabs[index]
      tab.isUnsaved = newValue
      Vue.set(state.tabs, index, tab)
    },
    deleteTab (state, index) {
      if (state.tabs[index].id !== state.currentTabId) {
      } else if (index < state.tabs.length - 1) {
        state.currentTabId = state.tabs[index + 1].id
      } else if (index > 0) {
        state.currentTabId = state.tabs[index - 1].id
      } else {
        state.currentTabId = null
        state.untitledLastIndex = 0
      }
      state.tabs.splice(index, 1)
    },
    setCurrentTabId (state, id) {
      state.currentTabId = id
    },
    setCurrentTab (state, tab) {
      state.currentTab = tab
    },
    updateUntitledLastIndex (state) {
      state.untitledLastIndex += 1
    }
  },
  actions: {
  },
  modules: {
  }
})
