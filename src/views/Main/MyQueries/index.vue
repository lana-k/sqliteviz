<template>
  <div>
    <div id="start-guide" v-if="showedQueries.length === 0">
      You don't have saved queries so far.
      <span class="link" @click="$root.$emit('createNewQuery')">Create</span>
      the one from scratch or
      <span @click="importQueries" class="link">import</span> from a file.
    </div>
    <div id="my-queries-content" ref="my-queries-content" v-show="showedQueries.length > 0">
      <div id="my-queries-toolbar">
        <div id="toolbar-buttons">
          <button id="toolbar-btns-import" class="toolbar" @click="importQueries">
            Import
          </button>
          <button
            id="toolbar-btns-export"
            class="toolbar"
            v-show="selectedQueriesCount > 0"
            @click="exportSelectedQueries()"
          >
            Export
          </button>
          <button
            id="toolbar-btns-delete"
            class="toolbar"
            v-show="selectedNotPredefinedCount > 0"
            @click="showDeleteDialog(selectedQueriesIds)"
          >
            Delete
          </button>
        </div>
        <div id="toolbar-search">
          <text-field placeholder="Search query by name" width="300px" v-model="filter"/>
        </div>
      </div>
      <div class="rounded-bg">
      <div class="header-container">
        <div>
          <div class="fixed-header" ref="name-th">
            <check-box ref="mainCheckBox" theme="light" @click="toggleSelectAll"/>
            <div class="name-th">Name</div>
          </div>
          <div class="fixed-header">
            Created at
          </div>
        </div>
      </div>
      <div class="table-container" :style="{ 'max-height': `${maxTableHeight}px` }">
        <table ref="table" class="sqliteviz-table">
          <tbody>
            <tr
              v-for="(query, index) in showedQueries"
              :key="query.id"
              @click="openQuery(index)"
            >
              <td ref="name-td">
                 <div class="cell-data">
                    <check-box
                      ref="rowCheckBox"
                      :init="selectAll || selectedQueriesIds.has(query.id)"
                      @click="toggleRow($event, query.id)"
                    />
                    <div class="name">{{ query.name }}</div>
                    <div
                      v-if="query.isPredefined"
                      class="badge"
                      @mouseover="showTooltip"
                      @mouseout="hideTooltip"
                    >
                      Predefined
                      <span class="icon-tooltip" :style="tooltipStyle">
                        Predefined queries come from the server.
                        These queries can’t be deleted or renamed.
                      </span>
                    </div>
                 </div>
              </td>
              <td>
                <div class="second-column">
                  <div class="date-container">{{ query.createdAt | date }}</div>
                  <div class="icons-container">
                    <rename-icon v-if="!query.isPredefined" @click="showRenameDialog(query.id)" />
                    <copy-icon @click="duplicateQuery(index)"/>
                    <export-icon
                      @click="exportToFile([query], `${query.name}.json`)"
                      tooltip="Export query to file"
                    />
                    <delete-icon
                      v-if="!query.isPredefined"
                      @click="showDeleteDialog((new Set()).add(query.id))"
                    />
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!--Rename Query dialog  -->
  <modal name="rename" classes="dialog" height="auto">
    <div class="dialog-header">
      Rename query
      <close-icon @click="$modal.hide('rename')"/>
    </div>
    <div class="dialog-body">
      <text-field
        label="New query name"
        :error-msg="errorMsg"
        v-model="newName"
        width="100%"
      />
    </div>
    <div class="dialog-buttons-container">
      <button class="secondary" @click="$modal.hide('rename')">Cancel</button>
      <button class="primary" @click="renameQuery">Rename</button>
    </div>
  </modal>

  <!--Delete Query dialog  -->
  <modal name="delete" classes="dialog" height="auto">
    <div class="dialog-header">
      Delete {{ deleteGroup ? 'queries' : 'query' }}
      <close-icon @click="$modal.hide('delete')"/>
    </div>
    <div class="dialog-body">
      {{ deleteDialogMsg }}
      <div v-show="selectedQueriesCount > selectedNotPredefinedCount" id="note">
        <img :src="require('@/assets/images/info.svg')">
        Note: Predefined queries you've selected won't be deleted
      </div>
    </div>
    <div class="dialog-buttons-container">
      <button class="secondary" @click="$modal.hide('delete')">Cancel</button>
      <button class="primary" @click="deleteQuery">Delete</button>
    </div>
  </modal>
