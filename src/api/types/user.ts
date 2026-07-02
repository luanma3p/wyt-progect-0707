import type { DataScope } from '@/enums/permission'

/** 用户信息响应 */
export interface UserInfoResp {
  id: string | number
  username: string
  nickname: string
  avatar?: string
  email?: string
  phone?: string
  deptId?: string | number
  deptName?: string
  roles: string[]
  permissions: string[]
  dataScopes?: DataScope[]
}

/** 后端菜单/路由节点（原始结构） */
export interface MenuRoute {
  id: string | number
  parentId: string | number | null
  name: string
  path: string
  component?: string
  redirect?: string
  /** 菜单类型：menu / button */
  type?: 'menu' | 'button'
  icon?: string
  hidden?: boolean
  keepAlive?: boolean
  affix?: boolean
  alwaysShow?: boolean
  /** 权限码（按钮级为权限标识） */
  permission?: string
  permissions?: string[]
  roles?: string[]
  activeMenu?: string
  /** 外链 */
  frameSrc?: string
  children?: MenuRoute[]
  order?: number
}

/** 权限响应 */
export interface PermissionResp {
  roles: string[]
  permissions: string[]
  dataScopes: DataScope[]
}
