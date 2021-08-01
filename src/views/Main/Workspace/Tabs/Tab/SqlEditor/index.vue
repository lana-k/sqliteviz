<template>
  <div class="sql-editor-panel">
    <div class="codemirror-container">
      <codemirror
        ref="cm"
        v-model="query"
        :options="cmOptions"
        @changes="onChange"
      />
    </div>
    <side-tool-bar panel="sqlEditor" @switchTo="$emit('switchTo', $event)">
      <icon-button
        :disabled="runDisabled"
        :loading="isGettingResults"
        tooltip="Run SQL query"
        tooltip-position="top-left"
        @click="$emit('run')"
      >
        <run-icon :disabled="runDisabled"/>
      </icon-button>
    </side-tool-bar>
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
import SideToolBar from '../SideToolBar'
import IconButton from '@/components/IconButton'
import RunIcon from '@/components/svg/run'

export default {
  name: 'SqlEditor',
  props: ['value', 'isGettingResults'],
  components: {
    codemirror,
    SideToolBar,
    IconButton,
    RunIcon
  },
  data () {
    return {
      query: this.value,
      cmOptions: {
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
  computed: {
    runDisabled () {
      return (!this.$store.state.db || !this.query || this.isGettingResults)
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
.sql-editor-panel {
  display: flex;
  flex-grow: 1;
  height: 100%;
  max-height: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.codemirror-container {
  flex-grow: 1;
  overflow: auto;
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
