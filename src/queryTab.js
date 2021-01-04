import { nanoid } from 'nanoid'
import store from '@/store'

export default {
  newBlankTab () {
    return {
      id: nanoid(),
      name: null,
      tempName: store.state.untitledLastIndex
        ? `Untitled ${store.state.untitledLastIndex}`
        : 'Untitled',
      isUnsaved: true
    }
  },

  isTabNeedName (queryTab) {
    const isFromScratch = !queryTab.initName
    return isFromScratch || queryTab.isPredefined
  },

  getDataToSave (queryTab, newName) {
    return {
      id: queryTab.isPredefined ? nanoid() : queryTab.id,
      query: queryTab.query,
      chart: queryTab.getChartSatateForSave(),
      name: newName || queryTab.initName
    }
  },

  save (queryTab, newName) {
    const value = this.getDataToSave(queryTab, newName)
    const isNeedName = this.isTabNeedName(queryTab)

    // Get queries from local storage
    let myQueries = JSON.parse(localStorage.getItem('myQueries'))

    // Set createdAt
    if (isNeedName) {
      value.createdAt = new Date()
    } else {
      var queryIndex = myQueries.findIndex(oldQuery => oldQuery.id === queryTab.id)
      value.createdAt = myQueries[queryIndex].createdAt
    }

    // Insert in queries list
    if (!myQueries) {
      myQueries = [value]
    } else if (isNeedName) {
      myQueries.push(value)
    } else {
      myQueries[queryIndex] = value
    }

    // Save to local storage
    localStorage.setItem('myQueries', JSON.stringify(myQueries))
    return value
  }
}
