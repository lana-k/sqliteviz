<template>
  <div class="run-result-panel" ref="runResultPanel">
   <component
      :is="viewValuePanelVisible ? 'splitpanes':'div'"
      :before="{ size: 50, max: 100 }"
      :after="{ size: 50, max: 100 }"
      :default="{ before: 50, after: 50 }"
      class="run-result-panel-content"
    >
      <template  #left-pane>
        <div :id="'run-result-left-pane-'+tab.id" class="result-set-container"/>
      </template>
      <div :id="'run-result-result-set-'+tab.id" class="result-set-container"/>
      <template #right-pane v-if="viewValuePanelVisible">
        <div class="value-viewer-container">
          <value-viewer
            v-show="selectedCell"
            :cellValue="selectedCell
              ? result.values[result.columns[selectedCell.dataset.col]][selectedCell.dataset.row]
              : ''"
          />
          <div v-show="!selectedCell" class="table-preview">
            No cell selected to view
          </div>
        </div>
      </template>
    </component>

    <side-tool-bar @switchTo="$emit('switchTo', $event)" panel="table">
      <icon-button
        :disabled="!result"
        tooltip="Export result set to CSV file"
        tooltip-position="top-left"
        @click="exportToCsv"
      >
        <export-to-csv-icon/>
      </icon-button>

      <icon-button
        :disabled="!result"
        tooltip="Copy result set to clipboard"
        tooltip-position="top-left"
        @click="prepareCopy"
      >
        <clipboard-icon/>
      </icon-button>

      <icon-button
        :disabled="!result"
        tooltip="View record"
        tooltip-position="top-left"
        :active="viewRecord"
        @click="toggleViewRecord"
      >
        <row-icon/>
      </icon-button>

      <icon-button
        :disabled="!result"
        tooltip="View value"
        tooltip-position="top-left"
        :active="viewValuePanelVisible"
        @click="toggleViewValuePanel"
      >
        <view-cell-value-icon/>
      </icon-button>
    </side-tool-bar>

    <loading-dialog
      loadingMsg="Building CSV..."
      successMsg="CSV is ready"
      actionBtnName="Copy"
      name="prepareCSVCopy"
      title="Copy to clipboard"
      :loading="preparingCopy"
      @action="copyToClipboard"
      @cancel="cancelCopy"
    />

    <teleport :to="resultSetTeleportTarget">
      <div>
            <div
              v-show="result === null && !isGettingResults && !error"
              class="table-preview result-before"
            >
              Run your query and get results here
            </div>
            <div v-if="isGettingResults" class="table-preview result-in-progress">
              <loading-indicator :size="30"/>
              Fetching results...
            </div>
            <div
              v-show="result === undefined && !isGettingResults && !error"
              class="table-preview result-empty"
            >
              No rows retrieved according to your query
            </div>
            <logs v-if="error" :messages="[error]"/>
            <sql-table
              v-if="result && !viewRecord"
              :data-set="result"
              :time="time"
              :pageSize="pageSize"
              :page="defaultPage"
              :selected-cell-coordinates="defaultSelectedCell"
              class="straight"
              @updateSelectedCell="onUpdateSelectedCell"
            />

            <record
              ref="recordView"
              v-if="result && viewRecord"
              :data-set="result"
              :time="time"
              :selected-column-index="selectedCell ? +selectedCell.dataset.col : 0"
              :rowIndex="selectedCell ? +selectedCell.dataset.row : 0"
              @updateSelectedCell="onUpdateSelectedCell"
            />
          </div>
    </teleport>
  </div>
</template>

