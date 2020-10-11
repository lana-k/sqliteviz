import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { VuePlugin } from 'vuera'

import '@/assets/styles/variables.css'
import '@/assets/styles/buttons.css'
import '@/assets/styles/textFields.css'
import '@/assets/styles/tables.css'

Vue.use(VuePlugin)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
