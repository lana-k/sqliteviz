<template>
  <div>
    <codemirror
        :value="cellValue"
        :options="cmOptions"
      />
  </div>
</template>

<script>
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/addon/fold/foldcode.js'
import 'codemirror/addon/fold/foldgutter.js'
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/fold/brace-fold.js'
import 'codemirror/theme/neo.css'

export default {
  components: {
    codemirror
  },
  props: {
    cellValue: [String, Number]
  },
  data () {
    return {
      cmOptions: {
        tabSize: 4,
        mode: { name: 'javascript', json: true },
        theme: 'neo',
        lineNumbers: true,
        line: true,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        readOnly: true
      }
    }
  },
  methods: {

  }
}
</script>

<style scoped>
</style>
