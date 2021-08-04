import { nanoid } from 'nanoid'

export default {
  async addTab ({ state }, data) {
    const tab = data ? JSON.parse(JSON.stringify(data)) : {}
    // If no data then create a new blank one...
    // No data.id means to create new tab, but not blank,
    // e.g. with 'select * from csv_import' inquiry after csv import
    if (!data || !data.id) {
      tab.id = nanoid()
      tab.name = null
      tab.tempName = state.untitledLastIndex
        ? `Untitled ${state.untitledLastIndex}`
        : 'Untitled'
      tab.viewType = 'chart'
      tab.viewOptions = undefined
      tab.isSaved = false
    } else {
      tab.isSaved = true
    }

    // add new tab only if was not already opened
    if (!state.tabs.some(openedTab => openedTab.id === tab.id)) {
      state.tabs.push(tab)
      if (!tab.name) {
        state.untitledLastIndex += 1
      }
    }

    return tab.id
  }
}
