import type { RouteLocationNormalized } from 'vue-router'
import { hasPermission, hasRole } from '@/utils/permission'
import { useUserStore } from '@/stores/modules/user'

/** 路由级权限校验：meta.permissions / meta.roles 任一不满足则拒绝 */
export function checkRoutePermission(to: RouteLocationNormalized): boolean {
  const { permissions, roles } = to.meta
  const userStore = useUserStore()
  if (permissions?.length && !hasPermission(permissions, userStore.permissions)) {
    return false
  }
  if (roles?.length && !hasRole(roles, userStore.roles)) {
    return false
  }
  return true
}
