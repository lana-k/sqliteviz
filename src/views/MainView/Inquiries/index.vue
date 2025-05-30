<template>
  <div id="my-inquiries-container">
    <div v-if="allInquiries.length === 0" id="start-guide">
      You don't have saved inquiries so far.
      <span class="link" @click="emitCreateTabEvent">Create</span>
      the one from scratch or
      <span class="link" @click="importInquiries">import</span> from a file.
    </div>
    <div
      v-if="$store.state.loadingPredefinedInquiries"
      id="loading-predefined-status"
    >
      <loading-indicator />
      Loading predefined inquiries...
    </div>
    <div
      v-show="allInquiries.length > 0"
      id="my-inquiries-content"
      ref="my-inquiries-content"
    >
      <div id="my-inquiries-toolbar">
        <div id="toolbar-buttons">
          <button
            id="toolbar-btns-import"
            class="toolbar"
            @click="importInquiries"
          >
            Import
          </button>
          <button
            v-show="selectedInquiriesCount > 0"
            id="toolbar-btns-export"
            class="toolbar"
            @click="exportSelectedInquiries()"
          >
            Export
          </button>
          <button
            v-show="selectedNotPredefinedCount > 0"
            id="toolbar-btns-delete"
            class="toolbar"
            @click="showDeleteDialog(selectedInquiriesIds)"
          >
            Delete
          </button>
        </div>
        <div id="toolbar-search">
          <text-field
            v-model="filter"
            placeholder="Search inquiry by name"
            width="300px"
          />
        </div>
      </div>

      <div v-show="showedInquiries.length === 0" id="inquiries-not-found">
        No inquiries found
      </div>

      <div v-show="showedInquiries.length > 0" class="rounded-bg">
        <div class="header-container">
          <div>
            <div ref="name-th" class="fixed-header">
              <check-box
                ref="mainCheckBox"
                theme="light"
                @click="toggleSelectAll"
              />
              <div class="name-th">Name</div>
            </div>
            <div class="fixed-header">Created at</div>
          </div>
        </div>
        <div
          class="table-container"
          :style="{ 'max-height': `${maxTableHeight}px` }"
        >
          <table ref="table" class="sqliteviz-table">
            <tbody>
              <tr
                v-for="(inquiry, index) in showedInquiries"
                :key="inquiry.id"
                @click="openInquiry(index)"
              >
                <td ref="name-td">
                  <div class="cell-data">
                    <check-box
                      ref="rowCheckBox"
                      :init="selectAll || selectedInquiriesIds.has(inquiry.id)"
                      data-test="rowCheckBox"
                      @click="toggleRow($event, inquiry.id)"
                    />
                    <div class="name">{{ inquiry.name }}</div>
                    <div
                      v-if="inquiry.isPredefined"
                      class="badge"
                      @mouseenter="showTooltip"
                      @mouseleave="hideTooltip"
                    >
                      Predefined
                      <span
                        ref="tooltip"
                        class="icon-tooltip"
                        :style="tooltipStyle"
                      >
                        Predefined inquiries come from the server. These
                        inquiries can’t be deleted or renamed.
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="second-column">
                    <div class="date-container">
                      {{ createdAtFormatted(inquiry.createdAt) }}
                    </div>
                    <div class="icons-container">
                      <rename-icon
                        v-if="!inquiry.isPredefined"
                        @click="showRenameDialog(inquiry.id)"
                      />
                      <copy-icon @click="duplicateInquiry(index)" />
                      <export-icon
                        tooltip="Export inquiry to file"
                        tooltipPosition="top-left"
                        @click="exportToFile([inquiry], `${inquiry.name}.json`)"
                      />
                      <delete-icon
                        v-if="!inquiry.isPredefined"
                        @click="showDeleteDialog(new Set().add(inquiry.id))"
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

    <!--Rename Inquiry dialog  -->
    <modal modalId="rename" class="dialog" contentStyle="width: 560px;">
      <div class="dialog-header">
        Rename inquiry
        <close-icon @click="$modal.hide('rename')" />
      </div>
      <div class="dialog-body">
        <text-field
          v-model="newName"
          label="New inquiry name"
          :errorMsg="errorMsg"
          width="100%"
        />
      </div>
      <div class="dialog-buttons-container">
        <button class="secondary" @click="$modal.hide('rename')">Cancel</button>
        <button class="primary" @click="renameInquiry">Rename</button>
      </div>
    </modal>

    <!--Delete Inquiry dialog  -->
    <modal modalId="delete" class="dialog" contentStyle="width: 480px;">
      <div class="dialog-header">
        Delete {{ deleteGroup ? 'inquiries' : 'inquiry' }}
        <close-icon @click="$modal.hide('delete')" />
      </div>
      <div class="dialog-body">
        {{ deleteDialogMsg }}
        <div
          v-show="selectedInquiriesCount > selectedNotPredefinedCount"
          id="note"
        >
          <img src="~@/assets/images/info.svg" />
          Note: Predefined inquiries you've selected won't be deleted
        </div>
      </div>
      <div class="dialog-buttons-container">
        <button class="secondary" @click="$modal.hide('delete')">Cancel</button>
        <button class="primary" @click="deleteInquiry">Delete</button>
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
import LoadingIndicator from '@/components/LoadingIndicator'
import tooltipMixin from '@/tooltipMixin'
import storedInquiries from '@/lib/storedInquiries'
import eventBus from '@/lib/eventBus'

