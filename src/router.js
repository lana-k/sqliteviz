import Vue from 'vue'
import VueRouter from 'vue-router'
import Workspace from '@/views/Main/Workspace'
import Inquiries from '@/views/Main/Inquiries'
import Welcome from '@/views/Welcome'
import Main from '@/views/Main'
import store from '@/store'
import database from '@/lib/database'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: Welcome
  },
  {
    path: '/',
    name: 'Main',
    component: Main,
    children: [
      {
        path: '/workspace',
        name: 'Workspace',
        component: Workspace
      },
      {
        path: '/inquiries',
        name: 'Inquiries',
        component: Inquiries
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach(async (to, from, next) => {
  if (!store.state.db) {
    const newDb = database.getNewDatabase()
    await newDb.loadDb()
    store.commit('setDb', newDb)
  }
  next()
})

export default router
