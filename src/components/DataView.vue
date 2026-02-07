<template>
  <div class="data-view-panel">
    <div class="data-view-panel-content">
      <component
        :is="mode"
        ref="viewComponent"
        v-model:exportToPngEnabled="exportToPngEnabled"
        v-model:exportToSvgEnabled="exportToSvgEnabled"
        v-model:exportToHtmlEnabled="exportToHtmlEnabled"
        v-model:exportToClipboardEnabled="exportToClipboardEnabled"
        :initOptions="initOptionsByMode[mode]"
        :data-sources="dataSource"
        :showViewSettings="showViewSettings"
        :showValueViewer="viewValuePanelVisible"
        @loading-image-completed="loadingImage = false"
        @update="$emit('update')"
      />
    </div>
    <side-tool-bar panel="dataView" @switch-to="$emit('switchTo', $event)">
      <icon-button
        ref="chartBtn"
        :active="mode === 'chart'"
        tooltip="Switch to chart"
        tooltipPosition="top-left"
        @click="mode = 'chart'"
      >
        <chart-icon />
      </icon-button>
      <icon-button
        ref="pivotBtn"
        :active="mode === 'pivot'"
        tooltip="Switch to pivot"
        tooltipPosition="top-left"
        @click="mode = 'pivot'"
      >
        <pivot-icon />
      </icon-button>
      <icon-button
        ref="graphBtn"
        :active="mode === 'graph'"
        tooltip="Switch to graph"
        tooltipPosition="top-left"
        @click="mode = 'graph'"
      >
        <graph-icon />
      </icon-button>

      <div class="side-tool-bar-divider" />

      <icon-button
        ref="settingsBtn"
        :active="showViewSettings"
        tooltip="Toggle visualisation settings visibility"
        tooltipPosition="top-left"
        @click="showViewSettings = !showViewSettings"
      >
        <settings-icon />
      </icon-button>

      <icon-button
        v-if="mode === 'graph'"
        ref="viewNodeOrEdgeBtn"
        tooltip="View node or edge details"
        tooltipPosition="top-left"
        :active="viewValuePanelVisible"
        @click="viewValuePanelVisible = !viewValuePanelVisible"
      >
        <view-cell-value-icon />
      </icon-button>

      <div class="side-tool-bar-divider" />

      <icon-button
        ref="pngExportBtn"
        :disabled="!exportToPngEnabled || loadingImage"
        :loading="loadingImage"
        tooltip="Save as PNG image"
        tooltipPosition="top-left"
        @click="saveAsPng"
      >
        <png-icon />
      </icon-button>
      <icon-button
        ref="svgExportBtn"
        :disabled="!exportToSvgEnabled"
        tooltip="Save as SVG"
        tooltipPosition="top-left"
        @click="saveAsSvg"
      >
        <export-to-svg-icon />
      </icon-button>

      <icon-button
        ref="htmlExportBtn"
        :disabled="!exportToHtmlEnabled"
        tooltip="Save as HTML"
        tooltipPosition="top-left"
        @click="saveAsHtml"
      >
        <HtmlIcon />
      </icon-button>
      <icon-button
        ref="copyToClipboardBtn"
        :disabled="!exportToClipboardEnabled"
        :loading="copyingImage"
        tooltip="Copy visualisation to clipboard"
        tooltipPosition="top-left"
        @click="prepareCopy"
      >
        <clipboard-icon />
      </icon-button>
    </side-tool-bar>

    <loading-dialog
      v-model="showLoadingDialog"
      loadingMsg="Rendering the visualisation..."
      successMsg="Image is ready"
      actionBtnName="Copy"
      title="Copy to clipboard"
      :loading="preparingCopy"
      @action="copyToClipboard"
      @cancel="cancelCopy"
    />
  </div>
</template>

<script>
import Chart from '@/components/Chart.vue'
import Pivot from '@/components/Pivot'
import Graph from '@/components/Graph/index.vue'
import SideToolBar from '@/components/SideToolBar'
import IconButton from '@/components/Common/IconButton'
import ChartIcon from '@/components/svg/chart'
import PivotIcon from '@/components/svg/pivot'
import GraphIcon from '@/components/svg/graph.vue'
import SettingsIcon from '@/components/svg/settings.vue'
import HtmlIcon from '@/components/svg/html'
import ExportToSvgIcon from '@/components/svg/exportToSvg'
import PngIcon from '@/components/svg/png'
import ClipboardIcon from '@/components/svg/clipboard'
import ViewCellValueIcon from '@/components/svg/viewCellValue'
import cIo from '@/lib/utils/clipboardIo'
import loadingDialog from '@/components/Common/LoadingDialog.vue'
import time from '@/lib/utils/time'
import events from '@/lib/utils/events'

