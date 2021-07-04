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
import 'jquery-ui/ui/widgets/sortable'
import 'pivottable'
import 'pivottable/dist/export_renderers.js'
import 'pivottable/dist/plotly_renderers.js'
import 'pivottable/dist/pivot.css'
import PivotUi from './PivotUi'

export default {
  name: 'pivot',
  props: ['dataSources'],
  components: {
    PivotUi
  },
  data () {
    return {
      pivotOptions: {}
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
    }
  }
}
</script>

<style scoped>
.pivot-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.pivot-output {
  flex-grow: 1;
}

.pivot-warning {
  height: 40px;
  line-height: 40px;
  box-sizing: border-box;
  margin-bottom: 20px;
}
</style>
