<template>
  <div class="tab-content-container" v-show="isActive">
    <splitpanes
      class="query-results-splitter"
      horizontal
      :before="{ size: 50, max: 100 }"
      :after="{ size: 50, max: 100 }"
    >
      <template #left-pane>
        <div :id="'above-' + tabIndex" class="above" />
      </template>
      <template #right-pane>
        <div :id="'bottom-'+ tabIndex" ref="bottomPane" class="bottomPane" />
      </template>
    </splitpanes>

    <div :id="'hidden-'+ tabIndex" class="hidden-part" />

    <teleport :to="`#${layout.sqlEditor}-${tabIndex}`">
      <sql-editor
        ref="sqlEditor"
        v-model="query"
        @switchTo="onSwitchView('sqlEditor', $event)"
        @run="execute"
      />
    </teleport>

    <teleport :to="`#${layout.table}-${tabIndex}`">
      <run-result
        :result="result"
        :is-getting-results="isGettingResults"
        :error="error"
        :time="time"
        :height="tableViewHeight"
        @switchTo="onSwitchView('table', $event)"
      />
    </teleport>

    <teleport :to="`#${layout.dataView}-${tabIndex}`">
      <data-view
        :data-source="result"
        :options="initChart"
        initMode="chart"
        @switchTo="onSwitchView('dataView', $event)"
        @update="onDataViewUpdate"
      />
    </teleport>
  </div>
</template>

<script>
import Splitpanes from '@/components/Splitpanes'
import SqlEditor from './SqlEditor'
import DataView from './DataView'
import RunResult from './RunResult'
import time from '@/lib/utils/time'
import Teleport from 'vue2-teleport'

export default {
  name: 'Tab',
  props: ['id', 'initName', 'initQuery', 'initChart', 'tabIndex', 'isPredefined'],
  components: {
    SqlEditor,
    DataView,
    RunResult,
    Splitpanes,
    Teleport
  },
  data () {
    return {
      query: this.initQuery,
      result: null,
      tableViewHeight: 0,
      isGettingResults: false,
      error: null,
      resizeObserver: null,
      time: 0,
      layout: {
        sqlEditor: 'above',
        table: 'bottom',
        dataView: 'hidden'
      }
    }
  },
  computed: {
    isActive () {
      return this.id === this.$store.state.currentTabId
    }
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
    isActive: {
      immediate: true,
      async handler () {
        if (this.isActive) {
          this.$store.commit('setCurrentTab', this)
          await this.$nextTick()
          this.$refs.sqlEditor.focus()
        }
      }
    },
    query () {
      this.$store.commit('updateTab', { index: this.tabIndex, isUnsaved: true })
    }
  },
  methods: {
    onSwitchView (from, to) {
      const fromPosition = this.layout[from]
      this.layout[from] = this.layout[to]
      this.layout[to] = fromPosition
    },
    onDataViewUpdate () {
      this.$store.commit('updateTab', { index: this.tabIndex, isUnsaved: true })
    },
    async execute () {
      this.isGettingResults = true
      this.result = null
      this.error = null
      const state = this.$store.state
      try {
        const start = new Date()
        this.result = await state.db.execute(this.query + ';')
        this.time = time.getPeriod(start, new Date())
      } catch (err) {
        this.error = {
          type: 'error',
          message: err
        }
      }
      state.db.refreshSchema()
      this.isGettingResults = false
    },
    handleResize () {
      this.calculateTableHeight()
    },
    calculateTableHeight () {
      const bottomPane = this.$refs.bottomPane
      // 34 - table footer hight
      // 12 - desirable space after the table
      // 5 - padding-bottom of rounded table container
      // 35 - height of table header
      const freeSpace = bottomPane.offsetHeight - 34 - 12 - 5 - 35 - 64
      this.tableViewHeight = freeSpace - (freeSpace % 35)
    }
  }
}
</script>

<style scoped>
.above {
  height: 100%;
  max-height: 100%;
}

.hidden-part {
  display: none;
}

.tab-content-container {
  background-color: var(--color-white);
  border-top: 1px solid var(--color-border-light);
  margin-top: -1px;
}

.bottomPane {
  height: 100%;
  background-color: var(--color-bg-light);
}

.query-results-splitter {
  height: calc(100vh - 104px);
  background-color: var(--color-bg-light);
}
</style>
