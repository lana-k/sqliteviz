<template>
  <div class="sql-editor-panel">
    <div class="codemirror-box original-style">
      <codemirror
        ref="cm"
        v-model:value="query"
        :options="cmOptions"
        :original-style="true"
        @change="onChange"
      />
    </div>
    <side-tool-bar panel="sqlEditor" @switchTo="$emit('switchTo', $event)">
      <icon-button
        ref="runBtn"
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
import Codemirror from 'codemirror-editor-vue3'
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
  props: ['modelValue', 'isGettingResults'],
  emits: ['update:modelValue', 'run', 'switchTo'],
  components: {
    Codemirror,
    SideToolBar,
    IconButton,
    RunIcon
  },
  data () {
    return {
      query: this.modelValue,
      cmOptions: {
        tabSize: 4,
        mode: 'text/x-mysql',
        theme: 'neo',
        lineNumbers: true,
        line: true,
        autoRefresh: true,
        styleActiveLine: false,
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
      this.$emit('update:modelValue', this.query)
    }
  },
  methods: {
    onChange: time.debounce((value, editor) => showHint(editor), 400),
    focus () {
      this.$refs.cm.cminstance?.focus()
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

.codemirror-box {
  flex-grow: 1;
  overflow: auto;
}

:deep(.codemirror-container) {
  display: block;
  height: 100%;
  max-height: 100%;
}
:deep(.CodeMirror) {
  height: 100%;
  max-height: 100%;
}
:deep(.CodeMirror-cursor) {
  width: 1px;
  background: var(--color-text-base);
}
</style>
