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

      <button
        type="button"
        @click="copyToClipboard"
      >
        Copy
      </button>
    </div>
    <div class="value-body">
      <codemirror
        v-if="currentFormat === 'json'"
        :value="formattedJson"
        :options="cmOptions"
      />
      <div v-else class="text-value">
        {{ cellValue }}
      </div>
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
import cIo from '@/lib/utils/clipboardIo'

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
        { text: 'Text', value: 'text' }
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
    },
    copyToClipboard () {
      cIo.copyText(this.currentFormat === 'json'
        ? this.formattedJson
        : this.cellValue,
      'The value is copied to clipboard.'
      )
    }
  }
}
</script>

<style scoped>
.value-viewer {
  background-color: var(--color-white);
  height: 100%;
  display: flex;
  flex-direction: column;
}
.value-viewer-toolbar {
  display: flex;
  justify-content: end;
}
.value-body {
  flex-grow: 1;
  overflow: auto;
}
.text-value {
  padding: 8px 8px;
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
