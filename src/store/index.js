import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const state = {
  schema: null,
  dbFile: null,
  dbName: null,
  tabs: [],
  currentTab: null,
  currentTabId: null,
  untitledLastIndex: 0,
  predefinedQueries: []
}

export const mutations = {
  saveSchema (state, { dbName, schema }) {
    state.dbName = dbName
    state.schema = schema
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

    if (id && state.currentTabId === oldId) {
      state.currentTabId = id
    }

    if (id) { tab.id = id }
    if (name) { tab.name = name }
    if (query) { tab.query = query }
    if (chart) { tab.chart = chart }
    if (isUnsaved !== undefined) { tab.isUnsaved = isUnsaved }
    if (!isUnsaved) {
      // Saved query is not predefined
      delete tab.isPredefined
    }

    Vue.set(state.tabs, index, tab)
  },
  deleteTab (state, index) {
    // If closing tab is the current opened
    if (state.tabs[index].id === state.currentTabId) {
      if (index < state.tabs.length - 1) {
        state.currentTabId = state.tabs[index + 1].id
      } else if (index > 0) {
        state.currentTabId = state.tabs[index - 1].id
      } else {
        state.currentTabId = null
        state.currentTab = null
        state.untitledLastIndex = 0
      }
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
}

export default new Vuex.Store({
  state,
  mutations
})
