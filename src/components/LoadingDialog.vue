<template>
  <modal
    :name="name"
    classes="dialog"
    height="auto"
    :clickToClose="false"
  >
    <div class="dialog-header">
      {{ title }}
      <close-icon @click="$emit('cancel')" :disabled="loading"/>
    </div>
    <div class="dialog-body">
      <div v-if="loading" class="loading-dialog-body">
        <loading-indicator :size="30" class="state-icon"/>
        {{ loadingMsg }}
      </div>
      <div v-else class="loading-dialog-body">
        <img :src="require('@/assets/images/success.svg')" class="success-icon state-icon" />
        {{ successMsg }}
      </div>
    </div>
    <div class="dialog-buttons-container">
      <button
        class="secondary"
        :disabled="loading"
        @click="$emit('cancel')"
      >
        Cancel
      </button>
      <button
        class="primary"
        :disabled="loading"
        @click="$emit('action')"
      >
        {{ actionBtnName }}
      </button>
    </div>
  </modal>
</template>

<script>
import LoadingIndicator from '@/components/LoadingIndicator'
import CloseIcon from '@/components/svg/close'

export default {
  name: 'loadingDialog',
  props: {
    loadingMsg: String,
    successMsg: String,
    actionBtnName: String,
    name: String,
    title: String,
    loading: Boolean
  },
  watch: {
    loading () {
      if (this.loading) {
        this.$modal.show(this.name)
      }
    }
  },
  components: { LoadingIndicator, CloseIcon },
  methods: {
    cancel () {
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
.loading-dialog-body {
  display: flex;
  align-items: center;
}
.success-icon {
  width: 30px;
}

.state-icon {
  margin-right: 8px;
}
</style>
