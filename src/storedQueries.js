import { nanoid } from 'nanoid'
import fu from '@/fileUtils'

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
    return queryTab.isPredefined || isFromScratch
  },

  save (queryTab, newName) {
    const value = {
      id: queryTab.isPredefined ? nanoid() : queryTab.id,
      query: queryTab.query,
      chart: queryTab.getChartStateForSave(),
      name: newName || queryTab.initName
    }

    // Get queries from local storage
    const myQueries = this.getStoredQueries()

    // Set createdAt
    if (newName) {
      value.createdAt = new Date()
    } else {
      var queryIndex = myQueries.findIndex(oldQuery => oldQuery.id === queryTab.id)
      value.createdAt = myQueries[queryIndex].createdAt
    }

    // Insert in queries list
    if (newName) {
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

  serialiseQueries (queryList) {
    const preparedData = JSON.parse(JSON.stringify(queryList))
    preparedData.forEach(query => delete query.isPredefined)
    return JSON.stringify(preparedData, null, 4)
  },

  deserialiseQueries (str) {
    let queryList = JSON.parse(str)
    // Turn data into array if they are not
    if (!Array.isArray(queryList)) {
      queryList = [queryList]
    }

    // Generate new ids if they are the same as existing queries
    queryList.forEach(query => {
      const allQueriesIds = this.getStoredQueries().map(query => query.id)
      if (allQueriesIds.includes(query.id)) {
        query.id = nanoid()
      }
    })

    return queryList
  },

  importQueries () {
    return fu.importFile()
      .then(data => {
        return this.deserialiseQueries(data)
      })
  },

  readPredefinedQueries () {
    return fu.readFile('./queries.json')
      .then(resp => {
        return resp.json()
      })
  }
}
