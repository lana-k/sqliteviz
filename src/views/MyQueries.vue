<template>
  <div>
    <div id="my-queries-content">
      <div id="my-queries-toolbar">
        <div id="toolbar-buttons">
          <input
            ref="importFile"
            type="file"
            accept=".json"
            id="import-file"
            @change="importQueries"
          />
            <button class="toolbar">
              <label for="import-file">
                Import
              </label>
            </button>
          <button
            class="toolbar"
            v-show="hasSelectedRows"
            @click="exportQuery(selectedQueries)"
          >
            Export
          </button>
          <button class="toolbar" v-show="hasSelectedRows" @click="groupDelete">Delete</button>
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
      <div
        class="table-container"
        ref="table-container"
      >
        <table ref="table">
          <tbody>
            <tr v-for="(query, index) in showedQueries" :key="query.id" @click="openQuery(index)">
              <td ref="name-td">
                 <div class="cell-data">
                    <check-box
                      ref="rowCheckBox"
                      :init="selectAll || selectedQueries.has(query.id)"
                      @change="toggleRow($event, query.id)"
                    />
                    <div class="name">{{ query.name }}</div>
                 </div>
              </td>
              <td>
                <div class="second-column">
                  <div class="date-container">{{ query.createdAt | date }}</div>
                  <div class="icons-container">
                    <rename-icon @click="showRenameDialog(query.id)" />
                    <copy-icon @click="duplicateQuery(index)"/>
                    <export-icon @click="exportQuery(index)"/>
                    <delete-icon @click="showDeleteDialog(query.id)"/>
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
      Delete query
      <close-icon @click="$modal.hide('delete')"/>
    </div>
    <div
      v-if="
        currentQueryIndex !== null
        && currentQueryIndex >= 0
        && currentQueryIndex < queries.length
      "
      class="dialog-body"
    >
      Are you sure you want to delete
      "{{ queries[currentQueryIndex].name }}"?
    </div>
    <div class="dialog-buttons-container">
      <button class="secondary" @click="$modal.hide('delete')">Cancel</button>
      <button class="primary" @click="deleteQuery">Delete</button>
    </div>
  </modal>
  <a ref="downloader" />
</div>
</template>

