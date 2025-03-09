import { config } from '@vue/test-utils'
import { createVfm, VueFinalModal, useVfm } from 'vue-final-modal'

config.global.plugins = [createVfm()]
config.global.components = {
  'modal': VueFinalModal
}
const vfm = useVfm()
config.global.mocks = {
    $modal: {
      show: modalId => vfm.open(modalId),
      hide: modalId => vfm.close(modalId)
    }
  }