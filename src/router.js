import Vue from 'vue'
import VueRouter from 'vue-router'
import Editor from '@/views/Main/Editor'
import MyInquiries from '@/views/Main/MyInquiries'
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
        path: '/editor',
        name: 'Editor',
        component: Editor
      },
      {
        path: '/my-inquiries',
        name: 'MyInquiries',
        component: MyInquiries
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
