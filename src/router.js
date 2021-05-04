import Vue from 'vue'
import VueRouter from 'vue-router'
import Editor from '@/views/Main/Editor'
import MyQueries from '@/views/Main/MyQueries'
import Welcome from '@/views/Welcome'
import Main from '@/views/Main'

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
        path: '/my-queries',
        name: 'MyQueries',
        component: MyQueries
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router