</div>
</template>

<script>
import RenameIcon from './svg/rename'
import CopyIcon from './svg/copy'
import ExportIcon from '@/components/svg/export'
import DeleteIcon from './svg/delete'
import CloseIcon from '@/components/svg/close'
import TextField from '@/components/TextField'
import CheckBox from '@/components/CheckBox'
import tooltipMixin from '@/tooltipMixin'
import storedQueries from '@/lib/storedQueries'
import fu from '@/lib/utils/fileIo'

export default {
  name: 'MyQueries',
  components: {
    RenameIcon,
    CopyIcon,
    ExportIcon,
    DeleteIcon,
    CloseIcon,
    TextField,
    CheckBox
  },
  mixins: [tooltipMixin],
  data () {
    return {
      queries: [],
      filter: null,
      newName: null,
      processedQueryId: null,
      errorMsg: null,
      selectedQueriesIds: new Set(),
      selectedQueriesCount: 0,
      selectedNotPredefinedCount: 0,
      selectAll: false,
      deleteGroup: false,
      resizeObserver: null,
      maxTableHeight: 0
    }
  },
  computed: {
    predefinedQueries () {
      return this.$store.state.predefinedQueries.map(query => {
        query.isPredefined = true
        return query
      })
    },
    predefinedQueriesIds () {
      return new Set(this.predefinedQueries.map(query => query.id))
    },
    showedQueries () {
      let showedQueries = this.allQueries
      if (this.filter) {
        showedQueries = showedQueries.filter(
          query => query.name.toUpperCase().indexOf(this.filter.toUpperCase()) >= 0
        )
      }
      return showedQueries
    },
    allQueries () {
      return this.predefinedQueries.concat(this.queries)
    },
    processedQueryIndex () {
      return this.queries.findIndex(query => query.id === this.processedQueryId)
    },
    deleteDialogMsg () {
      if (!this.deleteGroup && (
        this.processedQueryIndex === null ||
          this.processedQueryIndex < 0 ||
          this.processedQueryIndex > this.queries.length
      )) {
        return ''
      }

      const deleteItem = this.deleteGroup
        ? `${this.selectedNotPredefinedCount} ${this.selectedNotPredefinedCount > 1
          ? 'queries'
          : 'query'}`
        : `"${this.queries[this.processedQueryIndex].name}"`

      return `Are you sure you want to delete ${deleteItem}?`
    }
  },
  created () {
    storedQueries.readPredefinedQueries()
      .then(queries => {
        this.$store.commit('updatePredefinedQueries', queries)
      })
      .catch(console.error)
      .finally(() => {
        this.queries = storedQueries.getStoredQueries()
      })
  },
  mounted () {
    this.resizeObserver = new ResizeObserver(this.calcMaxTableHeight)
    this.resizeObserver.observe(this.$refs['my-queries-content'])

    this.tableResizeObserver = new ResizeObserver(this.calcNameWidth)
    this.tableResizeObserver.observe(this.$refs.table)
    this.calcNameWidth()
    this.calcMaxTableHeight()
  },
  beforeDestroy () {
    this.resizeObserver.unobserve(this.$refs['my-queries-content'])
    this.tableResizeObserver.unobserve(this.$refs.table)
  },
  filters: {
    date (value) {
      if (!value) {
        return ''
      }
      const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' }
      const timeOptions = {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      }
      return new Date(value).toLocaleDateString('en-GB', dateOptions) + ' ' +
             new Date(value).toLocaleTimeString('en-GB', timeOptions)
    }
  },
  methods: {
    calcNameWidth () {
      const nameWidth = this.$refs['name-td']
        ? this.$refs['name-td'][0].getBoundingClientRect().width
        : 0
      this.$refs['name-th'].style = `width: ${nameWidth}px`
    },
    calcMaxTableHeight () {
      const freeSpace = this.$refs['my-queries-content'].offsetHeight - 200
      this.maxTableHeight = freeSpace - (freeSpace % 40) + 1
    },
    openQuery (index) {
      const tab = this.showedQueries[index]
      this.$store.dispatch('addTab', tab).then(id => {
        this.$store.commit('setCurrentTabId', id)
        this.$router.push('/editor')
      })
    },
    showRenameDialog (id) {
      this.errorMsg = null
      this.processedQueryId = id
      this.newName = this.queries[this.processedQueryIndex].name
      this.$modal.show('rename')
    },
    renameQuery () {
      if (!this.newName) {
        this.errorMsg = 'Query name can\'t be empty'
        return
      }
      const processedQuery = this.queries[this.processedQueryIndex]
      processedQuery.name = this.newName
      this.$set(this.queries, this.processedQueryIndex, processedQuery)

      // update queries in local storage
      storedQueries.updateStorage(this.queries)

      // update tab, if renamed query is opened
      const tabIndex = this.findTabIndex(processedQuery.id)
      if (tabIndex >= 0) {
        this.$store.commit('updateTab', {
          index: tabIndex,
          name: this.newName,
          id: processedQuery.id
        })
      }
      // hide dialog
      this.$modal.hide('rename')
    },
    duplicateQuery (index) {
      const newQuery = storedQueries.duplicateQuery(this.showedQueries[index])
      if (this.selectAll) {
        this.selectedQueriesIds.add(newQuery.id)
        this.selectedQueriesCount = this.selectedQueriesIds.size
      }
      this.queries.push(newQuery)
      storedQueries.updateStorage(this.queries)
    },
    showDeleteDialog (idsSet) {
      this.deleteGroup = idsSet.size > 1
      if (!this.deleteGroup) {
        this.processedQueryId = idsSet.values().next().value
      }
      this.$modal.show('delete')
    },
    deleteQuery () {
      this.$modal.hide('delete')
      if (!this.deleteGroup) {
        this.queries.splice(this.processedQueryIndex, 1)

        // Close deleted query tab if it was opened
        const tabIndex = this.findTabIndex(this.processedQueryId)
        if (tabIndex >= 0) {
          this.$store.commit('deleteTab', tabIndex)
        }

        // Clear checkboxes
        if (this.selectedQueriesIds.has(this.processedQueryId)) {
          this.selectedQueriesIds.delete(this.processedQueryId)
        }
      } else {
        this.queries = this.selectAll
          ? []
          : this.queries.filter(query => !this.selectedQueriesIds.has(query.id))

        // Close deleted queries if it was opened
        const tabs = this.$store.state.tabs
        for (let i = tabs.length - 1; i >= 0; i--) {
          if (this.selectedQueriesIds.has(tabs[i].id)) {
            this.$store.commit('deleteTab', i)
          }
        }

        // Clear checkboxes
        this.selectedQueriesIds.clear()
      }
      this.selectedQueriesCount = this.selectedQueriesIds.size
      storedQueries.updateStorage(this.queries)
    },
    findTabIndex (id) {
      return this.$store.state.tabs.findIndex(tab => tab.id === id)
    },
    exportToFile (queryList, fileName) {
      const jsonStr = storedQueries.serialiseQueries(queryList)
      fu.exportToFile(jsonStr, fileName)
    },
    exportSelectedQueries () {
      const queryList = this.selectAll
        ? this.allQueries
        : this.allQueries.filter(query => this.selectedQueriesIds.has(query.id))

      this.exportToFile(queryList, 'My sqliteviz queries.json')
    },
    importQueries () {
      storedQueries.importQueries()
        .then(importedQueries => {
          if (this.selectAll) {
            importedQueries.forEach(query => {
              this.selectedQueriesIds.add(query.id)
            })
            this.selectedQueriesCount = this.selectedQueriesIds.size
          }

          this.queries = this.queries.concat(importedQueries)
          storedQueries.updateStorage(this.queries)
        })
    },
    toggleSelectAll (checked) {
      this.selectAll = checked
      this.$refs.rowCheckBox.forEach(item => { item.checked = checked })

      this.selectedQueriesIds = checked
        ? new Set(this.allQueries.map(query => query.id))
        : new Set()

      this.selectedQueriesCount = this.selectedQueriesIds.size
      this.selectedNotPredefinedCount = checked ? this.queries.length : 0
    },
    toggleRow (checked, id) {
      const isPredefined = this.predefinedQueriesIds.has(id)
      if (checked) {
        this.selectedQueriesIds.add(id)
        if (!isPredefined) {
          this.selectedNotPredefinedCount += 1
        }
      } else {
        if (this.selectedQueriesIds.size === this.allQueries.length) {
          this.$refs.mainCheckBox.checked = false
          this.selectAll = false
        }
        this.selectedQueriesIds.delete(id)
        if (!isPredefined) {
          this.selectedNotPredefinedCount -= 1
        }
      }
      this.selectedQueriesCount = this.selectedQueriesIds.size
    }
  }
}
</script>

