<template>
  <div v-show="visible" class="chart-container" ref="chartContainer">
    <div class="warning chart-warning" v-show="!dataSources && visible">
      There is no data to build a chart. Run your SQL query and make sure the result is not empty.
    </div>
    <PlotlyEditor
      :data="state.data"
      :layout="state.layout"
      :frames="state.frames"
      :config="{ editable: true, displaylogo: false, modeBarButtonsToRemove: ['toImage'] }"
      :dataSources="dataSources"
      :dataSourceOptions="dataSourceOptions"
      :plotly="plotly"
      @onUpdate="update"
      @onRender="onRender"
      :useResizeHandler="true"
      :debug="true"
      :advancedTraceTypeSelector="true"
      class="chart"
      ref="plotlyEditor"
      :style="{ height: !dataSources ? 'calc(100% - 40px)' : '100%' }"
    />
</div>
</template>

<script>
import plotly from 'plotly.js'
import 'react-chart-editor/lib/react-chart-editor.min.css'

import PlotlyEditor from 'react-chart-editor'
import chartHelper from '@/lib/chartHelper'
import dereference from 'react-chart-editor/lib/lib/dereference'
import fIo from '@/lib/utils/fileIo'
import events from '@/lib/utils/events'

export default {
  name: 'Chart',
  props: [
    'dataSources', 'initOptions',
    'importToPngEnabled', 'importToSvgEnabled',
    'forPivot'
  ],
  components: {
    PlotlyEditor
  },
  data () {
    return {
      plotly: plotly,
      state: this.initOptions || {
        data: [],
        layout: {},
        frames: []
      },
      visible: true,
      resizeObserver: null
    }
  },
  computed: {
    dataSourceOptions () {
      return chartHelper.getOptionsFromDataSources(this.dataSources)
    }
  },
  created () {
    // https://github.com/plotly/plotly.js/issues/4555
    plotly.setPlotConfig({
      notifyOnLogging: 1
    })
    this.$watch(
      () => this.state.data.map(trace => `${trace.type}-${trace.mode}`)
        .join(','),
      (value) => {
        events.send('viz_plotly.render', null, {
          type: value,
          pivot: !!this.forPivot
        })
      },
      { deep: true }
    )
  },
  mounted () {
    this.resizeObserver = new ResizeObserver(this.handleResize)
    this.resizeObserver.observe(this.$refs.chartContainer)
  },
  beforeDestroy () {
    this.resizeObserver.unobserve(this.$refs.chartContainer)
  },
  watch: {
    dataSources () {
      // we need to update state.data in order to update the graph
      // https://github.com/plotly/react-chart-editor/issues/948
      if (this.dataSources) {
        dereference(this.state.data, this.dataSources)
      }
    }
  },
  methods: {
    handleResize () {
      this.visible = false
      this.$nextTick(() => {
        this.visible = true
      })
    },
    onRender (data, layout, frames) {
      // TODO: check changes and enable Save button if needed
    },
    update (data, layout, frames) {
      this.state = { data, layout, frames }
      this.$emit('update')
    },
    getOptionsForSave () {
      return chartHelper.getOptionsForSave(this.state, this.dataSources)
    },
    async saveAsPng () {
      const url = await this.prepareCopy()
      this.$emit('loadingImageCompleted')
      fIo.downloadFromUrl(url, 'chart')
    },

    async saveAsSvg () {
      const url = await this.prepareCopy('svg')
      fIo.downloadFromUrl(url, 'chart')
    },

    saveAsHtml () {
      fIo.exportToFile(
        chartHelper.getHtml(this.state),
        'chart.html',
        'text/html'
      )
    },
    async prepareCopy (type = 'png') {
      return await chartHelper.getImageDataUrl(this.$refs.plotlyEditor.$el, type)
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

>>> .editor_controls .sidebar__item:before {
  width: 0;
}
</style>
