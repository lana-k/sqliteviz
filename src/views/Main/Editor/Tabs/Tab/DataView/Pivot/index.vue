<template>
<div class="pivot-container">
  <div class="warning pivot-warning" v-show="!dataSources">
    There is no data to build a pivot. Run your sql query and make sure the result is not empty.
  </div>
  <pivot-ui :key-names="columns" v-model="pivotOptions"/>
  <div ref="pivotOutput" class="pivot-output"/>
</div>
</template>

<script>
import $ from 'jquery'
import 'pivottable'
import 'pivottable/dist/pivot.css'
import PivotUi from './PivotUi'

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
        aggregator: $.pivotUtilities.aggregators[this.initOptions.aggregatorName](this.initOptions.vals),
        aggregatorName: this.initOptions.aggregatorName,
        renderer: $.pivotUtilities.renderers[this.initOptions.rendererName],
        rendererName: this.initOptions.rendererName,
        vals: this.initOptions.vals
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
      this.$emit('update')
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
      return this.pivotOptions
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
  /* flex-grow: 1; */
  width: 100%;
  overflow: auto;
}

.pivot-warning {
  height: 40px;
  line-height: 40px;
  box-sizing: border-box;
  margin-bottom: 20px;
}
>>> .pvtTable {
  min-width: 100%;
}
</style>
