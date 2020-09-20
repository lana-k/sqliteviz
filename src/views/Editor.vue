<template>
  <div>
    <div style="display:flex">
      <div>
        <schema :schema="schema"/>
      </div>
      <div>
        <codemirror v-model="code" :options="cmOptions" @changes="onCmChange" />
        <button id="execute" class="button" @click="execEditorContents">Execute</button>
        <label class="button">
          Load an SQLite database file: <input type='file' ref='dbfile' @change="loadDb">
        </label>

        <div id="error" class="error"></div>

        <pre ref="output" id="output">Results will be displayed here</pre>

        <sql-table :data="result" />
      </div>
    </div>
    <PlotlyEditor
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

<script>
import SqlTable from '@/components/SqlTable'
import Schema from '@/components/Schema'

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
  name: 'Editor',
  components: {
    codemirror,
    SqlTable,
    Schema
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
      schema: null,
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
  created () {
    // Open a database
    // worker.postMessage({ action: 'open' })
    // let dbFile = this.$store.state.dbFile
    // console.log(dbFile)
    /* try {
      worker.postMessage({ action: 'open', buffer: this.$store.state.dbFile }, [this.$store.state.dbFile])
    } catch (exception) {
      worker.postMessage({ action: 'open', buffer: this.$store.state.dbFile })
    } */
    this.schema = this.$store.state.schema
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
    },
    loadDb () {
      const f = this.$refs.dbfile.files[0]
      const r = new FileReader()
      r.onload = () => {
        this.worker.onmessage = () => {
          const getSchemaSql = `
            SELECT name, sql
            FROM sqlite_master
            WHERE type='table' AND name NOT LIKE 'sqlite_%';`
          this.worker.onmessage = event => {
            this.schema = event.data.results[0].values
          }
          this.worker.postMessage({ action: 'exec', sql: getSchemaSql })
        }
        try {
          this.worker.postMessage({ action: 'open', buffer: r.result }, [r.result])
        } catch (exception) {
          this.worker.postMessage({ action: 'open', buffer: r.result })
        }
      }
      r.readAsArrayBuffer(f)
    }
  }
}
</script>
