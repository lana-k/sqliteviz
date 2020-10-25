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
        line: true
      },
      result: null
    }
  },
  watch: {
    query () {
      this.$emit('input', this.query)
    }
  },
  methods: {
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
    }
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
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-big);
  height: 100%;
  max-height: 100%;
}
</style>
