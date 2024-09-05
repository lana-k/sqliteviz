<template>
  <div :class="{ 'disabled': disabled }">
    <div class="text-field-label">Delimiter</div>
    <div
      class="delimiter-selector-container"
      :style="{ width: width }"
      @click="onContainerClick"
    >
      <div class="value">
        <input
          :class="{ 'filled': filled }"
          ref="delimiterInput"
          type="text"
          maxlength="1"
          v-model="inputValue"
          @click.stop
          :disabled="disabled"
        />
        <div class="name">{{ getSymbolName(value) }}</div>
      </div>
      <div class="controls" @click.stop>
        <clear-icon @click.native="clear" :disabled="disabled"/>
        <drop-down-chevron
          :disabled="disabled"
          @click.native="!disabled && (showOptions = !showOptions)"
        />
      </div>
    </div>
    <div v-show="showOptions" class="options" :style="{ width: width }">
      <div
        v-for="(option, index) in options"
        :key="index"
        @click="chooseOption(option)"
        class="option"
      >
        <pre>{{option}}</pre><div>{{ getSymbolName(option) }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import ascii from './ascii'
import DropDownChevron from '@/components/svg/dropDownChevron'
import ClearIcon from '@/components/svg/clear'

export default {
  name: 'DelimiterSelector',
  props: ['value', 'width', 'disabled'],
  components: { DropDownChevron, ClearIcon },
  data () {
    return {
      showOptions: false,
      options: [',', '\t', ' ', '|', ';', '\u001F', '\u001E'],
      filled: false,
      inputValue: ''
    }
  },
  watch: {
    inputValue () {
      if (this.inputValue) {
        this.filled = true
        if (this.inputValue !== this.value) {
          this.$emit('input', this.inputValue)
        }
      } else {
        this.filled = false
      }
    }
  },
  created () {
    this.inputValue = this.value
  },
  methods: {
    getSymbolName (str) {
      if (!str) {
        return ''
      }
      return ascii[str.charCodeAt(0).toString()].name
    },
    chooseOption (option) {
      this.inputValue = option
      this.showOptions = false
    },
    onContainerClick (event) {
      this.$refs.delimiterInput.focus()
    },

    clear () {
      if (!this.disabled) {
        this.inputValue = ''
        this.$refs.delimiterInput.focus()
      }
    }
  }
}
</script>

<style scoped>
.delimiter-selector-container {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-medium-2);
  height: 36px;
  padding: 0 8px;
  font-size: 12px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.value {
  display: flex;
  align-items: center;
}

.value .name {
  color: var(--color-text-light-2);
  cursor: default;
  margin-left: 4px;
}

.controls {
  display: flex;
  align-items: center;
}

.options {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-width: 0 1px 1px 1px;
  color: var(--color-text-base);
  border-radius: var(--border-radius-medium-2);
  font-size: 12px;
  box-sizing: border-box;
  position: absolute;
  z-index: 2;
}

.option {
  display: flex;
  align-items: center;
  height: 24px;
  padding: 0 6px;
}

.option:hover {
  background-color: var(--color-bg-light);
  color: var(--color-text-active);
  cursor: pointer;
}

.option pre {
  background-color: var(--color-bg-warning);
  line-height: 20px;
  margin-right: 6px;
  tab-size: 1;
  font-family: monospace;
  width: 16px;
  text-align: center;
}

input {
  background: var(--color-white);
  border: none;
  color: var(--color-text-base);
  height: 20px;
  font-family: monospace;
  font-size: 12px;
  box-sizing: border-box;
  width: 16px;
  text-align: center;
}

input.filled {
  background: var(--color-bg-warning);
}

input:focus {
  outline: none;
}

input:disabled {
  background: var(--color-bg-light);
  color: var(--color-text-light-2);
  cursor: default;
}

.text-field-label {
  font-size: 12px;
  color: var(--color-text-base);
  padding-left: 8px;
  margin-bottom: 2px;
}

.disabled .text-field-label {
  color: var(--color-text-light-2);
}

.disabled .delimiter-selector-container {
  background: var(--color-bg-light);
}
</style>
