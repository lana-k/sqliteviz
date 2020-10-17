<template>
  <div class="checkbox-container" @click.stop="checked = !checked">
    <div v-show="!checked" class="unchecked" />
    <img
      v-show="checked && theme === 'accent'"
      :src="require('@/assets/images/checkbox_checked.svg')"
    />
    <img
      v-show="checked && theme === 'light'"
      :src="require('@/assets/images/checkbox_checked_light.svg')"
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
    }
  },
  data () {
    return {
      checked: false
    }
  },
  watch: {
    checked () {
      this.$emit('change', this.checked)
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
img {
    display: block;
}
</style>
