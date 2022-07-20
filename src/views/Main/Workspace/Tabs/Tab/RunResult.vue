<template>
  <div class="run-result-panel" ref="runResultPanel">
    <div class="run-result-panel-content">
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
        v-if="result"
        :data-set="result"
        :time="time"
        :pageSize="pageSize"
        class="straight"
      />
    </div>
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
  </div>
</template>

<script>
import Logs from '@/components/Logs'
import SqlTable from '@/components/SqlTable'
import LoadingIndicator from '@/components/LoadingIndicator'
import SideToolBar from './SideToolBar'
import ExportToCsvIcon from '@/components/svg/exportToCsv'
import ClipboardIcon from '@/components/svg/clipboard'
import IconButton from '@/components/IconButton'
import csv from '@/lib/csv'
import fIo from '@/lib/utils/fileIo'
import cIo from '@/lib/utils/clipboardIo'
import time from '@/lib/utils/time'
import loadingDialog from '@/components/LoadingDialog'
import events from '@/lib/utils/events'

export default {
  name: 'RunResult',
  props: ['result', 'isGettingResults', 'error', 'time'],
  data () {
    return {
      resizeObserver: null,
      pageSize: 20,
      preparingCopy: false,
      dataToCopy: null
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
    loadingDialog
  },
  mounted () {
    this.resizeObserver = new ResizeObserver(this.handleResize)
    this.resizeObserver.observe(this.$refs.runResultPanel)
    this.calculatePageSize()
  },
  beforeDestroy () {
    this.resizeObserver.unobserve(this.$refs.runResultPanel)
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
      cIo.copyCsv(this.dataToCopy)
      this.$modal.hide('prepareCSVCopy')
    },

    cancelCopy () {
      this.dataToCopy = null
      this.$modal.hide('prepareCSVCopy')
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
  position: relative;
  flex-grow: 1;
  height: 100%;
  width: 0;
  box-sizing: border-box;
}

.table-preview {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-text-base);
  font-size: 13px;
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
