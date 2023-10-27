<template>
  <div class="value-viewer">
    <div class="value-viewer-toolbar">
      <button
        v-for="format in formats"
        :key="format.value"
        type="button"
        :aria-selected="currentFormat === format.value"
        @click="currentFormat = format.value"
      >
        {{ format.text }}
      </button>
    </div>
    <codemirror
        v-if="currentFormat === 'json'"
        :value="formattedJson"
        :options="cmOptions"
      />
      <div v-else class="text-value">
        {{ cellValue }}
      </div>
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
      formats: [
        { text: 'JSON', value: 'json' },
        { text: 'TEXT', value: 'text' }
      ],
      currentFormat: 'text',
      cmOptions: {
        tabSize: 4,
        mode: { name: 'javascript', json: true },
        theme: 'neo',
        lineNumbers: true,
        line: true,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        readOnly: true
      },
      formattedJson: ''
    }
  },
  watch: {
    currentFormat () {
      this.formattedJson = ''
      if (this.currentFormat === 'json') {
        this.formatJson(this.cellValue)
      }
    },
    cellValue () {
      if (this.currentFormat === 'json') {
        this.formatJson(this.cellValue)
      }
    }
  },
  methods: {
    formatJson (jsonStr) {
      try {
        this.formattedJson = JSON.stringify(
          JSON.parse(jsonStr), null, 4
        )
      } catch {
        this.formattedJson = ''
      }
    }
  }
}
</script>

<style scoped>
.value-viewer {
  background-color: var(--color-white);
}
.value-viewer-toolbar {
  display: flex;
  justify-content: end;
}
.text-value {
  padding: 2px 8px;
  color: var(--color-text-base);
}

.value-viewer-toolbar button {
  font-size: 10px;
  height: 20px;
  padding: 0 8px;
  border: none;
  background: transparent;
  color: var(--color-text-base);
  border-radius: var(--border-radius-small);
}

.value-viewer-toolbar button:hover {
  background-color: var(--color-bg-light);
}

.value-viewer-toolbar button[aria-selected="true"] {
  color: var(--color-accent);
}
</style>
