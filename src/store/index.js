import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    schema: null,
    dbFile: null,
    dbName: null,
    tabs: [],
    currentTab: null,
    currentTabId: null,
    untitledLastIndex: 0,
    predefinedQueries: []
  },
  mutations: {
    saveSchema (state, { dbName, schema }) {
      state.dbName = dbName
      state.schema = schema
    },
    saveDbFile (state, file) {
      state.dbFile = file
    },
    addTab (state, tab) {
      // add new tab only if was not already opened
      if (!state.tabs.some(openedTab => openedTab.id === tab.id)) {
        state.tabs.push(tab)
        if (!tab.name) {
          state.untitledLastIndex += 1
        }
      }
    },
    updateTab (state, { index, name, id, query, chart, isUnsaved }) {
      const tab = state.tabs[index]
      const oldId = tab.id

      if (state.currentTabId === oldId) {
        state.currentTabId = id
      }

      tab.id = id
      if (name) { tab.name = name }
      if (query) { tab.query = query }
      if (chart) { tab.chart = chart }
      if (isUnsaved !== undefined) { tab.isUnsaved = isUnsaved }
      delete tab.isPredefined

      Vue.set(state.tabs, index, tab)
    },
    updateTabState (state, { index, isUnsaved }) {
      const tab = state.tabs[index]
      tab.isUnsaved = isUnsaved
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
        state.currentTab = null
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
    updatePredefinedQueries (state, queries) {
      if (Array.isArray(queries)) {
        state.predefinedQueries = queries
      } else {
        state.predefinedQueries = [queries]
      }
    }
  },
  actions: {
  }
})
