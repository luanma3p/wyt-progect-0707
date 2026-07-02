import type { Router } from 'vue-router'
import NProgress from 'nprogress'
import { useUserStore } from '@/stores/modules/user'
import { usePermissionStore } from '@/stores/modules/permission'
import { useTagsViewStore } from '@/stores/modules/tagsView'
import { appSettings } from '@/config'
import { checkRoutePermission } from './permission'
import { notFoundRoute } from './routes'

NProgress.configure({ showSpinner: false })

const WHITE_LIST = ['/login', '/403', '/404']

export function setupRouterGuards(router: Router) {
  router.beforeEach(async (to, _from, next) => {
    NProgress.start()
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    const hasToken = !!userStore.token

    // 已登录
    if (hasToken) {
      if (to.path === '/login') {
        next({ path: '/' })
        return
      }
      // 首次进入：生成动态路由
      if (!permissionStore.isRoutesGenerated) {
        try {
          await userStore.fetchUserInfo()
          const accessRoutes = await permissionStore.generateRoutes()
          accessRoutes.forEach((r) => router.addRoute(r))
          // 注入 404 兜底（必须最后添加）
          router.addRoute(notFoundRoute)
          // 重新导航以匹配新路由
          next({ ...to, replace: true })
          return
        } catch (err) {
          console.error('[router] 动态路由生成失败：', err)
          await userStore.logout()
          next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
          return
        }
      }
      // 路由级权限校验
      if (!checkRoutePermission(to)) {
        next('/403')
        return
      }
      next()
      return
    }

    // 未登录
    if (WHITE_LIST.includes(to.path)) {
      next()
      return
    }
    next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  })

  router.afterEach((to) => {
    // tagsView
    const tagsViewStore = useTagsViewStore()
    tagsViewStore.addView(to)
    // 标题
    const title = (to.meta?.title as string) || ''
    document.title = title ? `${title} - ${appSettings.title}` : appSettings.title
    NProgress.done()
  })

  router.onError((err) => {
    console.error('[router] 路由错误：', err)
    NProgress.done()
  })
}
