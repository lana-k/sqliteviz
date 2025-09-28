<template>
  <modal
    v-model="show"
    class="dialog"
    :clickToClose="false"
    :contentTransition="{ name: 'loading-dialog' }"
    :overlayTransition="{ name: 'loading-dialog' }"
    @update:modelValue="$emit('update:modelValue', $event)"
  >
    <div class="dialog-header">
      {{ title }}
      <close-icon :disabled="loading" @click="cancel" />
    </div>
    <div class="dialog-body">
      <div v-if="loading" class="loading-dialog-body">
        <loading-indicator :size="30" class="state-icon" />
        {{ loadingMsg }}
      </div>
      <div v-else class="loading-dialog-body">
        <img
          src="~@/assets/images/success.svg"
          class="success-icon state-icon"
        />
        {{ successMsg }}
      </div>
    </div>
    <div class="dialog-buttons-container">
      <button
        class="secondary"
        type="button"
        :disabled="loading"
        @click="cancel"
      >
        Cancel
      </button>
      <button
        class="primary"
        type="button"
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
  name: 'LoadingDialog',
  components: { LoadingIndicator, CloseIcon },
  props: {
    modelValue: Boolean,
    loadingMsg: String,
    successMsg: String,
    actionBtnName: String,
    title: String,
    loading: Boolean
  },
  data() {
    return {
      show: this.modelValue
    }
  },
  emits: ['cancel', 'action', 'update:modelValue'],
  watch: {
    modelValue() {
      this.show = this.modelValue
    },
    loading() {
      if (this.loading) {
        this.$emit('update:modelValue', true)
      }
    }
  },
  methods: {
    cancel() {
      this.$emit('cancel')
      this.$emit('update:modelValue', false)
    }
  }
}
</script>

<style>
.loading-dialog-enter-active {
  animation: show-modal 1s linear 0s 1;
}
.loading-dialog-leave-active {
  opacity: 0;
}

@keyframes show-modal {
  0% {
    opacity: 0;
  }
  99% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.loading-modal {
  width: 400px;
}
</style>

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
