<template>
  <div class="pivot-ui">
    <div :class="{ collapsed }">
      <div class="row">
        <label>Columns</label>
        <multiselect
          v-model="cols"
          class="sqliteviz-select cols"
          :options="colsToSelect"
          :disabled="colsToSelect.length === 0"
          :multiple="true"
          :hideSelected="true"
          :closeOnSelect="true"
          :showLabels="false"
          :max="colsToSelect.length"
          openDirection="bottom"
          placeholder=""
        >
          <template #maxElements>
            <span class="no-results">No Results</span>
          </template>

          <template #placeholder>Choose columns</template>

          <template #noResult>
            <span class="no-results">No Results</span>
          </template>
        </multiselect>
        <pivot-sort-btn v-model="colOrder" class="sort-btn" direction="col" />
      </div>

      <div class="row">
        <label>Rows</label>
        <multiselect
          v-model="rows"
          class="sqliteviz-select rows"
          :options="rowsToSelect"
          :disabled="rowsToSelect.length === 0"
          :multiple="true"
          :hideSelected="true"
          :closeOnSelect="true"
          :showLabels="false"
          :max="rowsToSelect.length"
          :optionHeight="29"
          openDirection="bottom"
          placeholder=""
        >
          <template #maxElements>
            <span class="no-results">No Results</span>
          </template>

          <template #placeholder>Choose rows</template>

          <template #noResult>
            <span class="no-results">No Results</span>
          </template>
        </multiselect>
        <pivot-sort-btn v-model="rowOrder" class="sort-btn" direction="row" />
      </div>

      <div class="row aggregator">
        <label>Aggregator</label>
        <multiselect
          v-model="aggregator"
          class="sqliteviz-select short aggregator"
          :options="aggregators"
          label="name"
          trackBy="name"
          :closeOnSelect="true"
          :showLabels="false"
          :hideSelected="true"
          :optionHeight="29"
          openDirection="bottom"
          placeholder="Choose a function"
        >
          <template #noResult>
            <span class="no-results">No Results</span>
          </template>
        </multiselect>

        <multiselect
          v-show="valCount > 0"
          v-model="val1"
          class="sqliteviz-select aggr-arg"
          :options="keyNames"
          :disabled="keyNames.length === 0"
          :closeOnSelect="true"
          :showLabels="false"
          :hideSelected="true"
          :optionHeight="29"
          openDirection="bottom"
          placeholder="Choose an argument"
        />

        <multiselect
          v-show="valCount > 1"
          v-model="val2"
          class="sqliteviz-select aggr-arg"
          :options="keyNames"
          :disabled="keyNames.length === 0"
          :closeOnSelect="true"
          :showLabels="false"
          :hideSelected="true"
          :optionHeight="29"
          openDirection="bottom"
          placeholder="Choose a second argument"
        />
      </div>

      <div class="row">
        <label>View</label>
        <multiselect
          v-model="renderer"
          class="sqliteviz-select short renderer"
          :options="renderers"
          label="name"
          trackBy="name"
          :closeOnSelect="true"
          :allowEmpty="false"
          :showLabels="false"
          :hideSelected="true"
          :optionHeight="29"
          openDirection="bottom"
          placeholder="Choose a view"
        >
          <template #noResult>
            <span class="no-results">No Results</span>
          </template>
        </multiselect>
      </div>
    </div>
    <span class="switcher" @click="collapsed = !collapsed">
      {{ collapsed ? 'Show pivot settings' : 'Hide pivot settings' }}
    </span>
  </div>
</template>

<script>
import $ from 'jquery'
import Multiselect from 'vue-multiselect'
import PivotSortBtn from './PivotSortBtn'
import {
  renderers,
  aggregators,
  zeroValAggregators,
  twoValAggregators
} from '../pivotHelper'

export default {
  name: 'PivotUi',
  components: {
    Multiselect,
    PivotSortBtn
  },
  props: {
    keyNames: Array,
    modelValue: Object
  },
  emits: ['update:modelValue', 'update'],
  data() {
    const aggregatorName =
      (this.modelValue && this.modelValue.aggregatorName) || 'Count'
    const rendererName =
      (this.modelValue && this.modelValue.rendererName) || 'Table'
    return {
      collapsed: false,
      renderer: {
        name: rendererName,
        fun: $.pivotUtilities.renderers[rendererName]
      },
      aggregator: {
        name: aggregatorName,
        fun: $.pivotUtilities.aggregators[aggregatorName]
      },
      rows: (this.modelValue && this.modelValue.rows) || [],
      cols: (this.modelValue && this.modelValue.cols) || [],
      val1:
        (this.modelValue && this.modelValue.vals && this.modelValue.vals[0]) ||
        '',
      val2:
        (this.modelValue && this.modelValue.vals && this.modelValue.vals[1]) ||
        '',
      colOrder: (this.modelValue && this.modelValue.colOrder) || 'key_a_to_z',
      rowOrder: (this.modelValue && this.modelValue.rowOrder) || 'key_a_to_z'
    }
  },
  computed: {
    valCount() {
      if (zeroValAggregators.includes(this.aggregator.name)) {
        return 0
      }

      if (twoValAggregators.includes(this.aggregator.name)) {
        return 2
      }

      return 1
    },
    renderers() {
      return renderers
    },
    aggregators() {
      return aggregators
    },
    rowsToSelect() {
      return this.keyNames.filter(key => !this.cols.includes(key))
    },
    colsToSelect() {
      return this.keyNames.filter(key => !this.rows.includes(key))
    }
  },
  watch: {
    renderer() {
      this.returnValue()
    },
    aggregator() {
      this.returnValue()
    },
    rows() {
      this.returnValue()
    },
    cols() {
      this.returnValue()
    },
    val1() {
      this.returnValue()
    },
    val2() {
      this.returnValue()
    },
    colOrder() {
      this.returnValue()
    },
    rowOrder() {
      this.returnValue()
    }
  },
  methods: {
    returnValue() {
      const vals = []
      for (let i = 1; i <= this.valCount; i++) {
        vals.push(this[`val${i}`])
      }
      this.$emit('update')
      this.$emit('update:modelValue', {
        rows: this.rows,
        cols: this.cols,
        colOrder: this.colOrder,
        rowOrder: this.rowOrder,
        aggregator: this.aggregator.fun(vals),
        aggregatorName: this.aggregator.name,
        renderer: this.renderer.fun,
        rendererName: this.renderer.name,
        vals
      })
    }
  }
}
</script>
<style scoped>
.pivot-ui {
  padding: 12px 24px;
  color: var(--color-text-base);
  font-size: 12px;
  border-bottom: 1px solid var(--color-border-light);
  background-color: var(--color-bg-light);
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
.collapsed {
  display: none;
}

.switcher {
  display: block;
  width: min-content;
  white-space: nowrap;
  margin: auto;
  cursor: pointer;
}

.switcher:hover {
  color: var(--color-accent);
}
</style>