<script>
import Logs from '@/components/Logs'
import SqlTable from '@/components/SqlTable'
import LoadingIndicator from '@/components/LoadingIndicator'
import SideToolBar from '../SideToolBar'
import Splitpanes from '@/components/Splitpanes'
import ExportToCsvIcon from '@/components/svg/exportToCsv'
import ClipboardIcon from '@/components/svg/clipboard'
import ViewCellValueIcon from '@/components/svg/viewCellValue'
import RowIcon from '@/components/svg/row'
import IconButton from '@/components/IconButton'
import csv from '@/lib/csv'
import fIo from '@/lib/utils/fileIo'
import cIo from '@/lib/utils/clipboardIo'
import time from '@/lib/utils/time'
import loadingDialog from '@/components/LoadingDialog'
import events from '@/lib/utils/events'
import Teleport from 'vue2-teleport'
import ValueViewer from './ValueViewer'
import Record from './Record/index.vue'

export default {
  name: 'RunResult',
  props: {
    tab: Object,
    result: Object,
    isGettingResults: Boolean,
    error: Object,
    time: [String, Number]
  },
  data () {
    return {
      resizeObserver: null,
      pageSize: 20,
      preparingCopy: false,
      dataToCopy: null,
      viewValuePanelVisible: false,
      selectedCell: null,
      viewRecord: false,
      defaultPage: 1,
      defaultSelectedCell: null
    }
  },
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
    Splitpanes,
    Teleport
  },
  computed: {
    resultSetTeleportTarget () {
      const base = `#${this.viewValuePanelVisible
        ? 'run-result-left-pane'
        : 'run-result-result-set'
      }`
      const tabIdPostfix = `-${this.tab.id}`
      return base + tabIdPostfix
    }
  },
  mounted () {
    this.resizeObserver = new ResizeObserver(this.handleResize)
    this.resizeObserver.observe(this.$refs.runResultPanel)
    this.calculatePageSize()
  },
  beforeDestroy () {
    this.resizeObserver.unobserve(this.$refs.runResultPanel)
  },
  watch: {
    result () {
      this.defaultSelectedCell = null
      this.selectedCell = null
    }
  },
  methods: {
    handleResize () {
      this.calculatePageSize()
    },

    calculatePageSize () {
      const runResultPanel = this.$refs.runResultPanel
      // 27 - table footer hight
      // 5 - padding-bottom of rounded table container
      // 35 - height of table header
      const freeSpace = runResultPanel.offsetHeight - 27 - 5 - 35
      this.pageSize = Math.max(Math.floor(freeSpace / 35), 20)
    },

    exportToCsv () {
      if (this.result && this.result.values) {
        events.send('resultset.export',
          this.result.values[this.result.columns[0]].length,
          { to: 'csv' }
        )
      }

      fIo.exportToFile(csv.serialize(this.result), 'result_set.csv', 'text/csv')
    },

    async prepareCopy () {
      if (this.result && this.result.values) {
        events.send('resultset.export',
          this.result.values[this.result.columns[0]].length,
          { to: 'clipboard' }
        )
      }

      if ('ClipboardItem' in window) {
        this.preparingCopy = true
        this.$modal.show('prepareCSVCopy')
        const t0 = performance.now()

        await time.sleep(0)
        this.dataToCopy = csv.serialize(this.result)
        const t1 = performance.now()
        if ((t1 - t0) < 950) {
          this.$modal.hide('prepareCSVCopy')
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

    copyToClipboard () {
      cIo.copyText(this.dataToCopy, 'CSV copied to clipboard successfully')
      this.$modal.hide('prepareCSVCopy')
    },

    cancelCopy () {
      this.dataToCopy = null
      this.$modal.hide('prepareCSVCopy')
    },

    toggleViewValuePanel () {
      this.viewValuePanelVisible = !this.viewValuePanelVisible
    },

    toggleViewRecord () {
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

    onUpdateSelectedCell (e) {
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

.result-set-container,
.result-set-container > div {
  position: relative;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}
.value-viewer-container {
  height: 100%;
  width: 100%;
  background-color: var(--color-white);
  position: relative;
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

>>>.vm--container {
  animation: show-modal 1s linear 0s 1;
}

@keyframes show-modal {
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
