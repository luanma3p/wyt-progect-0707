import { createRouter, createWebHistory } from 'vue-router'
import { constantRoutes } from './routes'
import { setupRouterGuards } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

setupRouterGuards(router)

export default router

export * from './routes'
export * from './guards'
export * from './dynamic'
export * from './component-map'
export * from './types'
