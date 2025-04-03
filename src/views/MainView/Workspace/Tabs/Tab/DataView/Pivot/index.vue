<template>
  <div class="pivot-container">
    <div v-show="!dataSources" class="warning pivot-warning">
      There is no data to build a pivot. Run your SQL query and make sure the
      result is not empty.
    </div>
    <pivot-ui
      v-model="pivotOptions"
      :keyNames="columns"
      @update="$emit('update')"
    />
    <div ref="pivotOutput" class="pivot-output" />
    <div
      v-show="viewCustomChart"
      ref="customChartOutput"
      class="custom-chart-output"
    >
      <chart
        ref="customChart"
        v-bind="customChartComponentProps"
        @update="$emit('update')"
        @loading-image-completed="$emit('loadingImageCompleted')"
      />
    </div>
  </div>
</template>

<script>
import fIo from '@/lib/utils/fileIo'
import $ from 'jquery'
import 'pivottable'
import 'pivottable/dist/pivot.css'
import PivotUi from './PivotUi'
import pivotHelper from './pivotHelper'
import Chart from '@/views/MainView/Workspace/Tabs/Tab/DataView/Chart'
import chartHelper from '@/lib/chartHelper'
import events from '@/lib/utils/events'
import plotly from 'plotly.js'

export default {
  name: 'Pivot',
  components: {
    PivotUi,
    Chart
  },
  props: {
    dataSources: Object,
    initOptions: Object,
    importToPngEnabled: Boolean,
    importToSvgEnabled: Boolean
  },
  emits: [
    'loadingImageCompleted',
    'update',
    'update:importToSvgEnabled',
    'update:importToPngEnabled'
  ],
  data() {
    return {
      resizeObserver: null,
      pivotOptions: !this.initOptions
        ? {
            rows: [],
            cols: [],
            colOrder: 'key_a_to_z',
            rowOrder: 'key_a_to_z',
            aggregatorName: 'Count',
            aggregator: $.pivotUtilities.aggregators.Count(),
            vals: [],
            rendererName: 'Table',
            renderer: $.pivotUtilities.renderers.Table
          }
        : {
            rows: this.initOptions.rows,
            cols: this.initOptions.cols,
            colOrder: this.initOptions.colOrder,
            rowOrder: this.initOptions.rowOrder,
            aggregatorName: this.initOptions.aggregatorName,
            aggregator: $.pivotUtilities.aggregators[
              this.initOptions.aggregatorName
            ](this.initOptions.vals),
            vals: this.initOptions.vals,
            rendererName: this.initOptions.rendererName,
            renderer: $.pivotUtilities.renderers[this.initOptions.rendererName]
          },
      customChartComponentProps: {
        initOptions: this.initOptions?.rendererOptions?.customChartOptions,
        forPivot: true
      }
    }
  },
  computed: {
    columns() {
      return Object.keys(this.dataSources || {})
    },

    viewStandartChart() {
      return this.pivotOptions.rendererName in $.pivotUtilities.plotly_renderers
    },

    viewCustomChart() {
      return this.pivotOptions.rendererName === 'Custom chart'
    }
  },
  watch: {
    dataSources() {
      this.show()
    },
    'pivotOptions.rendererName': {
      immediate: true,
      handler() {
        this.$emit(
          'update:importToPngEnabled',
          this.pivotOptions.rendererName !== 'TSV Export'
        )
        this.$emit(
          'update:importToSvgEnabled',
          this.viewStandartChart || this.viewCustomChart
        )
        events.send('viz_pivot.render', null, {
          type: this.pivotOptions.rendererName
        })
      }
    },
    pivotOptions() {
      this.show()
    }
  },
  mounted() {
    this.show()
    // We need to detect resizing because plotly doesn't resize when resize its container
    // but it resize on window.resize (we will trigger it manualy in order to make plotly resize)
    this.resizeObserver = new ResizeObserver(this.handleResize)
    this.resizeObserver.observe(this.$refs.pivotOutput)
  },
  beforeUnmount() {
    this.resizeObserver.unobserve(this.$refs.pivotOutput)
  },
  methods: {
    handleResize() {
      // hack: plotly changes size only on window.resize event,
      // so, we resize it manually when container resizes (e.g. when move splitter)
      if (this.viewStandartChart) {
        plotly.Plots.resize(
          this.$refs.pivotOutput.querySelector('.js-plotly-plot')
        )
      }
    },

    show() {
      const options = { ...this.pivotOptions }
      if (this.viewStandartChart) {
        options.rendererOptions = {
          plotly: {
            autosize: true,
            width: null,
            height: null
          },
          plotlyConfig: {
            displaylogo: false,
            responsive: true,
            modeBarButtonsToRemove: ['toImage']
          }
        }
      }

      if (this.viewCustomChart) {
        options.rendererOptions = {
          getCustomComponentsProps: () => this.customChartComponentProps
        }
      }

      $(this.$refs.pivotOutput).pivot(
        function (callback) {
          const rowCount = !this.dataSources
            ? 0
            : this.dataSources[this.columns[0]].length
          for (let i = 1; i <= rowCount; i++) {
            const row = {}
            this.columns.forEach(col => {
              row[col] = this.dataSources[col][i - 1]
            })
            callback(row)
          }
        }.bind(this),
        options
      )

      // fix for Firefox: fit plotly renderers just after choosing it in pivotUi
      this.handleResize()
    },

    getOptionsForSave() {
      const options = { ...this.pivotOptions }
      if (this.viewCustomChart) {
        const chartComponent = this.$refs.customChart
        options.rendererOptions = {
          customChartOptions: chartComponent.getOptionsForSave()
        }
      }
      return options
    },

    async saveAsPng() {
      if (this.viewCustomChart) {
        this.$refs.customChart.saveAsPng()
      } else {
        const source = this.viewStandartChart
          ? await chartHelper.getImageDataUrl(this.$refs.pivotOutput, 'png')
          : (
              await pivotHelper.getPivotCanvas(this.$refs.pivotOutput)
            ).toDataURL('image/png')

        this.$emit('loadingImageCompleted')
        fIo.downloadFromUrl(source, 'pivot')
      }
    },

    async prepareCopy() {
      if (this.viewCustomChart) {
        return await this.$refs.customChart.prepareCopy()
      }
      if (this.viewStandartChart) {
        return await chartHelper.getImageDataUrl(this.$refs.pivotOutput, 'png')
      }
      return await pivotHelper.getPivotCanvas(this.$refs.pivotOutput)
    },

    async saveAsSvg() {
      if (this.viewCustomChart) {
        this.$refs.customChart.saveAsSvg()
      } else if (this.viewStandartChart) {
        const url = await chartHelper.getImageDataUrl(
          this.$refs.pivotOutput,
          'svg'
        )
        fIo.downloadFromUrl(url, 'pivot')
      }
    },

    saveAsHtml() {
      if (this.viewCustomChart) {
        this.$refs.customChart.saveAsHtml()
        return
      }

      if (this.viewStandartChart) {
        const chartState = chartHelper.getChartData(this.$refs.pivotOutput)
        fIo.exportToFile(
          chartHelper.getHtml(chartState),
          'chart.html',
          'text/html'
        )
        return
      }
      fIo.exportToFile(
        pivotHelper.getPivotHtml(this.$refs.pivotOutput),
        'pivot.html',
        'text/html'
      )
    }
  }
}
</script>

<style scoped>
.pivot-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--color-white);
}

.pivot-output,
.custom-chart-output {
  flex-grow: 1;
  width: 100%;
  overflow: auto;
}

.pivot-warning {
  height: 40px;
  line-height: 40px;
  box-sizing: border-box;
}
:deep(.pvtTable) {
  min-width: 100%;
}

:deep(table.pvtTable tbody tr td),
:deep(table.pvtTable thead tr th),
:deep(table.pvtTable tbody tr th) {
  border-color: var(--color-border-light);
}
:deep(table.pvtTable thead tr th),
:deep(table.pvtTable tbody tr th) {
  background-color: var(--color-bg-dark);
  color: var(--color-text-light);
}

:deep(table.pvtTable tbody tr td) {
  color: var(--color-text-base);
}

.pivot-output :deep(textarea) {
  color: var(--color-text-base);
  min-width: 100%;
  height: 100% !important;
  display: block;
  box-sizing: border-box;
  border-width: 0;
}

.pivot-output :deep(textarea:focus-visible) {
  outline: none;
}
.pivot-output:empty {
  flex-grow: 0;
}
</style>
