import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userApi } from '@/api/user'
import type { MenuRoute } from '@/api/types'
import type { AppRouteRecord } from '@/router/types'
import { buildRoutesFromMenus } from '@/router/dynamic'
import { constantRoutes } from '@/router/routes'
import { hasPermission, hasRole } from '@/utils/permission'
import { useUserStore } from './user'

export const usePermissionStore = defineStore('permission', () => {
  /** 动态生成的路由（需 addRoute） */
  const dynamicRoutes = ref<AppRouteRecord[]>([])
  /** 完整路由（静态 + 动态），用于菜单渲染 */
  const routes = ref<AppRouteRecord[]>([])
  /** 菜单树（已过滤 hidden） */
  const menus = ref<AppRouteRecord[]>([])
  /** 是否已生成 */
  const isRoutesGenerated = ref(false)

  /** 生成动态路由 */
  async function generateRoutes(): Promise<AppRouteRecord[]> {
    const userStore = useUserStore()
    const menusData = await userApi.getMenus()
    const accessRoutes = buildRoutesFromMenus(menusData, {
      permissions: userStore.permissions,
      roles: userStore.roles,
    })
    dynamicRoutes.value = accessRoutes
    routes.value = [...constantRoutes, ...accessRoutes]
    menus.value = filterMenuTree(routes.value)
    isRoutesGenerated.value = true
    return accessRoutes
  }

  /** 重置 */
  function resetRoutes(): void {
    dynamicRoutes.value = []
    routes.value = []
    menus.value = []
    isRoutesGenerated.value = false
  }

  /** 校验权限码 */
  function checkPermission(code: string | string[]): boolean {
    return hasPermission(code, useUserStore().permissions)
  }

  /** 校验角色 */
  function checkRole(role: string | string[]): boolean {
    return hasRole(role, useUserStore().roles)
  }

  return {
    dynamicRoutes,
    routes,
    menus,
    isRoutesGenerated,
    generateRoutes,
    resetRoutes,
    checkPermission,
    checkRole,
  }
})

/** 过滤菜单树（隐藏节点 + 权限过滤） */
function filterMenuTree(routes: AppRouteRecord[]): AppRouteRecord[] {
  const userStore = useUserStore()
  const result: AppRouteRecord[] = []
  for (const route of routes) {
    if (route.meta?.hidden) continue
    if (route.meta?.permissions && !hasPermission(route.meta.permissions, userStore.permissions)) {
      continue
    }
    if (route.meta?.roles && !hasRole(route.meta.roles, userStore.roles)) {
      continue
    }
    const cloned = { ...route }
    if (route.children) {
      cloned.children = filterMenuTree(route.children as AppRouteRecord[])
    }
    result.push(cloned)
  }
  return result
}
