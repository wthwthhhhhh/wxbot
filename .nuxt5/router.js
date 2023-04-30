import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _531a09a6 = () => interopDefault(import('..\\pages\\admin\\index.vue' /* webpackChunkName: "pages/admin/index" */))
const _534452d0 = () => interopDefault(import('..\\pages\\admin\\enume.js' /* webpackChunkName: "pages/admin/enume" */))
const _67a4334f = () => interopDefault(import('..\\pages\\admin\\friend\\index.vue' /* webpackChunkName: "pages/admin/friend/index" */))
const _74a8b0e8 = () => interopDefault(import('..\\pages\\admin\\group\\index.vue' /* webpackChunkName: "pages/admin/group/index" */))
const _5a4a339d = () => interopDefault(import('..\\pages\\admin\\reply\\index.vue' /* webpackChunkName: "pages/admin/reply/index" */))
const _093696c8 = () => interopDefault(import('..\\pages\\admin\\task\\index.vue' /* webpackChunkName: "pages/admin/task/index" */))
const _2510be27 = () => interopDefault(import('..\\pages\\auth\\login.vue' /* webpackChunkName: "pages/auth/login" */))
const _0bc09ff8 = () => interopDefault(import('..\\pages\\admin\\reply\\modal.vue' /* webpackChunkName: "pages/admin/reply/modal" */))
const _8aa5f9ba = () => interopDefault(import('..\\pages\\admin\\task\\modal.vue' /* webpackChunkName: "pages/admin/task/modal" */))
const _04855fb8 = () => interopDefault(import('..\\pages\\index.vue' /* webpackChunkName: "pages/index" */))

const emptyFn = () => {}

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: '/',
  linkActiveClass: 'nuxt-link-active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/admin",
    component: _531a09a6,
    name: "admin"
  }, {
    path: "/admin/enume",
    component: _534452d0,
    name: "admin-enume"
  }, {
    path: "/admin/friend",
    component: _67a4334f,
    name: "admin-friend"
  }, {
    path: "/admin/group",
    component: _74a8b0e8,
    name: "admin-group"
  }, {
    path: "/admin/reply",
    component: _5a4a339d,
    name: "admin-reply"
  }, {
    path: "/admin/task",
    component: _093696c8,
    name: "admin-task"
  }, {
    path: "/auth/login",
    component: _2510be27,
    name: "auth-login"
  }, {
    path: "/admin/reply/modal",
    component: _0bc09ff8,
    name: "admin-reply-modal"
  }, {
    path: "/admin/task/modal",
    component: _8aa5f9ba,
    name: "admin-task-modal"
  }, {
    path: "/",
    component: _04855fb8,
    name: "index"
  }],

  fallback: false
}

export function createRouter (ssrContext, config) {
  const base = (config._app && config._app.basePath) || routerOptions.base
  const router = new Router({ ...routerOptions, base  })

  // TODO: remove in Nuxt 3
  const originalPush = router.push
  router.push = function push (location, onComplete = emptyFn, onAbort) {
    return originalPush.call(this, location, onComplete, onAbort)
  }

  const resolve = router.resolve.bind(router)
  router.resolve = (to, current, append) => {
    if (typeof to === 'string') {
      to = normalizeURL(to)
    }
    return resolve(to, current, append)
  }

  return router
}
