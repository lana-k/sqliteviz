<template>
  <div class="data-view-panel">
    <div class="data-view-panel-content">
      <component
        :is="mode"
        :init-options="mode === initMode ? initOptions : undefined"
        :data-sources="dataSource"
        :import-to-png-enabled.sync="importToPngEnabled"
        @loadingImageCompleted="loadingImage = false"
        ref="viewComponent"
        @update="$emit('update')"
      />
    </div>
    <side-tool-bar panel="dataView" @switchTo="$emit('switchTo', $event)">
      <icon-button
        :active="mode === 'chart'"
        @click="mode = 'chart'"
        tooltip="Switch to chart"
        tooltip-position="top-left"
      >
        <chart-icon />
      </icon-button>
      <icon-button
        :active="mode === 'pivot'"
        @click="mode = 'pivot'"
        tooltip="Switch to pivot"
        tooltip-position="top-left"
      >
        <pivot-icon />
      </icon-button>

      <div class="side-tool-bar-divider"/>

      <icon-button
        :disabled="!importToPngEnabled || loadingImage"
        :loading="loadingImage"
        tooltip="Save as PNG image"
        tooltip-position="top-left"
        @click="saveAsPng"
      >
        <png-icon />
      </icon-button>
    </side-tool-bar>
  </div>
</template>

<script>
import Chart from './Chart'
import Pivot from './Pivot'
import SideToolBar from '../SideToolBar'
import IconButton from '@/components/IconButton'
import ChartIcon from '@/components/svg/chart'
import PivotIcon from '@/components/svg/pivot'
import PngIcon from '@/components/svg/png'

export default {
  name: 'DataView',
  props: ['dataSource', 'initOptions', 'initMode'],
  components: {
    Chart,
    Pivot,
    SideToolBar,
    IconButton,
    ChartIcon,
    PivotIcon,
    PngIcon
  },
  data () {
    return {
      mode: this.initMode || 'chart',
      importToPngEnabled: true,
      loadingImage: false
    }
  },
  watch: {
    mode () {
      this.$emit('update')
      this.importToPngEnabled = true
    }
  },
  methods: {
    async saveAsPng () {
      this.loadingImage = true
      /*
      setTimeout does its thing by putting its callback on the callback queue. The callback queue is only called by the browser after both the call stack and the render queue are done. So our animation (which is on the call stack) gets done, the render queue renders it, and then the browser is ready for the callback queue and calls the long-calculation.

      nextTick allows you to do something after you have changed the data and VueJS has updated the DOM based on your data change, but before the browser has rendered those changed on the page.

      Lees meer van Katinka Hesselink: http://www.hesselinkwebdesign.nl/2019/nexttick-vs-settimeout-in-vue/

      */
      setTimeout(() => {
        this.$refs.viewComponent.saveAsPng()
      }, 0)
    },
    getOptionsForSave () {
      return this.$refs.viewComponent.getOptionsForSave()
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