<style scoped>
#start-guide {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-text-base);
  font-size: 14px;
  text-align: center;
}

#my-queries-content {
  padding: 52px;
  height: 100%;
  box-sizing: border-box;
}

#my-queries-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 18px;
  margin: 0 auto 8px;
  max-width: 1500px;
  width: 100%;
}

.rounded-bg {
  padding-top: 40px;
  margin: 0 auto;
  max-width: 1500px;
  width: 100%;
}
.fixed-header {
  padding: 11px 24px;
}
.fixed-header:first-child {
  display: flex;
  align-items: center;
  padding-left: 12px;
}
.fixed-header:first-child .name-th {
  margin-left: 24px;
}

table.sqliteviz-table {
  margin-top: 0;
}

.sqliteviz-table tbody tr td {
  min-width: 0;
  height: 40px;
}

.sqliteviz-table tbody tr td:first-child {
  width: 70%;
  max-width: 0;
  padding: 0 12px;
}
.sqliteviz-table tbody tr td:last-child {
  width: 30%;
  max-width: 0;
  padding: 0 24px;
}

.sqliteviz-table tbody .cell-data {
  display: flex;
  align-items: center;
  max-width: 100%;
  width: 100%;
}
.sqliteviz-table tbody .cell-data div.name {
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 24px;
}

.sqliteviz-table tbody tr:hover td {
  cursor: pointer;
}

.sqliteviz-table tbody tr:hover td {
  color: var(--color-text-active);
}

.sqliteviz-table .second-column {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 100%;
}

.icons-container {
  display: none;
  margin-right: -12px;
}
.date-container {
  flex-shrink: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sqliteviz-table tbody tr:hover .icons-container {
  display: flex;
}
.dialog input {
  width: 100%;
}

button.toolbar {
  margin-right: 16px;
}

.badge {
  display: none;
  background-color: var(--color-gray-light-4);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-small);
  padding: 2px 6px;
  font-size: 11px;
  line-height: normal;
  margin-left: 12px;
}

.sqliteviz-table tbody tr:hover .badge {
  display: block;
}
#note {
  margin-top: 24px;
}
#note img {
  vertical-align: middle;
}
.icon-tooltip {
  display: block;
  width: 149px;
  white-space: normal;
  height: auto;
  line-height: normal;
  padding: 6px;
}
</style>
