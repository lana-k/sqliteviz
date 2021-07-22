<template>
<div class="pivot-container">
  <div class="warning pivot-warning" v-show="!dataSources">
    There is no data to build a pivot. Run your SQL query and make sure the result is not empty.
  </div>
  <pivot-ui :key-names="columns" v-model="pivotOptions" @update="$emit('update')"/>
  <div ref="pivotOutput" class="pivot-output"/>
</div>
</template>

<script>
import $ from 'jquery'
import 'pivottable'
import 'pivottable/dist/pivot.css'
import PivotUi from './PivotUi'
import Chart from '@/views/Main/Editor/Tabs/Tab/DataView/Chart'
import Vue from 'vue'
const ChartClass = Vue.extend(Chart)

export default {
  name: 'pivot',
  props: ['dataSources', 'initOptions'],
  components: {
    PivotUi
  },
  data () {
    return {
      pivotOptions: !this.initOptions ? {} : {
        rows: this.initOptions.rows,
        cols: this.initOptions.cols,
        colOrder: this.initOptions.colOrder,
        rowOrder: this.initOptions.rowOrder,
        aggregatorName: this.initOptions.aggregatorName,
        aggregator: $.pivotUtilities.aggregators[this.initOptions.aggregatorName](this.initOptions.vals),
        vals: this.initOptions.vals,
        rendererName: this.initOptions.rendererName,
        renderer: $.pivotUtilities.renderers[this.initOptions.rendererName],
        rendererOptions: !this.initOptions.rendererOptions ? {} : {
          customChartComponent: new ChartClass({
            propsData: { initOptions: this.initOptions.rendererOptions.customChartOptions }
          })
        }
      }
    }
  },
  computed: {
    columns () {
      return Object.keys(this.dataSources || {})
    }
  },
  watch: {
    dataSources () {
      this.show()
    },
    pivotOptions () {
      this.show()
    }
  },
  mounted () {
    this.show()
  },
  methods: {
    show () {
      if (!this.dataSources) {
        return
      }

      $(this.$refs.pivotOutput).pivot(
        function (callback) {
          const rowCount = this.dataSources[this.columns[0]].length
          for (let i = 1; i <= rowCount; i++) {
            const row = {}
            this.columns.forEach(col => {
              row[col] = this.dataSources[col][i - 1]
            })
            callback(row)
          }
        }.bind(this),
        this.pivotOptions
      )
    },
    getOptionsForSave () {
      const options = { ...this.pivotOptions }
      if (options.rendererOptions) {
        const chartComponent = this.pivotOptions.rendererOptions.customChartComponent
        options.rendererOptions = {
          customChartOptions: chartComponent.getOptionsForSave()
        }
      }

      return options
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

.pivot-output {
  flex-grow: 1;
  width: 100%;
  overflow: auto;
}

.pivot-warning {
  height: 40px;
  line-height: 40px;
  box-sizing: border-box;
}
>>> .pvtTable {
  min-width: 100%;
}

>>> table.pvtTable tbody tr td,
>>> table.pvtTable thead tr th,
>>> table.pvtTable tbody tr th {
  border-color: var(--color-border-light);
}
>>> table.pvtTable thead tr th,
>>> table.pvtTable tbody tr th {
  background-color: var(--color-bg-dark);
  color: var(--color-text-light);
}

>>> table.pvtTable tbody tr td {
  color: var(--color-text-base);
}

.pivot-output >>> textarea {
  color: var(--color-text-base);
  min-width: 100%;
  height: 100% !important;
  display: block;
  box-sizing: border-box;
  border-width: 0;
}

.pivot-output >>> textarea:focus-visible {
  outline: none;
}
</style>
