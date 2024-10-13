import { createRouter, createWebHashHistory } from 'vue-router'
import Workspace from '@/views/Main/Workspace'
import Inquiries from '@/views/Main/Inquiries'
import Welcome from '@/views/Welcome'
import Main from '@/views/Main'
import LoadView from '@/views/LoadView'
import store from '@/store'
import database from '@/lib/database'

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
  },
  {
    path: '/load',
    name: 'Load',
    component: LoadView
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  if (!store.state.db && to.name !== 'Load') {
    const newDb = database.getNewDatabase()
    await newDb.loadDb()
    store.commit('setDb', newDb)
  }
  next()
})

export default router
