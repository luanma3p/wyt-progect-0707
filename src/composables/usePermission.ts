import { useUserStore } from '@/stores/modules/user'
import { hasPermission, hasRole, hasDataScope } from '@/utils/permission'
import type { DataScope } from '@/enums/permission'

/** 权限判断组合式（供模板与方法使用） */
export function usePermission() {
  const userStore = useUserStore()

  function checkPerm(code: string | string[]): boolean {
    return hasPermission(code, userStore.permissions)
  }

  function checkRole(role: string | string[]): boolean {
    return hasRole(role, userStore.roles)
  }

  function checkDataScope(scope: DataScope): boolean {
    return hasDataScope(scope, userStore.dataScopes)
  }

  return {
    permissions: userStore.permissions,
    roles: userStore.roles,
    dataScopes: userStore.dataScopes,
    hasPerm: checkPerm,
    hasRole: checkRole,
    hasDataScope: checkDataScope,
  }
}