<script>
import RenameIcon from '@/components/svg/rename'
import CopyIcon from '@/components/svg/copy'
import ExportIcon from '@/components/svg/export'
import DeleteIcon from '@/components/svg/delete'
import CloseIcon from '@/components/svg/close'
import TextField from '@/components/TextField'
import CheckBox from '@/components/CheckBox'
import { nanoid } from 'nanoid'

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
  data () {
    return {
      queries: [],
      filter: null,
      newName: null,
      currentQueryId: null,
      errorMsg: null,
      selectedQueries: new Set(),
      selectAll: false,
      hasSelectedRows: false
    }
  },
  computed: {
    showedQueries () {
      if (!this.filter) {
        return this.queries
      } else {
        return this.queries.filter(query => query.name.toUpperCase().indexOf(this.filter.toUpperCase()) >= 0)
      }
    },
    currentQueryIndex () {
      return this.queries.findIndex(query => query.id === this.currentQueryId)
    }
  },
  created () {
    this.queries = JSON.parse(localStorage.getItem('myQueries'))
  },
  mounted () {
    new ResizeObserver(this.calcNameWidth).observe(this.$refs.table)
    this.calcNameWidth()
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
      this.$refs['name-th'].style = `width: ${this.$refs['name-td'][0].offsetWidth}px`
    },
    openQuery (index) {
      const tab = this.showedQueries[index]
      tab.isUnsaved = false
      this.$store.commit('addTab', tab)
      this.$store.commit('setCurrentTabId', tab.id)
      this.$router.push('/editor')
    },
    showRenameDialog (id) {
      this.errorMsg = null
      this.currentQueryId = id
      this.newName = this.queries[this.currentQueryIndex].name
      this.$modal.show('rename')
    },
    renameQuery () {
      if (!this.newName) {
        this.errorMsg = 'Query name can\'t be empty'
        return
      }
      const currentQuery = this.queries[this.currentQueryIndex]
      currentQuery.name = this.newName
      this.$set(this.queries, this.currentQueryIndex, currentQuery)
      this.$modal.hide('rename')
      this.saveQueriesInLocalStorage()
      const tabIndex = this.findTabIndex(currentQuery.id)
      if (tabIndex >= 0) {
        this.$store.commit('updateTabName', { index: tabIndex, newName: this.newName })
      }
    },
    duplicateQuery (index) {
      const newQuery = JSON.parse(JSON.stringify(this.showedQueries[index]))
      newQuery.name = newQuery.name + ' Copy'
      newQuery.id = nanoid()
      newQuery.createdAt = new Date()
      this.queries.push(newQuery)
      this.saveQueriesInLocalStorage()
    },
    showDeleteDialog (id) {
      this.currentQueryId = id
      this.$modal.show('delete')
    },
    deleteQuery () {
      this.$modal.hide('delete')
      this.queries.splice(this.currentQueryIndex, 1)
      this.saveQueriesInLocalStorage()
      const tabIndex = this.findTabIndex(this.currentQueryId)
      if (tabIndex >= 0) {
        this.$store.commit('deleteTab', tabIndex)
      }
    },
    findTabIndex (id) {
      return this.$store.state.tabs.findIndex(tab => tab.id === id)
    },
    exportQuery (index) {
      let data
      let name

      // single operation
      if (typeof index === 'number') {
        console.log('single')
        data = JSON.parse(JSON.stringify(this.showedQueries[index]))
        name = data.name
        delete data.id
        delete data.createdAt
      } else {
        // group operation
        console.log(this.queries.filter(query => this.selectedQueries.has(query.id)))
        data = this.selectAll
          ? JSON.parse(JSON.stringify(this.queries))
          : this.queries.filter(query => this.selectedQueries.has(query.id))
        name = 'My sqliteviz queries'
        data.forEach(query => {
          delete query.id
          delete query.createdAt
        })
      }
      // export data to file
      const downloader = this.$refs.downloader
      const json = JSON.stringify(data, null, 4)
      const blob = new Blob([json], { type: 'octet/stream' })
      const url = window.URL.createObjectURL(blob)
      downloader.href = url
      downloader.download = `${name}.json`
      downloader.click()
      window.URL.revokeObjectURL(url)
    },
    importQueries () {
      const file = this.$refs.importFile.files[0]
      const reader = new FileReader()
      reader.onload = () => {
        let importedQueries = JSON.parse(event.target.result)

        if (!Array.isArray(importedQueries)) {
          importedQueries = [importedQueries]
        }

        importedQueries.forEach(query => {
          query.id = nanoid()
          query.createdAt = new Date()
        })

        this.queries = this.queries.concat(importedQueries)
        this.saveQueriesInLocalStorage()
        this.$refs.importFile.value = null
      }
      reader.readAsText(file)
    },
    saveQueriesInLocalStorage () {
      localStorage.setItem('myQueries', JSON.stringify(this.queries))
    },
    toggleSelectAll (checked) {
      this.selectAll = checked
      this.$refs.rowCheckBox.forEach(item => { item.checked = checked })
      this.selectedQueries = checked ? new Set(this.queries.map(query => query.id)) : new Set()
      this.hasSelectedRows = checked
    },
    toggleRow (checked, id) {
      if (checked) {
        this.selectedQueries.add(id)
      } else {
        if (this.selectedQueries.size === this.queries.length) {
          this.$refs.mainCheckBox.checked = false
          this.selectAll = false
        }
        this.selectedQueries.delete(id)
      }
      this.hasSelectedRows = this.selectedQueries.size > 0
    },
    groupDelete () {}
  }
}
</script>

<style scoped>
#my-queries-content {
  padding: 52px;
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
  margin: 0 auto;
  max-width: 1500px;
  width: 100%;
}
.fixed-header:first-child {
  display: flex;
  align-items: center;
  padding-left: 12px;
}
.fixed-header:first-child .name-th {
  margin-left: 24px;
}
table {
  margin-top: 0;
}

tbody tr td {
  min-width: 0;
  line-height: 40px;
}

tbody tr td:first-child {
  width: 70%;
  max-width: 0;
  padding: 0 12px;
}
tbody tr td:last-child {
  width: 30%;
  max-width: 0;
  padding: 0 24px;
}

tbody .cell-data {
  display: flex;
  align-items: center;
  max-width: 100%;
}
tbody .cell-data div.name {
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 24px;
}

tbody tr:hover td {
  cursor: pointer;
}

tbody tr:hover td {
  color: var(--color-text-active);
}

.second-column {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 100%;
}

.icons-container {
  display: none;
}
.date-container {
  flex-shrink: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
tbody tr:hover .icons-container {
  display: block;
}
.dialog input {
  width: 100%;
}
a, #import-file {
  display: none;
}
button.toolbar {
  margin-right: 16px;
}
button label {
  display: block;
  line-height: 36px;
}
button label:hover {
  cursor: pointer;
}
</style>
