import Vue from 'vue'
import VueRouter from 'vue-router'
import Editor from '../views/Editor'
import MyQueries from '../views/MyQueries'
import Home from '../views/Home'
import MainView from '../views/MainView'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: Home
  },
  {
    path: '/',
    name: 'MainView',
    component: MainView,
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
