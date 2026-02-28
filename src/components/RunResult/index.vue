<template>
  <div ref="runResultPanel" class="run-result-panel">
    <splitpanes
      :before="{ size: 50, max: 100 }"
      :after="{ size: 50, max: 100, hidden: !viewValuePanelVisible }"
      :default="{ before: 50, after: 50 }"
      class="run-result-panel-content"
    >
      <template #left-pane>
        <div class="result-set-container">
          <div
            v-show="result === null && !isGettingResults && !error"
            class="table-preview result-before"
          >
            Run your query and get results here
          </div>
          <div v-if="isGettingResults" class="table-preview result-in-progress">
            <loading-indicator :size="30" />
            Fetching results...
          </div>
          <div
            v-show="result === undefined && !isGettingResults && !error"
            class="table-preview result-empty"
          >
            No rows retrieved according to your query
          </div>
          <logs v-if="error" :messages="[error]" />
          <sql-table
            v-if="result && !viewRecord"
            :data-set="result"
            :time="time"
            :pageSize="pageSize"
            :page="defaultPage"
            :selectedCellCoordinates="defaultSelectedCell"
            class="straight"
            @update-selected-cell="onUpdateSelectedCell"
          />

          <record
            v-if="result && viewRecord"
            ref="recordView"
            :data-set="result"
            :time="time"
            :selectedColumnIndex="selectedCell ? +selectedCell.dataset.col : 0"
            :rowIndex="selectedCell ? +selectedCell.dataset.row : 0"
            @update-selected-cell="onUpdateSelectedCell"
          />
        </div>
      </template>
      <template v-if="viewValuePanelVisible" #right-pane>
        <value-viewer
          :empty="!selectedCell"
          emptyMessage="No cell selected to view"
          :value="
            selectedCell
              ? result.values[result.columns[selectedCell.dataset.col]][
                  selectedCell.dataset.row
                ]
              : ''
          "
        />
      </template>
    </splitpanes>

    <side-tool-bar panel="table" @switch-to="$emit('switchTo', $event)">
      <icon-button
        :disabled="!result"
        tooltip="Export result set to CSV file"
        tooltipPosition="top-left"
        @click="exportToCsv"
      >
        <export-to-csv-icon />
      </icon-button>

      <icon-button
        ref="copyToClipboardBtn"
        :disabled="!result"
        tooltip="Copy result set to clipboard"
        tooltipPosition="top-left"
        @click="prepareCopy"
      >
        <clipboard-icon />
      </icon-button>

      <icon-button
        ref="rowBtn"
        :disabled="!result"
        tooltip="View record"
        tooltipPosition="top-left"
        :active="viewRecord"
        @click="toggleViewRecord"
      >
        <row-icon />
      </icon-button>

      <icon-button
        ref="viewCellValueBtn"
        :disabled="!result"
        tooltip="View value"
        tooltipPosition="top-left"
        :active="viewValuePanelVisible"
        @click="toggleViewValuePanel"
      >
        <view-cell-value-icon />
      </icon-button>
    </side-tool-bar>

    <loading-dialog
      v-model="showLoadingDialog"
      loadingMsg="Building CSV..."
      successMsg="CSV is ready"
      actionBtnName="Copy"
      title="Copy to clipboard"
      :loading="preparingCopy"
      @action="copyToClipboard"
      @cancel="cancelCopy"
    />
  </div>
</template>

<script>
import Logs from '@/components/Common/Logs'
import SqlTable from '@/components/SqlTable'
import LoadingIndicator from '@/components/Common/LoadingIndicator'
import SideToolBar from '@/components/SideToolBar'
import Splitpanes from '@/components/Common/Splitpanes'
import ExportToCsvIcon from '@/components/svg/exportToCsv'
import ClipboardIcon from '@/components/svg/clipboard'
import ViewCellValueIcon from '@/components/svg/viewCellValue'
import RowIcon from '@/components/svg/row'
import IconButton from '@/components/Common/IconButton'
import csv from '@/lib/csv'
import fIo from '@/lib/utils/fileIo'
import cIo from '@/lib/utils/clipboardIo'
import time from '@/lib/utils/time'
import loadingDialog from '@/components/Common/LoadingDialog'
import events from '@/lib/utils/events'
import ValueViewer from '@/components/ValueViewer'
import Record from './Record/index.vue'

