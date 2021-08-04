import Vue from 'vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
import { VuePlugin } from 'vuera'
import VModal from 'vue-js-modal'

import '@/assets/styles/variables.css'
import '@/assets/styles/buttons.css'
import '@/assets/styles/tables.css'
import '@/assets/styles/dialogs.css'
import '@/assets/styles/tooltips.css'
import '@/assets/styles/messages.css'
import 'vue-multiselect/dist/vue-multiselect.min.css'
import '@/assets/styles/multiselect.css'

if (!['localhost', '127.0.0.1'].includes(location.hostname)) {
  import('./registerServiceWorker') // eslint-disable-line no-unused-expressions
}

Vue.use(VuePlugin)
Vue.use(VModal)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
