<template>
  <div class="codemirror-container">
    <codemirror ref="cm" v-model="query" :options="cmOptions" @changes="onChange" />
  </div>
</template>

<script>
import showHint, { showHintOnDemand } from './hint'
import time from '@/lib/utils/time'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/sql/sql.js'
import 'codemirror/theme/neo.css'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/display/autorefresh.js'

export default {
  name: 'SqlEditor',
  props: ['value'],
  components: { codemirror },
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
        autoRefresh: true,
        extraKeys: { 'Ctrl-Space': showHintOnDemand }
      }
    }
  },
  watch: {
    query () {
      this.$emit('input', this.query)
    }
  },
  methods: {
    onChange: time.debounce(showHint, 400),
    focus () {
      this.$refs.cm.codemirror.focus()
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
  height: 100%;
  max-height: 100%;
}
>>> .CodeMirror-cursor {
  width: 1px;
  background: var(--color-text-base);
}
</style>