export default {
  name: 'DataView',
  components: {
    Chart,
    Pivot,
    Graph,
    SideToolBar,
    IconButton,
    ChartIcon,
    PivotIcon,
    GraphIcon,
    SettingsIcon,
    ExportToSvgIcon,
    ViewCellValueIcon,
    PngIcon,
    HtmlIcon,
    ClipboardIcon,
    loadingDialog
  },
  props: {
    dataSource: Object,
    initOptions: Object,
    initMode: String
  },
  emits: ['update', 'switchTo'],
  data() {
    return {
      mode: this.initMode || 'chart',
      exportToPngEnabled: true,
      exportToSvgEnabled: true,
      exportToHtmlEnabled: true,
      exportToClipboardEnabled: true,
      loadingImage: false,
      copyingImage: false,
      preparingCopy: false,
      dataToCopy: null,
      initOptionsByMode: {
        chart: this.initMode === 'chart' ? this.initOptions : null,
        pivot: this.initMode === 'pivot' ? this.initOptions : null,
        graph: this.initMode === 'graph' ? this.initOptions : null
      },
      showLoadingDialog: false,
      showViewSettings: true,
      viewValuePanelVisible: false
    }
  },
  computed: {
    plotlyInPivot() {
      return this.mode === 'pivot' && this.$refs.viewComponent.viewCustomChart
    }
  },
  watch: {
    mode(newMode, oldMode) {
      this.$emit('update')
      this.exportToPngEnabled = true
      this.exportToClipboardEnabled = true
      this.initOptionsByMode[oldMode] = this.getOptionsForSave()
    }
  },
  methods: {
    async saveAsPng() {
      this.loadingImage = true
      /*
      setTimeout does its thing by putting its callback on the callback queue.
      The callback queue is only called by the browser after both the call stack
      and the render queue are done. So our animation (which is on the call stack) gets done,
      the render queue renders it, and then the browser is ready for the callback queue
      and calls the long-calculation.

      nextTick allows you to do something after you have changed the data
      and VueJS has updated the DOM based on your data change,
      but before the browser has rendered those changed on the page.

      http://www.hesselinkwebdesign.nl/2019/nexttick-vs-settimeout-in-vue/

      */
      await time.sleep(0)
      this.$refs.viewComponent.saveAsPng()
      this.exportSignal('png')
    },
    getOptionsForSave() {
      return this.$refs.viewComponent.getOptionsForSave()
    },
    async prepareCopy() {
      if ('ClipboardItem' in window) {
        this.preparingCopy = true
        this.showLoadingDialog = true
        const t0 = performance.now()

        await time.sleep(0)
        this.dataToCopy = await this.$refs.viewComponent.prepareCopy()
        const t1 = performance.now()
        if (t1 - t0 < 950) {
          this.copyToClipboard()
        } else {
          this.preparingCopy = false
        }
      } else {
        alert(
          "Your browser doesn't support copying images into the clipboard. " +
            'If you use Firefox you can enable it ' +
            'by setting dom.events.asyncClipboard.clipboardItem to true.'
        )
      }
    },
    copyToClipboard() {
      cIo.copyImage(this.dataToCopy)
      this.showLoadingDialog = false
      this.exportSignal('clipboard')
    },
    cancelCopy() {
      this.dataToCopy = null
    },

    saveAsSvg() {
      this.$refs.viewComponent.saveAsSvg()
      this.exportSignal('svg')
    },
    saveAsHtml() {
      this.$refs.viewComponent.saveAsHtml()
      this.exportSignal('html')
    },
    exportSignal(to) {
      const eventLabels = { type: to }

      if (this.mode === 'chart' || this.plotlyInPivot) {
        eventLabels.pivot = this.plotlyInPivot
      }

      events.send(
        this.mode === 'chart' || this.plotlyInPivot
          ? 'viz_plotly.export'
          : this.mode === 'graph'
            ? 'viz_graph.export'
            : 'viz_pivot.export',
        null,
        eventLabels
      )
    }
  }
}
</script>

<style scoped>
.data-view-panel {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.data-view-panel-content {
  position: relative;
  flex-grow: 1;
  width: calc(100% - 39px);
  height: 100%;
  overflow: auto;
}
</style>
