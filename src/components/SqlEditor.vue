<template>
  <div class="codemirror-container">
    <codemirror v-model="query" :options="cmOptions" @changes="onCmChange" />
  </div>
</template>

<script>
import CM from 'codemirror'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/sql/sql.js'
import 'codemirror/theme/neo.css'
import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/hint/sql-hint.js'
import 'codemirror/addon/display/autorefresh.js'
import { debounce } from 'debounce'

const sqlHint = CM.hint.sql
CM.hint.sql = (cm, options) => {
  const token = cm.getTokenAt(cm.getCursor()).string.toUpperCase()
  const result = sqlHint(cm, options)
  // Don't show the hint if there is only one option
  // and the token is already completed with this option
  if (result.list.length === 1 && result.list[0].text.toUpperCase() === token) {
    result.list = []
  }
  return result
}

export default {
  name: 'SqlEditor',
  props: ['value'],
  components: {
    codemirror
  },
  data () {
    return {
      query: this.value,
      cmOptions: {
        // codemirror options
        tabSize: 4,
        mode: 'text/x-mysql',
        theme: 'neo',
        lineNumbers: true,
        line: true,
        autofocus: true,
        autoRefresh: true
      }
    }
  },
  computed: {
    tables () {
      const tables = {}
      if (this.$store.state.schema) {
        this.$store.state.schema.forEach(table => {
          tables[table.name] = table.columns.map(column => column.name)
        })
      }
      return tables
    }
  },
  watch: {
    query () {
      this.$emit('input', this.query)
    }
  },
  methods: {
    onCmChange: debounce(function (editor) {
      // Don't show autocomplete after a space or semicolon or in string literals
      const ch = editor.getTokenAt(editor.getCursor()).string.slice(-1)
      const tokenType = editor.getTokenAt(editor.getCursor()).type
      if (tokenType === 'string' || !ch || ch === ' ' || ch === ';') {
        return
      }

      const hintOptions = {
        tables: this.tables,
        completeSingle: false,
        completeOnSingleClick: true,
        alignWithWord: false
      }

      CM.showHint(editor, CM.hint.sql, hintOptions)
    }, 400)
  }
}
</script>

<style scoped>
.codemirror-container {
  flex-grow: 1;
  min-height: 0;
}

>>> .vue-codemirror {
  height: 100%;
  max-height: 100%;
}
>>> .CodeMirror {
  height: 100%;
  max-height: 100%;
}
>>> .CodeMirror-cursor {
  width: 1px;
  background: var(--color-text-base);
}
</style>
