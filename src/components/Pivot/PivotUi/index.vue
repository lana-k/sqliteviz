<template>
<div class="pivot-ui">
  <div class="row">
    <label>Columns</label>
    <multiselect
      class="sqliteviz-select"
      v-model="cols"
      :options="colsToSelect"
      :multiple="true"
      :hideSelected="true"
      :close-on-select="true"
      :show-labels="false"
      :max="colsToSelect.length"
      open-direction="bottom"
      placeholder=""
    >
      <template slot="maxElements">
        <span class="no-results">No Results</span>
      </template>

      <template slot="placeholder">Choose columns</template>

      <template slot="noResult">
        <span class="no-results">No Results</span>
      </template>
    </multiselect>
    <pivot-sort-btn class="sort-btn" direction="col" v-model="colOrder" />
  </div>

  <div class="row">
    <label>Rows</label>
    <multiselect
      class="sqliteviz-select"
      v-model="rows"
      :options="rowsToSelect"
      :multiple="true"
      :hideSelected="true"
      :close-on-select="true"
      :show-labels="false"
      :max="rowsToSelect.length"
      :option-height="29"
      open-direction="bottom"
      placeholder=""
    >
      <template slot="maxElements">
        <span class="no-results">No Results</span>
      </template>

      <template slot="placeholder">Choose rows</template>

      <template slot="noResult">
        <span class="no-results">No Results</span>
      </template>
    </multiselect>
    <pivot-sort-btn class="sort-btn" direction="row" v-model="rowOrder" />
  </div>

  <div class="row aggregator">
    <label>Aggregator</label>
    <multiselect
      class="sqliteviz-select short"
      v-model="aggregator"
      :options="aggregators"
      label="name"
      track-by="name"
      :close-on-select="true"
      :show-labels="false"
      :hideSelected="true"
      :option-height="29"
      open-direction="bottom"
      placeholder="Choose a function"
    >
      <template slot="noResult">
        <span class="no-results">No Results</span>
      </template>
    </multiselect>

    <multiselect
      class="sqliteviz-select aggr-arg"
      v-show="valCount > 0"
      v-model="val1"
      :options="keyNames"
      :close-on-select="true"
      :show-labels="false"
      :hideSelected="true"
      :option-height="29"
      open-direction="bottom"
      placeholder="Choose an argument"
    />

    <multiselect
      class="sqliteviz-select aggr-arg"
      v-show="valCount > 1"
      v-model="val2"
      :options="keyNames"
      :close-on-select="true"
      :show-labels="false"
      :hideSelected="true"
      :option-height="29"
      open-direction="bottom"
      placeholder="Choose a second argument"
    />
  </div>

  <div class="row">
    <label>View</label>
    <multiselect
      class="sqliteviz-select short"
      v-model="renderer"
      :options="renderers"
      label="name"
      track-by="name"
      :close-on-select="true"
      :allow-empty="false"
      :show-labels="false"
      :hideSelected="true"
      :option-height="29"
      open-direction="bottom"
      placeholder="Choose a view"
    >
      <template slot="noResult">
        <span class="no-results">No Results</span>
      </template>
    </multiselect>
  </div>
</div>
</template>

<script>
import $ from 'jquery'
import 'pivottable'
import 'pivottable/dist/export_renderers.js'
import 'pivottable/dist/plotly_renderers.js'
import Multiselect from 'vue-multiselect'
import PivotSortBtn from './PivotSortBtn'

const zeroValAggregators = [
  'Count',
  'Count as Fraction of Total',
  'Count as Fraction of Rows',
  'Count as Fraction of Columns'
]
const twoValAggregators = [
  'Sum over Sum',
  '80% Upper Bound',
  '80% Lower Bound'
]

export default {
  name: 'pivot',
  props: ['keyNames'],
  components: {
    Multiselect,
    PivotSortBtn
  },
  data () {
    return {
      renderer: { name: 'Table', fun: $.pivotUtilities.renderers.Table },
      aggregator: { name: 'Count', fun: $.pivotUtilities.aggregators.Count },
      rows: [],
      cols: [],
      val1: '',
      val2: '',
      colOrder: 'key_a_to_z',
      rowOrder: 'key_a_to_z'
    }
  },
  computed: {
    valCount () {
      if (zeroValAggregators.includes(this.aggregator.name)) {
        return 0
      }

      if (twoValAggregators.includes(this.aggregator.name)) {
        return 2
      }

      return 1
    },
    renderers () {
      return Object.keys($.pivotUtilities.renderers).map(key => {
        return {
          name: key,
          fun: $.pivotUtilities.renderers[key]
        }
      })
    },
    aggregators () {
      return Object.keys($.pivotUtilities.aggregators).map(key => {
        return {
          name: key,
          fun: $.pivotUtilities.aggregators[key]
        }
      })
    },
    rowsToSelect () {
      return this.keyNames.filter(key => !this.cols.includes(key))
    },
    colsToSelect () {
      return this.keyNames.filter(key => !this.rows.includes(key))
    }
  },
  watch: {
    renderer () {
      this.returnValue()
    },
    aggregator () {
      this.returnValue()
    },
    rows () {
      this.returnValue()
    },
    cols () {
      this.returnValue()
    },
    val1 () {
      this.returnValue()
    },
    val2 () {
      this.returnValue()
    },
    colOrder () {
      this.returnValue()
    },
    rowOrder () {
      this.returnValue()
    }
  },
  methods: {
    returnValue () {
      const vals = []
      for (let i = 1; i <= this.valCount; i++) {
        vals.push(this[`val${i}`])
      }

      this.$emit('input', {
        rows: this.rows,
        cols: this.cols,
        colOrder: this.colOrder,
        rowOrder: this.rowOrder,
        aggregator: this.aggregator.fun(vals),
        aggregatorName: this.aggregator.name,
        renderer: this.renderer.fun
      })
    }
  }
}
</script>
<style>
.pivot-ui {
  padding: 12px 24px;
  color: var(--color-text-base);
  font-size: 12px;
}

.pivot-ui .row {
  display: flex;
  align-items: center;
  margin: 12px 0;
}

.pivot-ui .row label {
  width: 76px;
  flex-shrink: 0;
}

.pivot-ui .row .sqliteviz-select.short {
  width: 220px;
  flex-shrink: 0;
}

.pivot-ui .row .aggr-arg {
  margin-left: 12px;
  max-width: 220px;
}

.pivot-ui .row .sort-btn {
  margin-left: 12px;
  flex-shrink: 0;
}
</style>
