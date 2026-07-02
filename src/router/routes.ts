import type { AppRouteRecord } from './types'

/** 静态常量路由（无需鉴权 / 首页 / 错误页） */
export const constantRoutes: AppRouteRecord[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { hidden: true, title: '登录' },
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: { hidden: true, title: '无权限' },
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { hidden: true, title: '页面不存在' },
  },
  {
    path: '/redirect',
    name: 'Redirect',
    component: () => import('@/layouts/default/index.vue'),
    meta: { hidden: true },
    children: [
      {
        path: ':path(.*)',
        name: 'RedirectHandler',
        component: () => import('@/views/redirect/index.vue'),
        meta: { hidden: true },
      },
    ],
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/default/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '数据看板', icon: 'dashboard', affix: true, cache: true },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人中心', hidden: true },
      },
    ],
  },
]

/** 404 兜底（动态路由注入后再添加） */
export const notFoundRoute: AppRouteRecord = {
  path: '/:pathMatch(.*)*',
  name: 'NotFoundCatch',
  redirect: '/404',
  meta: { hidden: true },
}
