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
          <div class="codemirror-container">
            <codemirror v-model="query" :options="cmOptions" @changes="onCmChange" ref="codemirror" />
          </div>
          <div  class="run-btn-container">
            <button
              class="primary run-btn"
              @click="execute(query)"
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
          <PlotlyEditor
            v-show="view === 'chart'"
            :data="state.data"
            :layout="state.layout"
            :frames="state.frames"
            :config="{ editable: true }"
            :dataSources="dataSources"
            :dataSourceOptions="dataSourceOptions"
            :plotly="plotly"
            @onUpdate="update"
            :useResizeHandler="true"
            :debug="true"
            :advancedTraceTypeSelector="true"
          />
        </div>
      </template>
    </splitpanes>
  </div>
</template>

<script>
import SqlTable from '@/components/SqlTable'
import Splitpanes from '@/components/splitpanes'
import ViewSwitcher from '@/components/ViewSwitcher'

import plotly from 'plotly.js/dist/plotly'
import 'react-chart-editor/lib/react-chart-editor.min.css'

import CM from 'codemirror'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/sql/sql.js'
import 'codemirror/theme/neo.css'
import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/hint/sql-hint.js'

import PlotlyEditor from 'react-chart-editor'
import dereference from 'react-chart-editor/lib/lib/dereference'

export default {
  name: 'TabContent',
  props: ['id', 'initName', 'initQuery', 'initPlotly', 'tabIndex'],
  components: {
    codemirror,
    SqlTable,
    Splitpanes,
    ViewSwitcher,
    PlotlyEditor
  },
  data () {
    return {
      plotly: plotly,
      state: this.initPlotly || {
        data: [],
        layout: {},
        frames: []
      },
      query: this.initQuery,
      cmOptions: {
        // codemirror options
        tabSize: 4,
        mode: 'text/x-mysql',
        theme: 'neo',
        lineNumbers: true,
        line: true
      },
      result: null,
      view: 'table',
      tableViewHeight: 0,
      isUnsaved: !this.name
    }
  },
  computed: {
    isActive () {
      return this.id === this.$store.state.currentTabId
    },
    dataSources () {
      if (!this.result) {
        return {}
      }
      const dataSorces = {}
      const matrix = this.result.values
      const [row] = matrix
      const transposedMatrix = row.map((value, column) => matrix.map(row => row[column]))
      this.result.columns.forEach((column, index) => {
        dataSorces[column] = transposedMatrix[index]
      })
      return dataSorces
    },
    dataSourceOptions () {
      return Object.keys(this.dataSources).map(name => ({
        value: name,
        label: name
      }))
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
    },
    dataSources () {
      // we need to update state.data in order to update the graph
      // https://github.com/plotly/react-chart-editor/issues/948
      dereference(this.state.data, this.dataSources)
    }
  },
  methods: {
    update (data, layout, frames) {
      this.state = { data, layout, frames }
      this.isUnsaved = true
      console.log(this.state)
    },
    onCmChange (editor) {
      // Don't show autocomplete after a space or semicolon
      const ch = editor.getTokenAt(editor.getCursor()).string.slice(-1)
      if (!ch || ch === ' ' || ch === ';') {
        return
      }

      const hintOptions = {
      //   tables: this.state.tables,
        completeSingle: false,
        completeOnSingleClick: true
      }

      // editor.hint.sql is defined when importing codemirror/addon/hint/sql-hint
      // (this is mentioned in codemirror addon documentation)
      // Reference the hint function imported here when including other hint addons
      // or supply your own
      CM.showHint(editor, CM.hint.sql, hintOptions)
    },
    // Run a command in the database
    execute (commands) {
      // this.$refs.output.textContent = 'Fetching results...' */
      this.$db.execute(commands + ';')
        .then(result => { this.result = result })
        .catch(err => alert(err))
    },
    handleResize () {
      if (this.view === 'chart') {
        // hack react-chart editor: hidden and show in order to make the graph resize
        this.view = 'not chart'
        this.view = 'chart'
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
    getPlotlySatateForSave () {
      // we don't need to save the data, only settings
      // so we modify state.data using dereference
      const stateCopy = JSON.parse(JSON.stringify(this.state))
      const emptySources = {}
      for (const key in this.dataSources) {
        emptySources[key] = []
      }
      dereference(stateCopy.data, emptySources)
      return stateCopy
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
  min-height: 150px;
}

.codemirror-container {
  flex-grow: 1;
  min-height: 0;
}

.run-btn-container {
  text-align: right;
}

>>> .vue-codemirror {
  height: 100%;
  max-height: 100%;
}
>>> .CodeMirror {
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-big);
  height: 100%;
  max-height: 100%;
}
.table-view {
  margin: 0 52px;
}
</style>
