import { nanoid } from 'nanoid'

export default {
  getStoredQueries () {
    return JSON.parse(localStorage.getItem('myQueries')) || []
  },

  duplicateQuery (baseQuery) {
    const newQuery = JSON.parse(JSON.stringify(baseQuery))
    newQuery.name = newQuery.name + ' Copy'
    newQuery.id = nanoid()
    newQuery.createdAt = new Date()
    delete newQuery.isPredefined

    return newQuery
  },

  isTabNeedName (queryTab) {
    const isFromScratch = !queryTab.initName
    return isFromScratch || queryTab.isPredefined
  },

  save (queryTab, newName) {
    const value = {
      id: queryTab.isPredefined ? nanoid() : queryTab.id,
      query: queryTab.query,
      chart: queryTab.getChartSatateForSave(),
      name: newName || queryTab.initName
    }

    const isNeedName = this.isTabNeedName(queryTab)

    // Get queries from local storage
    let myQueries = this.getStoredQueries()

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
    this.updateStorage(myQueries)
    return value
  },

  updateStorage (value) {
    localStorage.setItem('myQueries', JSON.stringify(value))
  },

  export (data) {
    // Create downloader
    const downloader = document.createElement('a')
    downloader.style.display = 'none'
    document.body.appendChild(downloader)

    // Prepare data
    const name = data.name || 'My sqlitevis queries'
    const json = JSON.stringify(data, null, 4)
    const blob = new Blob([json], { type: 'octet/stream' })
    const url = window.URL.createObjectURL(blob)
    downloader.href = url
    downloader.download = `${name}.json`

    // Trigger click
    downloader.click()

    // Clear
    window.URL.revokeObjectURL(url)
    downloader.remove()
  }
}
