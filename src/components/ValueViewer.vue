<template>
  <div class="value-viewer">
    <template v-if="!empty">
      <div class="value-viewer-toolbar">
        <button
          v-for="format in formats"
          :key="format.value"
          type="button"
          :aria-selected="currentFormat === format.value"
          :class="format.value"
          @click="currentFormat = format.value"
        >
          {{ format.text }}
        </button>

        <button type="button" class="copy" @click="copyToClipboard">
          Copy
        </button>
        <button
          type="button"
          class="line-wrap"
          :aria-selected="lineWrapping === true"
          @click="lineWrapping = !lineWrapping"
        >
          Line wrap
        </button>
      </div>
      <div class="value-body">
        <codemirror
          v-if="currentFormat === 'json' && formattedJson"
          :value="formattedJson"
          :options="cmOptions"
          class="json-value original-style"
        />
        <pre
          v-if="currentFormat === 'text'"
          :class="[
            'text-value',
            { 'meta-value': isNull || isBlob },
            { 'line-wrap': lineWrapping }
          ]"
          >{{ cellText }}</pre
        >
        <logs
          v-if="messages && messages.length > 0"
          :messages="messages"
          class="messages"
        />
      </div>
    </template>

    <div v-show="empty" class="empty-message">
      {{ emptyMessage }}
    </div>
  </div>
</template>

<script>
import Codemirror from 'codemirror-editor-vue3'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/addon/fold/foldcode.js'
import 'codemirror/addon/fold/foldgutter.js'
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/fold/brace-fold.js'
import 'codemirror/theme/neo.css'
import cIo from '@/lib/utils/clipboardIo'
import Logs from '@/components/Common/Logs'

export default {
  components: {
    Codemirror,
    Logs
  },
  props: {
    cellValue: [String, Number, Uint8Array],
    empty: Boolean,
    emptyMessage: String
  },
  data() {
    return {
      formats: [
        { text: 'Text', value: 'text' },
        { text: 'JSON', value: 'json' }
      ],
      currentFormat: 'text',
      lineWrapping: false,
      formattedJson: '',
      messages: []
    }
  },
  computed: {
    cmOptions() {
      return {
        tabSize: 4,
        mode: { name: 'javascript', json: true },
        theme: 'neo',
        lineNumbers: true,
        line: true,
        lineWrapping: this.lineWrapping,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        readOnly: true
      }
    },
    isBlob() {
      return this.cellValue && ArrayBuffer.isView(this.cellValue)
    },
    isNull() {
      return this.cellValue === null
    },
    cellText() {
      const value = this.cellValue
      if (this.isNull) {
        return 'NULL'
      }
      if (this.isBlob) {
        return 'BLOB'
      }
      return value
    }
  },
  watch: {
    currentFormat() {
      this.messages = []
      this.formattedJson = ''
      if (this.currentFormat === 'json') {
        this.formatJson(this.cellValue)
      }
    },
    cellValue() {
      this.messages = []
      if (this.currentFormat === 'json') {
        this.formatJson(this.cellValue)
      }
    }
  },
  methods: {
    formatJson(jsonStr) {
      try {
        this.formattedJson = JSON.stringify(JSON.parse(jsonStr), null, 4)
      } catch (e) {
        this.formattedJson = ''
        this.messages = [
          {
            type: 'error',
            message: "Can't parse JSON."
          }
        ]
      }
    },
    copyToClipboard() {
      cIo.copyText(
        this.currentFormat === 'json' ? this.formattedJson : this.cellValue,
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
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
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
  padding: 0 8px;
  margin: 0;
  color: var(--color-text-base);
}

.json-value {
  margin-top: -4px;
}

.text-value.meta-value {
  font-style: italic;
  color: var(--color-text-light-2);
}

.text-value.line-wrap {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.messages {
  margin: 0 8px;
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

.value-viewer-toolbar button[aria-selected='true'] {
  color: var(--color-accent);
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

.empty-message {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-text-base);
  font-size: 13px;
  text-align: center;
}
</style>