export default {
  name: 'Inquiries',
  components: {
    RenameIcon,
    CopyIcon,
    ExportIcon,
    DeleteIcon,
    CloseIcon,
    TextField,
    CheckBox,
    LoadingIndicator
  },
  mixins: [tooltipMixin],
  data() {
    return {
      filter: null,
      newName: null,
      processedInquiryId: null,
      errorMsg: null,
      selectedInquiriesIds: new Set(),
      selectedInquiriesCount: 0,
      selectedNotPredefinedCount: 0,
      selectAll: false,
      deleteGroup: false,
      resizeObserver: null,
      maxTableHeight: 0
    }
  },
  computed: {
    inquiries() {
      return this.$store.state.inquiries
    },
    predefinedInquiries() {
      return this.$store.state.predefinedInquiries.map(inquiry => {
        inquiry.isPredefined = true
        return inquiry
      })
    },
    predefinedInquiriesIds() {
      return new Set(this.predefinedInquiries.map(inquiry => inquiry.id))
    },
    showedInquiries() {
      let showedInquiries = this.allInquiries
      if (this.filter) {
        showedInquiries = showedInquiries.filter(
          inquiry =>
            inquiry.name.toUpperCase().indexOf(this.filter.toUpperCase()) >= 0
        )
      }
      return showedInquiries
    },

    allInquiries() {
      return this.predefinedInquiries.concat(this.inquiries)
    },
    processedInquiryIndex() {
      return this.inquiries.findIndex(
        inquiry => inquiry.id === this.processedInquiryId
      )
    },
    deleteDialogMsg() {
      if (
        !this.deleteGroup &&
        (this.processedInquiryIndex === null ||
          this.processedInquiryIndex < 0 ||
          this.processedInquiryIndex > this.inquiries.length)
      ) {
        return ''
      }

      const deleteItem = this.deleteGroup
        ? `${this.selectedNotPredefinedCount} ${
            this.selectedNotPredefinedCount > 1 ? 'inquiries' : 'inquiry'
          }`
        : `"${this.inquiries[this.processedInquiryIndex].name}"`

      return `Are you sure you want to delete ${deleteItem}?`
    }
  },
  watch: {
    showedInquiries: {
      handler() {
        this.selectedInquiriesIds = new Set(
          this.showedInquiries
            .filter(inquiry => this.selectedInquiriesIds.has(inquiry.id))
            .map(inquiry => inquiry.id)
        )
        this.selectedInquiriesCount = this.selectedInquiriesIds.size
        this.selectedNotPredefinedCount = [...this.selectedInquiriesIds].filter(
          id => !this.predefinedInquiriesIds.has(id)
        ).length

        if (this.selectedInquiriesIds.size < this.showedInquiries.length) {
          if (this.$refs.mainCheckBox) {
            this.$refs.mainCheckBox.checked = false
          }
          this.selectAll = false
        }
      },
      deep: true
    }
  },
  async created() {
    const loadingPredefinedInquiries =
      this.$store.state.loadingPredefinedInquiries
    const predefinedInquiriesLoaded =
      this.$store.state.predefinedInquiriesLoaded
    if (!predefinedInquiriesLoaded && !loadingPredefinedInquiries) {
      try {
        this.$store.commit('setLoadingPredefinedInquiries', true)
        const inquiries = await storedInquiries.readPredefinedInquiries()
        this.$store.commit('updatePredefinedInquiries', inquiries)
        this.$store.commit('setPredefinedInquiriesLoaded', true)
      } catch (e) {
        console.error(e)
      }
      this.$store.commit('setLoadingPredefinedInquiries', false)
    }
  },
  mounted() {
    this.resizeObserver = new ResizeObserver(this.calcMaxTableHeight)
    this.resizeObserver.observe(this.$refs['my-inquiries-content'])

    this.tableResizeObserver = new ResizeObserver(this.calcNameWidth)
    this.tableResizeObserver.observe(this.$refs.table)
    this.calcNameWidth()
    this.calcMaxTableHeight()
  },
  beforeUnmount() {
    this.resizeObserver.unobserve(this.$refs['my-inquiries-content'])
    this.tableResizeObserver.unobserve(this.$refs.table)
  },
  methods: {
    emitCreateTabEvent() {
      eventBus.$emit('createNewInquiry')
    },
    createdAtFormatted(value) {
      if (!value) {
        return ''
      }
      const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' }
      const timeOptions = {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      }
      return (
        new Date(value).toLocaleDateString('en-GB', dateOptions) +
        ' ' +
        new Date(value).toLocaleTimeString('en-GB', timeOptions)
      )
    },
    calcNameWidth() {
      const nameWidth =
        this.$refs['name-td'] && this.$refs['name-td'][0]
          ? this.$refs['name-td'][0].getBoundingClientRect().width
          : 0
      this.$refs['name-th'].style = `width: ${nameWidth}px`
    },
    calcMaxTableHeight() {
      const freeSpace = this.$refs['my-inquiries-content'].offsetHeight - 200
      this.maxTableHeight = freeSpace - (freeSpace % 40) + 1
    },
    openInquiry(index) {
      const tab = this.showedInquiries[index]
      setTimeout(() => {
        this.$store.dispatch('addTab', tab).then(id => {
          this.$store.commit('setCurrentTabId', id)
          this.$router.push('/workspace')
        })
      })
    },
    showRenameDialog(id) {
      this.errorMsg = null
      this.processedInquiryId = id
      this.newName = this.inquiries[this.processedInquiryIndex].name
      this.$modal.show('rename')
    },
    renameInquiry() {
      if (!this.newName) {
        this.errorMsg = "Inquiry name can't be empty"
        return
      }
      this.$store.dispatch('renameInquiry', {
        inquiryId: this.processedInquiryId,
        newName: this.newName
      })

      // hide dialog
      this.$modal.hide('rename')
    },
    duplicateInquiry(index) {
      const newInquiry = storedInquiries.duplicateInquiry(
        this.showedInquiries[index]
      )
      this.$store.dispatch('addInquiry', newInquiry)
    },
    showDeleteDialog(idsSet) {
      this.deleteGroup = idsSet.size > 1
      if (!this.deleteGroup) {
        this.processedInquiryId = idsSet.values().next().value
      }
      this.$modal.show('delete')
    },
    deleteInquiry() {
      this.$modal.hide('delete')
      if (!this.deleteGroup) {
        this.$store.dispatch(
          'deleteInquiries',
          new Set().add(this.processedInquiryId)
        )

        // Clear checkbox
        if (this.selectedInquiriesIds.has(this.processedInquiryId)) {
          this.selectedInquiriesIds.delete(this.processedInquiryId)
        }
      } else {
        this.$store.dispatch('deleteInquiries', this.selectedInquiriesIds)

        // Clear checkboxes
        this.selectedInquiriesIds.clear()
      }
      this.selectedInquiriesCount = this.selectedInquiriesIds.size
    },
    exportToFile(inquiryList, fileName) {
      storedInquiries.export(inquiryList, fileName)
    },
    exportSelectedInquiries() {
      const inquiryList = this.allInquiries.filter(inquiry =>
        this.selectedInquiriesIds.has(inquiry.id)
      )

      this.exportToFile(inquiryList, 'My sqliteviz inquiries.json')
    },

    importInquiries() {
      storedInquiries.importInquiries().then(importedInquiries => {
        this.$store.commit(
          'setInquiries',
          this.inquiries.concat(importedInquiries)
        )
      })
    },

    toggleSelectAll(checked) {
      this.selectAll = checked
      this.$refs.rowCheckBox.forEach(item => {
        item.checked = checked
      })

      this.selectedInquiriesIds = checked
        ? new Set(this.showedInquiries.map(inquiry => inquiry.id))
        : new Set()

      this.selectedInquiriesCount = this.selectedInquiriesIds.size
      this.selectedNotPredefinedCount = checked
        ? [...this.selectedInquiriesIds].filter(
            id => !this.predefinedInquiriesIds.has(id)
          ).length
        : 0
    },

    toggleRow(checked, id) {
      const isPredefined = this.predefinedInquiriesIds.has(id)
      if (checked) {
        this.selectedInquiriesIds.add(id)
        if (!isPredefined) {
          this.selectedNotPredefinedCount += 1
        }
      } else {
        if (this.selectedInquiriesIds.size === this.showedInquiries.length) {
          this.$refs.mainCheckBox.checked = false
          this.selectAll = false
        }
        this.selectedInquiriesIds.delete(id)
        if (!isPredefined) {
          this.selectedNotPredefinedCount -= 1
        }
      }
      this.selectedInquiriesCount = this.selectedInquiriesIds.size
    }
  }
}
</script>

<style scoped>
#my-inquiries-container {
  position: relative;
}

#loading-predefined-status {
  position: absolute;
  right: 0;
  display: flex;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-light-2);
  align-items: center;
  padding: 8px;
}

#start-guide {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-text-base);
  font-size: 14px;
  text-align: center;
}

#inquiries-not-found {
  padding: 35px 5px;
  border-radius: 5px;
  border: 1px solid var(--color-border-light);
  color: var(--color-text-base);
  font-size: 14px;
  text-align: center;
}

#my-inquiries-content {
  padding: 52px;
  height: 100%;
  box-sizing: border-box;
}

#my-inquiries-toolbar {
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
