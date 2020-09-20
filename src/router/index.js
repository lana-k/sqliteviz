import Vue from 'vue'
import VueRouter from 'vue-router'
import Editor from '../views/Editor'
import MyQueries from '../views/MyQueries'
import DbUpload from '../views/DbUpload'
import MainView from '../views/MainView'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: DbUpload
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
