<template>
  <div class="tab-content-container" v-show="isActive">
    <splitpanes
      class="query-results-splitter"
      horizontal
      :before="{ size: 50, max: 100 }"
      :after="{ size: 50, max: 100 }"
    >
      <template #left-pane>
        <div class="query-editor">
          <sql-editor v-model="query" />
        </div>
      </template>
      <template #right-pane>
        <div id="bottomPane" ref="bottomPane">
          <view-switcher :view.sync="view" />
          <div v-show="view === 'table'" class="table-view">
            <div v-show="result === null && !isGettingResults && !error" class="table-preview">
              Run your query and get results here
            </div>
            <div v-show="isGettingResults" class="table-preview">
              Fetching results...
            </div>
            <div v-show="result === undefined && !isGettingResults && !error" class="table-preview">
              No rows retrieved according to your query
            </div>
            <div v-show="error" class="table-preview error">
              {{ error }}
            </div>
            <sql-table v-if="result" :data-set="result" :height="tableViewHeight" />
          </div>
          <chart
            :visible="view === 'chart'"
            :sql-result="result"
            :init-chart="initChart"
            ref="chart"
            @update="$store.commit('updateTab', { index: tabIndex, isUnsaved: true })"
          />
        </div>
      </template>
    </splitpanes>
  </div>
</template>

<script>
import SqlTable from '@/components/SqlTable'
import SqlEditor from '@/components/SqlEditor'
import Splitpanes from '@/components/Splitpanes'
import ViewSwitcher from '@/components/ViewSwitcher'
import Chart from '@/components/Chart'

export default {
  name: 'Tab',
  props: ['id', 'initName', 'initQuery', 'initChart', 'tabIndex', 'isPredefined'],
  components: {
    SqlEditor,
    SqlTable,
    Splitpanes,
    ViewSwitcher,
    Chart
  },
  data () {
    return {
      query: this.initQuery,
      result: null,
      view: 'table',
      tableViewHeight: 0,
      isGettingResults: false,
      error: null,
      resizeObserver: null
    }
  },
  computed: {
    isActive () {
      return this.id === this.$store.state.currentTabId
    }
  },
  created () {
    this.$store.commit('setCurrentTab', this)
  },
  mounted () {
    this.resizeObserver = new ResizeObserver(this.handleResize)
    this.resizeObserver.observe(this.$refs.bottomPane)
    this.calculateTableHeight()
  },
  beforeDestroy () {
    this.resizeObserver.unobserve(this.$refs.bottomPane)
  },
  watch: {
    isActive () {
      if (this.isActive) {
        this.$store.commit('setCurrentTab', this)
      }
    },
    query () {
      this.$store.commit('updateTab', { index: this.tabIndex, isUnsaved: true })
    }
  },
  methods: {
    // Run a command in the database
    execute () {
      // this.$refs.output.textContent = 'Fetching results...' */
      this.isGettingResults = true
      this.result = null
      this.error = null
      this.$db.execute(this.query + ';')
        .then(result => {
          this.result = result
        })
        .catch(err => {
          this.error = err
        })
        .finally(() => {
          this.isGettingResults = false
        })
    },
    handleResize () {
      if (this.view === 'chart') {
        // hack react-chart editor: hidden and show in order to make the graph resize
        this.view = 'not chart'
        this.$nextTick(() => {
          this.view = 'chart'
        })
      }
      this.calculateTableHeight()
    },
    calculateTableHeight () {
      const bottomPane = this.$refs.bottomPane
      // 88 - view swittcher height
      // 42 - table footer width
      // 30 - desirable space after the table
      // 5 - padding-bottom of rounded table container
      // 40 - height of table header
      const freeSpace = bottomPane.offsetHeight - 88 - 42 - 30 - 5 - 40
      this.tableViewHeight = freeSpace - (freeSpace % 40)
    },
    getChartStateForSave () {
      return this.$refs.chart.getChartStateForSave()
    }
  }
}
</script>

<style scoped>
.tab-content-container {
  background-color: var(--color-white);
  border-top: 1px solid var(--color-border-light);
  margin-top: -1px;
}

#bottomPane {
  height: 100%;
  background-color: var(--color-bg-light);
}

.query-results-splitter {
  height: calc(100vh - 104px);
  background-color: var(--color-bg-light);
}

.query-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  box-sizing: border-box;
  min-height: 190px;
}

.table-view {
  margin: 0 52px;
  height: calc(100% - 88px);
  position: relative;
}

.table-preview {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-text-base);
  font-size: 13px;
}

.table-preview.error {
  color: var(--color-text-error);
}

.table-preview.error::first-letter {
  text-transform: capitalize;
}
</style>
