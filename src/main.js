import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { VuePlugin } from 'vuera'
import VModal from 'vue-js-modal'
import db from '@/dataBase'

import '@/assets/styles/variables.css'
import '@/assets/styles/buttons.css'
import '@/assets/styles/tables.css'
import '@/assets/styles/dialogs.css'

Vue.use(VuePlugin)
Vue.use(VModal)

Vue.config.productionTip = false
Vue.prototype.$db = db

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
