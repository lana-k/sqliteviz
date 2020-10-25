<template>
  <div class="tab-content-container" v-show="isActive">
    <splitpanes
      class="query-results-splitter"
      horizontal
      :before="{ size: 50, max: 50 }"
      :after="{ size: 50, max: 100 }"
    >
      <template #left-pane>
        <div class="query-editor">
          <sql-editor v-model="query" />
          <div  class="run-btn-container">
            <button
              class="primary run-btn"
              @click="execute"
              :disabled="!$store.state.schema"
            >
              Run
            </button>
          </div>
        </div>
      </template>
      <template #right-pane>
        <div id="bottomPane" ref="bottomPane">
          <view-switcher :view.sync="view" />
          <div v-show="view === 'table'" class="table-view">
           <!--  <div id="error" class="error"></div>
            <pre ref="output" id="output">Results will be displayed here</pre> -->
            <sql-table v-if="result" :data="result" :height="tableViewHeight" />
          </div>
          <chart
            :visible="view === 'chart'"
            :sql-result="result"
            :init-chart="initChart"
            ref="chart"
            @update="isUnsaved = true"
          />
        </div>
      </template>
    </splitpanes>
  </div>
</template>

<script>
import SqlTable from '@/components/SqlTable'
import SqlEditor from '@/components/SqlEditor'
import Splitpanes from '@/components/splitpanes'
import ViewSwitcher from '@/components/ViewSwitcher'
import Chart from '@/components/Chart'

export default {
  name: 'TabContent',
  props: ['id', 'initName', 'initQuery', 'initChart', 'tabIndex'],
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
      isUnsaved: !this.initName
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
    new ResizeObserver(this.handleResize).observe(this.$refs.bottomPane)
    this.calculateTableHeight()
  },
  watch: {
    isActive () {
      if (this.isActive) {
        this.$store.commit('setCurrentTab', this)
      }
    },
    query () {
      this.isUnsaved = true
    },
    isUnsaved () {
      this.$store.commit('updateTabState', { index: this.tabIndex, newValue: this.isUnsaved })
    }
  },
  methods: {
    // Run a command in the database
    execute () {
      // this.$refs.output.textContent = 'Fetching results...' */
      this.$db.execute(this.query + ';')
        .then(result => { this.result = result })
        .catch(err => alert(err))
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
    getChartSatateForSave () {
      return this.$refs.chart.getChartSatateForSave()
    }
  }
}
</script>

<style scoped>
.tab-content-container {
  padding-top: 6px;
  background-color: var(--color-bg-light);
  border-top: 1px solid var(--color-border-light);
  margin-top: -1px;
}

#bottomPane {
  height: 100%;
}

.query-results-splitter {
  height: calc(100vh - 110px);
  background-color: var(--color-bg-light);
}

.run-btn {
  margin-top: 24px;
}

.query-editor {
  padding: 52px 52px 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  box-sizing: border-box;
  min-height: 190px;
}

.run-btn-container {
  text-align: right;
}

.table-view {
  margin: 0 52px;
}
</style>
