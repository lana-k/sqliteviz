import Vue from 'vue'
import Vuex from 'vuex'
import sqliteParser from 'sqlite-parser'

Vue.use(Vuex)

function getAst (sql) {
  // There is a bug is sqlite-parser
  // It throws an error if tokenizer has an arguments:
  // https://github.com/codeschool/sqlite-parser/issues/59
  const fixedSql = sql
    .replace(/(?<=tokenize=.+)"tokenchars=.+"/, '')
    .replace(/(?<=tokenize=.+)"remove_diacritics=.+"/, '')
    .replace(/(?<=tokenize=.+)"separators=.+"/, '')
    .replace(/tokenize=.+(?=(,|\)))/, 'tokenize=unicode61')

  return sqliteParser(fixedSql)
}

function getColumns (sql) {
  const columns = []
  const ast = getAst(sql)

  const columnDefinition = ast.statement[0].format === 'table'
    ? ast.statement[0].definition
    : ast.statement[0].result.args.expression // virtual table

  columnDefinition.forEach(item => {
    if (item.variant === 'column' && ['identifier', 'definition'].includes(item.type)) {
      let type = item.datatype ? item.datatype.variant : 'N/A'
      if (item.datatype && item.datatype.args) {
        type = type + '(' + item.datatype.args.expression[0].value
        if (item.datatype.args.expression.length === 2) {
          type = type + ', ' + item.datatype.args.expression[1].value
        }
        type = type + ')'
      }
      columns.push({ name: item.name, type: type })
    }
  })
  return columns
}

export default new Vuex.Store({
  state: {
    schema: null,
    dbFile: null,
    dbName: null,
    tabs: [],
    currentTab: null,
    currentTabId: null,
    untitledLastIndex: 0,
    predefinedQueries: []
  },
  mutations: {
    saveSchema (state, schema) {
      const parsedSchema = []
      schema.forEach(item => {
        parsedSchema.push({
          name: item[0],
          columns: getColumns(item[1])
        })
      })
      state.schema = parsedSchema
    },
    saveDbFile (state, file) {
      state.dbFile = file
    },
    saveDbName (state, name) {
      state.dbName = name
    },
    addTab (state, tab) {
      // add new tab only if was not already opened
      if (!state.tabs.some(openedTab => openedTab.id === tab.id)) {
        state.tabs.push(tab)
        if (!tab.name) {
          state.untitledLastIndex += 1
        }
      }
    },
    updateTab (state, { index, name, id, query, chart, isUnsaved }) {
      const tab = state.tabs[index]
      const oldId = tab.id

      if (state.currentTabId === oldId) {
        state.currentTabId = id
      }

      tab.id = id
      if (name) { tab.name = name }
      if (query) { tab.query = query }
      if (chart) { tab.chart = chart }
      if (isUnsaved !== undefined) { tab.isUnsaved = isUnsaved }
      delete tab.isPredefined

      Vue.set(state.tabs, index, tab)
    },
    updateTabState (state, { index, newValue }) {
      const tab = state.tabs[index]
      tab.isUnsaved = newValue
      Vue.set(state.tabs, index, tab)
    },
    deleteTab (state, index) {
      if (state.tabs[index].id !== state.currentTabId) {
      } else if (index < state.tabs.length - 1) {
        state.currentTabId = state.tabs[index + 1].id
      } else if (index > 0) {
        state.currentTabId = state.tabs[index - 1].id
      } else {
        state.currentTabId = null
        state.currentTab = null
        state.untitledLastIndex = 0
      }
      state.tabs.splice(index, 1)
    },
    setCurrentTabId (state, id) {
      state.currentTabId = id
    },
    setCurrentTab (state, tab) {
      state.currentTab = tab
    },
    updatePredefinedQueries (state, queries) {
      if (Array.isArray(queries)) {
        state.predefinedQueries = queries
      } else {
        state.predefinedQueries = [queries]
      }
    }
  },
  actions: {
  }
})
