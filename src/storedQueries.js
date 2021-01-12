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

  exportQueries (data) {
    const preparedData = JSON.parse(JSON.stringify(data))

    // Remove isPredefined mark for exported queries
    if (Array.isArray(data)) {
      // group operation
      preparedData.forEach(query => delete query.isPredefined)
    } else {
      // single operation
      delete preparedData.isPredefined
    }

    // Create downloader
    const downloader = document.createElement('a')
    downloader.hidden = true
    document.body.appendChild(downloader)

    // Prepare data
    const name = data.name || 'My sqlitevis queries'
    const json = JSON.stringify(preparedData, null, 4)
    const blob = new Blob([json], { type: 'octet/stream' })
    const url = window.URL.createObjectURL(blob)
    downloader.href = url
    downloader.download = `${name}.json`

    // Trigger click
    downloader.click()

    // Clear
    window.URL.revokeObjectURL(url)
    downloader.remove()
  },

  /**
   * It calls onSuccess with imported queries as argument when
   * file read. We can't use Promises here because we can't
   * catch the Cancel event when a user choose a file.
   */
  importQueries (onSuccess) {
    let uploader = document.getElementById('file-uploader')

    // Create uploader if it doesn't exists
    if (!uploader) {
      uploader = document.createElement('input')
      uploader.id = 'file-uploader'
      uploader.type = 'file'
      uploader.accept = '.json'
      uploader.hidden = true

      uploader.addEventListener('change', () => {
        const file = uploader.files[0]
        const reader = new FileReader()
        reader.onload = (e) => {
          // Parse data
          let importedQueries = JSON.parse(e.target.result)

          // Turn data into array if they are not
          if (!Array.isArray(importedQueries)) {
            importedQueries = [importedQueries]
          }

          // Generate new ids if they are the same as existing queries
          importedQueries.forEach(query => {
            const allQueriesIds = this.getStoredQueries().map(query => query.id)
            if (new Set(allQueriesIds).has(query.id)) {
              query.id = nanoid()
            }
          })

          // Clear uploader
          uploader.value = null

          // Call callback
          onSuccess(importedQueries)
        }
        reader.readAsText(file)
      })

      document.body.appendChild(uploader)
    }
    uploader.click()
  }
}
