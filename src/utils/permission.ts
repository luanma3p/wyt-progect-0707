import type { DataScope } from '@/enums/permission'

/** 超级管理员通配标识（单星号 / RuoYi 风格三段星号均视为超管） */
const SUPER_WILDCARDS = new Set(['*', '*:*:*'])

/** 是否拥有超管通配标识 */
function isSuperAdmin(owned: string[]): boolean {
  return owned.some((p) => SUPER_WILDCARDS.has(p))
}

/** 单个权限码是否被拥有的权限覆盖（精确匹配或段通配 teacher:* 匹配 teacher:audit） */
function codeMatches(code: string, owned: string[]): boolean {
  return owned.some((p) => {
    if (p === code) return true
    // 段通配：teacher:* 匹配 teacher:audit / teacher:list
    if (p.endsWith(':*')) {
      const prefix = p.slice(0, -1) // 'teacher:'
      return code.startsWith(prefix)
    }
    return false
  })
}

/** 校验是否拥有指定权限码（任一匹配即通过） */
export function hasPermission(required: string | string[], owned: string[]): boolean {
  if (!owned.length) return false
  if (isSuperAdmin(owned)) return true
  const requiredList = Array.isArray(required) ? required : [required]
  return requiredList.some((code) => codeMatches(code, owned))
}

/** 校验角色 */
export function hasRole(required: string | string[], owned: string[]): boolean {
  if (!owned.length) return false
  const requiredList = Array.isArray(required) ? required : [required]
  return requiredList.some((role) => owned.includes(role))
}

/** 数据范围是否包含指定范围 */
export function hasDataScope(required: DataScope, owned: DataScope[]): boolean {
  return owned.includes(required) || owned.includes(DataScope.ALL)
}
