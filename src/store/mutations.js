export default {
  setDb (state, db) {
    if (state.db) {
      state.db.shutDown()
    }
    state.db = db
  },

  updateTab (state, { tab, newValues }) {
    const { name, id, query, viewType, viewOptions, isSaved } = newValues
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
  },

  deleteTab (state, tab) {
    const index = state.tabs.indexOf(tab)
    // If closing tab is the current opened
    if (tab.id === state.currentTabId) {
      if (index < state.tabs.length - 1) {
        state.currentTabId = state.tabs[index + 1].id
      } else if (index > 0) {
        state.currentTabId = state.tabs[index - 1].id
      } else {
        state.currentTabId = null
        state.untitledLastIndex = 0
      }
      state.currentTab = state.currentTabId
        ? state.tabs.find(tab => tab.id === state.currentTabId)
        : null
    }
    state.tabs.splice(index, 1)
  },
  setCurrentTabId (state, id) {
    try {
      state.currentTabId = id
      state.currentTab = state.tabs.find(tab => tab.id === id)
    } catch (e) {
      console.error('Can\'t open a tab id:' + id)
    }
  },
  updatePredefinedInquiries (state, inquiries) {
    state.predefinedInquiries = Array.isArray(inquiries) ? inquiries : [inquiries]
  },
  setLoadingPredefinedInquiries (state, value) {
    state.loadingPredefinedInquiries = value
  },
  setPredefinedInquiriesLoaded (state, value) {
    state.predefinedInquiriesLoaded = value
  }
}
