<template>
  <div ref="graphContainer" class="chart-container">
    <div v-show="!dataSources" class="warning chart-warning">
      There is no data to build a graph. Run your SQL query and make sure the
      result is not empty.
    </div>
    <div
      class="graph"
      :style="{
        height: !dataSources ? 'calc(100% - 40px)' : '100%'
      }"
    >
      <GraphEditor
        ref="graphEditor"
        :dataSources="dataSources"
        :initOptions="initOptions"
        @update="$emit('update')"
      />
    </div>
  </div>
</template>

<script>
import 'react-chart-editor/lib/react-chart-editor.css'
import events from '@/lib/utils/events'
import GraphEditor from './GraphEditor.vue'

export default {
  name: 'Graph',
  components: { GraphEditor },
  props: {
    dataSources: Object,
    initOptions: Object,
    exportToPngEnabled: Boolean,
    exportToSvgEnabled: Boolean,
    exportToHtmlEnabled: Boolean
  },
  emits: [
    'update:exportToSvgEnabled',
    'update:exportToHtmlEnabled',
    'update',
    'loadingImageCompleted'
  ],
  data() {
    return {
      resizeObserver: null
    }
  },

  created() {
    this.$emit('update:exportToSvgEnabled', false)
    this.$emit('update:exportToHtmlEnabled', false)
  },
  mounted() {
    this.resizeObserver = new ResizeObserver(this.handleResize)
    this.resizeObserver.observe(this.$refs.graphContainer)
  },
  beforeUnmount() {
    this.resizeObserver.unobserve(this.$refs.graphContainer)
  },
  methods: {
    getOptionsForSave() {
      return this.$refs.graphEditor.settings
    },
    async saveAsPng() {
      await this.$refs.graphEditor.saveAsPng()
      this.$emit('loadingImageCompleted')
    },
    async prepareCopy() {
      return await this.$refs.graphEditor.prepareCopy()
    },
    async handleResize() {
      const renderer = this.$refs.graphEditor.renderer
      renderer.refresh()
      renderer.getCamera().setState({ x: 0.5, y: 0.5 })
    }
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
