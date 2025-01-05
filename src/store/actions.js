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
  },
  async saveInquiry ({ state }, { inquiryTab, newName }) {
    const value = {
      id: inquiryTab.isPredefined ? nanoid() : inquiryTab.id,
      query: inquiryTab.query,
      viewType: inquiryTab.dataView.mode,
      viewOptions: inquiryTab.dataView.getOptionsForSave(),
      name: newName || inquiryTab.name
    }

    // Get inquiries from local storage
    const myInquiries = state.inquiries

    // Set createdAt
    if (newName) {
      value.createdAt = new Date()
    } else {
      var inquiryIndex = myInquiries.findIndex(oldInquiry => oldInquiry.id === inquiryTab.id)
      value.createdAt = myInquiries[inquiryIndex].createdAt
    }

    // Insert in inquiries list
    if (newName) {
      myInquiries.push(value)
    } else {
      myInquiries.splice(inquiryIndex, 1, value)
    }

    return value
  }
}
