import Tab from '@/lib/tab'

export default {
  async addTab ({ state }, inquiry = {}) {
    // add new tab only if it was not already opened
    if (!state.tabs.some(openedTab => openedTab.id === inquiry.id)) {
      const tab = new Tab(state, JSON.parse(JSON.stringify(inquiry)))
      state.tabs.push(tab)
      if (!tab.name) {
        state.untitledLastIndex += 1
      }
      return tab.id
    }

    return inquiry.id
  }
}
