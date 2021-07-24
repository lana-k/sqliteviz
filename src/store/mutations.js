import Vue from 'vue'

export default {
  setDb (state, db) {
    if (state.db) {
      state.db.shutDown()
    }
    state.db = db
  },

  updateTab (state, { index, name, id, query, viewType, viewOptions, isSaved }) {
    const tab = state.tabs[index]
    const oldId = tab.id

    if (id && state.currentTabId === oldId) {
      state.currentTabId = id
    }

    if (id) { tab.id = id }
    if (name) { tab.name = name }
    if (query) { tab.query = query }
    if (viewType) { tab.viewType = viewType }
    if (viewOptions) { tab.viewOptions = viewOptions }
    if (isSaved !== undefined) { tab.isSaved = isSaved }
    if (isSaved) {
      // Saved inquiry is not predefined
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
  updatePredefinedInquiries (state, inquiries) {
    state.predefinedInquiries = Array.isArray(inquiries) ? inquiries : [inquiries]
  }
}
