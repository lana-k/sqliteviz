<template>
  <div ref="graphContainer" class="graph-container">
    <div v-show="!dataSources" class="warning data-view-warning no-data">
      There is no data to build a graph. Run your SQL query and make sure the
      result is not empty.
    </div>
    <div
      v-show="!dataSourceIsValid"
      class="warning data-view-warning invalid-data"
    >
      Result set is invalid for graph visualisation. Learn more in
      <a href="https://sqliteviz.com/docs/graph/" target="_blank">
        documentation</a
      >.
    </div>
    <splitpanes
      :before="{ size: 70, max: 100 }"
      :after="{ size: 30, max: 50, hidden: !showValueViewer }"
      :default="{ before: 70, after: 30 }"
      class="graph"
      :style="{
        height:
          !dataSources || !dataSourceIsValid ? 'calc(100% - 40px)' : '100%'
      }"
    >
      <template #left-pane>
        <div :style="{ height: '100%' }" ref="graphEditorContainer">
          <GraphEditor
            ref="graphEditor"
            :dataSources="dataSources"
            :initOptions="initOptions"
            :showViewSettings="showViewSettings"
            @update="$emit('update')"
            @selectItem="selectedItem = $event"
            @clearSelection="selectedItem = null"
          />
        </div>
      </template>
      <template v-if="showValueViewer" #right-pane>
        <value-viewer
          :empty="!selectedItem"
          empty-message="No node or edge selected to view"
          :value="JSON.stringify(selectedItem)"
          default-format="json"
        />
      </template>
    </splitpanes>
  </div>
</template>

<script>
import 'react-chart-editor/lib/react-chart-editor.css'
import GraphEditor from '@/components/Graph/GraphEditor.vue'
import { dataSourceIsValid } from '@/lib/graphHelper'
import ValueViewer from '@/components/ValueViewer.vue'
import Splitpanes from '@/components/Common/Splitpanes'

export default {
  name: 'Graph',
  components: { GraphEditor, ValueViewer, Splitpanes },
  props: {
    dataSources: Object,
    initOptions: Object,
    exportToPngEnabled: Boolean,
    exportToSvgEnabled: Boolean,
    exportToHtmlEnabled: Boolean,
    showViewSettings: Boolean,
    showValueViewer: Boolean
  },
  emits: [
    'update:exportToSvgEnabled',
    'update:exportToHtmlEnabled',
    'update:exportToPngEnabled',
    'update:exportToClipboardEnabled',
    'update',
    'loadingImageCompleted'
  ],
  data() {
    return {
      resizeObserver: null,
      selectedItem: null
    }
  },
  computed: {
    dataSourceIsValid() {
      return !this.dataSources || dataSourceIsValid(this.dataSources)
    }
  },
  watch: {
    async showViewSettings() {
      await this.$nextTick()
      this.handleResize()
    },
    dataSources() {
      this.$emit('update:exportToPngEnabled', !!this.dataSources)
      this.$emit('update:exportToClipboardEnabled', !!this.dataSources)
    }
  },
  created() {
    this.$emit('update:exportToSvgEnabled', false)
    this.$emit('update:exportToHtmlEnabled', false)
    this.$emit('update:exportToPngEnabled', !!this.dataSources)
    this.$emit('update:exportToClipboardEnabled', !!this.dataSources)
  },
  mounted() {
    this.resizeObserver = new ResizeObserver(this.handleResize)
    this.resizeObserver.observe(this.$refs.graphEditorContainer)
  },
  beforeUnmount() {
    this.resizeObserver.unobserve(this.$refs.graphEditorContainer)
  },
  methods: {
    getOptionsForSave() {
      return this.$refs.graphEditor.settings
    },
    async saveAsPng() {
      await this.$refs.graphEditor.saveAsPng()
      this.$emit('loadingImageCompleted')
    },
    prepareCopy() {
      return this.$refs.graphEditor.prepareCopy()
    },
    async handleResize() {
      const renderer = this.$refs.graphEditor?.renderer
      if (renderer) {
        renderer.refresh()
        renderer.getCamera().animatedReset({ duration: 600 })
      }
    }
  }
}
</script>

<style scoped>
.graph-container {
  height: 100%;
}

.graph {
  min-height: 242px;
}

:deep(.editor_controls .sidebar__item:before) {
  width: 0;
}
</style>
