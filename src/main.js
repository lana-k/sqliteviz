import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
import { createVfm, VueFinalModal, useVfm } from 'vue-final-modal'

import '@/assets/styles/variables.css'
import '@/assets/styles/typography.css'
import '@/assets/styles/buttons.css'
import '@/assets/styles/tables.css'
import '@/assets/styles/dialogs.css'
import '@/assets/styles/tooltips.css'
import '@/assets/styles/messages.css'
import 'vue-multiselect/dist/vue-multiselect.css'
import '@/assets/styles/multiselect.css'
import 'vue-final-modal/style.css'

if (!['localhost', '127.0.0.1'].includes(location.hostname)) {
  import('./registerServiceWorker') // eslint-disable-line no-unused-expressions
}

const app = createApp(App)
  .use(router)
  .use(store)
  .use(createVfm())
  .component('modal', VueFinalModal)

const vfm = useVfm()
app.config.globalProperties.$modal = {
  show: modalId => vfm.open(modalId),
  hide: modalId => vfm.close(modalId)
}
app.mount('#app')
