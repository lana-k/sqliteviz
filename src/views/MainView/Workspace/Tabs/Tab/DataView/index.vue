<template>
  <div class="data-view-panel">
    <div class="data-view-panel-content">
      <component
        :is="mode"
        ref="viewComponent"
        v-model:importToPngEnabled="importToPngEnabled"
        v-model:importToSvgEnabled="importToSvgEnabled"
        :initOptions="mode === initMode ? initOptions : undefined"
        :data-sources="dataSource"
        @loading-image-completed="loadingImage = false"
        @update="$emit('update')"
      />
    </div>
    <side-tool-bar panel="dataView" @switch-to="$emit('switchTo', $event)">
      <icon-button
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

      <div class="side-tool-bar-divider" />

      <icon-button
        :disabled="!importToPngEnabled || loadingImage"
        :loading="loadingImage"
        tooltip="Save as PNG image"
        tooltipPosition="top-left"
        @click="saveAsPng"
      >
        <png-icon />
      </icon-button>
      <icon-button
        ref="svgExportBtn"
        :disabled="!importToSvgEnabled"
        tooltip="Save as SVG"
        tooltipPosition="top-left"
        @click="saveAsSvg"
      >
        <export-to-svg-icon />
      </icon-button>

      <icon-button
        ref="htmlExportBtn"
        tooltip="Save as HTML"
        tooltipPosition="top-left"
        @click="saveAsHtml"
      >
        <HtmlIcon />
      </icon-button>
      <icon-button
        ref="copyToClipboardBtn"
        :loading="copyingImage"
        tooltip="Copy visualisation to clipboard"
        tooltipPosition="top-left"
        @click="prepareCopy"
      >
        <clipboard-icon />
      </icon-button>
    </side-tool-bar>

    <loading-dialog
      loadingMsg="Rendering the visualisation..."
      successMsg="Image is ready"
      actionBtnName="Copy"
      name="prepareCopy"
      title="Copy to clipboard"
      :loading="preparingCopy"
      @action="copyToClipboard"
      @cancel="cancelCopy"
    />
  </div>
</template>

<script>
import Chart from './Chart'
import Pivot from './Pivot'
import SideToolBar from '../SideToolBar'
import IconButton from '@/components/IconButton'
import ChartIcon from '@/components/svg/chart'
import PivotIcon from '@/components/svg/pivot'
import HtmlIcon from '@/components/svg/html'
import ExportToSvgIcon from '@/components/svg/exportToSvg'
import PngIcon from '@/components/svg/png'
import ClipboardIcon from '@/components/svg/clipboard'
import cIo from '@/lib/utils/clipboardIo'
import loadingDialog from '@/components/LoadingDialog'
import time from '@/lib/utils/time'
import events from '@/lib/utils/events'

export default {
  name: 'DataView',
  components: {
    Chart,
    Pivot,
    SideToolBar,
    IconButton,
    ChartIcon,
    PivotIcon,
    ExportToSvgIcon,
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
      importToPngEnabled: true,
      importToSvgEnabled: true,
      loadingImage: false,
      copyingImage: false,
      preparingCopy: false,
      dataToCopy: null
    }
  },
  computed: {
    plotlyInPivot() {
      return this.mode === 'pivot' && this.$refs.viewComponent.viewCustomChart
    }
  },
  watch: {
    mode() {
      this.$emit('update')
      this.importToPngEnabled = true
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
        this.$modal.show('prepareCopy')
        const t0 = performance.now()

        await time.sleep(0)
        this.dataToCopy = await this.$refs.viewComponent.prepareCopy()
        const t1 = performance.now()
        if (t1 - t0 < 950) {
          this.$modal.hide('prepareCopy')
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
    async copyToClipboard() {
      cIo.copyImage(this.dataToCopy)
      this.$modal.hide('prepareCopy')
      this.exportSignal('clipboard')
    },
    cancelCopy() {
      this.dataToCopy = null
      this.$modal.hide('prepareCopy')
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
