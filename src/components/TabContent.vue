<template>
  <splitpanes
    class="query-results-splitter"
    horizontal
    :before="{ size: 50, max: 50 }"
    :after="{ size: 50, max: 100 }"
  >
    <div slot="left-pane" class="query-editor">
      <div class="codemirror-container">
        <codemirror v-model="code" :options="cmOptions" @changes="onCmChange" />
      </div>
      <div  class="run-btn-container">
        <button class="primary run-btn" @click="execEditorContents">Run</button>
      </div>
    </div>
    <div slot="right-pane">
      <view-switcher :view.sync="view" />
      <div v-show="view === 'table'">
        <div id="error" class="error"></div>
        <pre ref="output" id="output">Results will be displayed here</pre>
        <sql-table :data="result" />
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
  </splitpanes>
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

export default {
  name: 'TabContent',
  components: {
    codemirror,
    SqlTable,
    Splitpanes,
    ViewSwitcher
  },
  data () {
    return {
      plotly: plotly,
      state: {
        data: [],
        layout: {},
        frames: []
      },
      code: 'select * from albums',
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
      worker: this.$store.state.worker
    }
  },
  computed: {
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
  methods: {
    update (data, layout, frames) {
      this.state = { data, layout, frames }
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
      this.worker.onmessage = (event) => {
        // if it was more than one select - take only the first one
        this.result = event.data.results[0]
        if (!this.result) {
          console.log(event.data.error)
          return
        }

        this.$refs.output.innerHTML = ''
      }
      this.worker.postMessage({ action: 'exec', sql: commands })
      this.$refs.output.textContent = 'Fetching results...'
    },
    execEditorContents () {
      this.execute(this.code + ';')
    }
  }
}
</script>

<style scoped>
.query-results-splitter {
  height: calc(100vh - 74px);
  margin-top: 6px;
  background-color: var(--color-bg-light);
}

.run-btn {
  margin-top: 24px;
}

.query-editor {
  padding: 0 52px 24px;
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
</style>
