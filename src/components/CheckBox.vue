<template>
  <div
    :class="['checkbox-container', { 'checked': checked }, {'disabled': disabled}]"
    @click.stop="onClick"
  >
    <div v-show="!checked" class="unchecked" />
    <img
      v-show="checked && !disabled"
      :src="theme === 'light'
        ? require('@/assets/images/checkbox_checked_light.svg')
        : require('@/assets/images/checkbox_checked.svg')"
    />
    <img
      v-show="checked && disabled"
      :src="require('@/assets/images/checkbox_checked_disabled.svg')"
    />
    <span v-if="label" class="label">{{ label }}</span>
  </div>
</template>

<script>
export default {
  name: 'CheckBox',
  props: {
    theme: {
      type: String,
      required: false,
      default: 'accent',
      validator: (value) => {
        return ['accent', 'light'].includes(value)
      }
    },
    init: {
      type: Boolean,
      required: false,
      default: false
    },
    label: {
      type: String,
      required: false,
      default: ''
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      checked: this.init
    }
  },
  methods: {
    onClick () {
      if (!this.disabled) {
        this.checked = !this.checked
        this.$emit('click', this.checked)
      }
    }
  }
}
</script>

<style scoped>
.checkbox-container {
  display: inline-flex;
  cursor: pointer;
}
.unchecked {
  width: 18px;
  height: 18px;
  background-color: white;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-medium);
  box-sizing: border-box;
}
.unchecked:hover {
  background-color: var(--color-bg-light);
}

img {
    display: block;
}
.label {
  margin-left: 6px;
  color: var(--color-text-base);
}
.checked .label {
  color: var(--color-text-active);
}

.disabled.checkbox-container {
  cursor: default;
}

.disabled .label {
  color: var(--color-text-light-2);
}

.disabled .unchecked,
.disabled .unchecked:hover {
  background-color:  var(--color-bg-light-2);
}
</style>
