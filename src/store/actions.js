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
  },
  addInquiry ({ state }, newInquiry) {
    state.inquiries.push(newInquiry)
  },
  deleteInquiries ({ state, commit }, inquiryIdSet) {
    state.inquiries = state.inquiries.filter(
      inquiry => !inquiryIdSet.has(inquiry.id)
    )

     // Close deleted inquiries if it was opened
     const tabs = state.tabs
     let i = tabs.length - 1
     while (i > -1) {
       if (inquiryIdSet.has(tabs[i].id)) {
         commit('deleteTab', tabs[i])
       }
       i--
     }
  },
  renameInquiry ({ state, commit }, {inquiryId, newName}) {
    const renamingInquiry = state.inquiries
    .find(inquiry => inquiry.id === inquiryId)

    renamingInquiry.name = newName

    // update tab, if renamed inquiry is opened
    const tab = state.tabs.find(tab => tab.id === renamingInquiry.id)
    if (tab) {
      commit('updateTab', {
        tab,
        newValues: {
          name: newName
        }
      })
    }
  }
}