export default {
  name: 'RunResult',
  components: {
    SqlTable,
    LoadingIndicator,
    Logs,
    SideToolBar,
    ExportToCsvIcon,
    IconButton,
    ClipboardIcon,
    ViewCellValueIcon,
    RowIcon,
    loadingDialog,
    ValueViewer,
    Record,
    Splitpanes
  },
  props: {
    result: Object,
    isGettingResults: Boolean,
    error: Object,
    time: [String, Number]
  },
  emits: ['switchTo'],
  data() {
    return {
      resizeObserver: null,
      pageSize: 20,
      preparingCopy: false,
      dataToCopy: null,
      viewValuePanelVisible: false,
      selectedCell: null,
      viewRecord: false,
      defaultPage: 1,
      defaultSelectedCell: null,
      enableTeleport: this.$store.state.isWorkspaceVisible,
      showLoadingDialog: false
    }
  },
  watch: {
    result() {
      this.defaultSelectedCell = null
      this.selectedCell = null
    }
  },
  activated() {
    this.enableTeleport = true
  },
  deactivated() {
    this.enableTeleport = false
  },
  mounted() {
    this.resizeObserver = new ResizeObserver(this.handleResize)
    this.resizeObserver.observe(this.$refs.runResultPanel)
    this.calculatePageSize()
  },
  beforeUnmount() {
    this.resizeObserver.unobserve(this.$refs.runResultPanel)
  },
  methods: {
    handleResize() {
      this.calculatePageSize()
    },

    calculatePageSize() {
      const runResultPanel = this.$refs.runResultPanel
      // 27 - table footer hight
      // 5 - padding-bottom of rounded table container
      // 35 - height of table header
      const freeSpace = runResultPanel.offsetHeight - 27 - 5 - 35
      this.pageSize = Math.max(Math.floor(freeSpace / 35), 20)
    },

    exportToCsv() {
      if (this.result && this.result.values) {
        events.send(
          'resultset.export',
          this.result.values[this.result.columns[0]].length,
          { to: 'csv' }
        )
      }

      fIo.exportToFile(csv.serialize(this.result), 'result_set.csv', 'text/csv')
    },

    async prepareCopy() {
      if (this.result && this.result.values) {
        events.send(
          'resultset.export',
          this.result.values[this.result.columns[0]].length,
          { to: 'clipboard' }
        )
      }

      if ('ClipboardItem' in window) {
        this.preparingCopy = true
        this.showLoadingDialog = true
        const t0 = performance.now()

        await time.sleep(0)
        this.dataToCopy = csv.serialize(this.result)
        const t1 = performance.now()
        if (t1 - t0 < 950) {
          this.copyToClipboard()
        } else {
          this.preparingCopy = false
        }
      } else {
        alert(
          "Your browser doesn't support copying into the clipboard. " +
            'If you use Firefox you can enable it ' +
            'by setting dom.events.asyncClipboard.clipboardItem to true.'
        )
      }
    },

    copyToClipboard() {
      cIo.copyText(this.dataToCopy, 'CSV copied to clipboard successfully')
      this.showLoadingDialog = false
    },

    cancelCopy() {
      this.dataToCopy = null
    },

    toggleViewValuePanel() {
      this.viewValuePanelVisible = !this.viewValuePanelVisible
    },

    toggleViewRecord() {
      if (this.viewRecord) {
        this.defaultSelectedCell = {
          row: this.$refs.recordView.currentRowIndex,
          col: this.selectedCell ? +this.selectedCell.dataset.col : 0
        }
        this.defaultPage = Math.ceil(
          (this.$refs.recordView.currentRowIndex + 1) / this.pageSize
        )
      }

      this.viewRecord = !this.viewRecord
    },

    onUpdateSelectedCell(e) {
      this.selectedCell = e
    }
  }
}
</script>

<style scoped>
.run-result-panel {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.run-result-panel-content {
  flex-grow: 1;
  height: 100%;
  width: 0;
}

.result-set-container {
  position: relative;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}

.table-preview {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-text-base);
  font-size: 13px;
  text-align: center;
}

.result-in-progress {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  will-change: opacity;
  /*
    We need to show loader in 1 sec after starting query execution. We can't do that with
    setTimeout because the main thread can be busy by getting a result set from the web worker.
    But we can use CSS animation for opacity. Opacity triggers changes only in the Composite Layer
    stage in rendering waterfall. Hence it can be processed only with Compositor Thread while
    the Main Thread processes a result set.
    https://www.viget.com/articles/animation-performance-101-browser-under-the-hood/
  */
  animation: show-loader 1s linear 0s 1;
}

@keyframes show-loader {
  0% {
    opacity: 0;
  }
  99% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
