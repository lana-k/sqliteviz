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

    <teleport :to="`#${layout.editor}-${tabIndex}`">
      <div class="query-editor">
        <sql-editor
          ref="sqlEditor"
          v-model="query"
          :switch-to="hiddenPart"
          @switch="onSwitchView('editor')"
        />
      </div>
    </teleport>

    <teleport :to="`#${layout.table}-${tabIndex}`">
      <view-switcher :view.sync="view" />
      <div v-show="view === 'table'" class="table-view">
        <run-result
          :result="result"
          :is-getting-results="isGettingResults"
          :error="error"
          :time="time"
          :height="tableViewHeight"
          :switch-to="hiddenPart"
          @switch="onSwitchView('table')"
        />
      </div>
    </teleport>

    <teleport :to="`#${layout.dataView}-${tabIndex}`">
      <data-view
        :data-source="result"
        :options="initChart"
        :switch-to="hiddenPart"
        @switch="onSwitchView('dataView')"
        @update="onDataViewUpdate"
      />
    </teleport>
  </div>
</template>

<script>
import Splitpanes from '@/components/Splitpanes'
import SqlEditor from './SqlEditor'
import ViewSwitcher from './ViewSwitcher'
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
    ViewSwitcher,
    Teleport
  },
  data () {
    return {
      query: this.initQuery,
      result: null,
      view: 'table',
      tableViewHeight: 0,
      isGettingResults: false,
      error: null,
      resizeObserver: null,
      time: 0,
      layout: {
        editor: 'above',
        table: 'bottom',
        dataView: 'hidden'
      }
    }
  },
  computed: {
    isActive () {
      return this.id === this.$store.state.currentTabId
    },
    hiddenPart () {
      return Object.keys(this.layout).find(key => this.layout[key] === 'hidden')
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
    onSwitchView (switchedView) {
      this.layout[this.hiddenPart] = this.layout[switchedView]
      this.layout[switchedView] = 'hidden'
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
      // 34 - table footer width
      // 12 - desirable space after the table
      // 5 - padding-bottom of rounded table container
      // 35 - height of table header
      const freeSpace = bottomPane.offsetHeight - 88 - 34 - 12 - 5 - 35
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
</style>
