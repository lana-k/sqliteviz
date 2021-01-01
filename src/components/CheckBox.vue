<template>
  <div class="checkbox-container" @click.stop="onClick">
    <div v-show="!checked" class="unchecked" />
    <img
      v-show="checked"
      :src="theme === 'light'
        ? require('@/assets/images/checkbox_checked_light.svg')
        : require('@/assets/images/checkbox_checked.svg')"
    />
  </div>
</template>

<script>
export default {
  name: 'checkBox',
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
    }
  },
  data () {
    return {
      checked: this.init
    }
  },
  methods: {
    onClick () {
      this.checked = !this.checked
      this.$emit('click', this.checked)
    }
  }
}
</script>

<style scoped>
.checkbox-container {
  display: inline-block;
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
</style>
