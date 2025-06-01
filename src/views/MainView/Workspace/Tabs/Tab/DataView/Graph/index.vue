<template>
  <div ref="graphContainer" class="chart-container">
    <div v-show="!dataSources" class="warning chart-warning">
      There is no data to build a graph. Run your SQL query and make sure the
      result is not empty.
    </div>
    <div
      class="graph"
      :style="{
        height: !dataSources ? 'calc(100% - 40px)' : '100%',
        'background-color': 'white'
      }"
    >
      <GraphEditor :dataSources="dataSources" />
    </div>
  </div>
</template>

<script>
import 'react-chart-editor/lib/react-chart-editor.css'
import fIo from '@/lib/utils/fileIo'
import events from '@/lib/utils/events'

import GraphEditor from './GraphEditor.vue'

export default {
  name: 'Graph',
  components: { GraphEditor },
  props: {
    dataSources: Object,
    initOptions: Object,
    importToPngEnabled: Boolean,
    importToSvgEnabled: Boolean
  },
  emits: ['update:importToSvgEnabled', 'update', 'loadingImageCompleted'],

  created() {
    this.$emit('update:importToSvgEnabled', true)
  },
  mounted() {},
  methods: {
    getOptionsForSave() {},
    async saveAsPng() {
      const url = await this.prepareCopy()
      this.$emit('loadingImageCompleted')
      fIo.downloadFromUrl(url, 'chart')
    },

    async saveAsSvg() {
      const url = await this.prepareCopy('svg')
      fIo.downloadFromUrl(url, 'chart')
    },

    saveAsHtml() {},
    async prepareCopy(type = 'png') {}
  }
}
</script>

<style scoped>
.chart-container {
  height: 100%;
}

.chart-warning {
  height: 40px;
  line-height: 40px;
  border-bottom: 1px solid var(--color-border);
  box-sizing: border-box;
}

.chart {
  min-height: 242px;
}

:deep(.editor_controls .sidebar__item:before) {
  width: 0;
}
</style>
