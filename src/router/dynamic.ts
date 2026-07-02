import type { MenuRoute } from '@/api/types'
import type { AppRouteRecord } from './types'
import { LAYOUT, resolveComponent } from './component-map'
import { hasPermission, hasRole } from '@/utils/permission'

interface BuildOptions {
  permissions: string[]
  roles: string[]
}

/**
 * 将后端菜单树转换为前端路由树。
 * 顶层菜单以 Layout 作为父级组件包裹，叶子节点挂载实际页面组件。
 * 按钮类型（type === 'button'）不生成路由，仅作为权限标识。
 */
export function buildRoutesFromMenus(menus: MenuRoute[], options: BuildOptions): AppRouteRecord[] {
  const routes: AppRouteRecord[] = []
  for (const menu of menus) {
    if (menu.type === 'button') continue
    if (!hasMenuAccess(menu, options)) continue

    const route = buildRoute(menu, options, true)
    if (route) routes.push(route)
  }
  return routes
}

function buildRoute(menu: MenuRoute, options: BuildOptions, isTopLevel: boolean): AppRouteRecord | null {
  if (menu.type === 'button') return null
  if (!hasMenuAccess(menu, options)) return null

  const children: AppRouteRecord[] = []
  if (menu.children?.length) {
    for (const child of menu.children) {
      const childRoute = buildRoute(child, options, false)
      if (childRoute) children.push(childRoute)
    }
  }

  const hasChildren = children.length > 0
  const component = isTopLevel
    ? LAYOUT
    : resolveComponent(menu.component)

  const route: AppRouteRecord = {
    path: normalizePath(menu.path, isTopLevel),
    name: menu.name,
    component: component ?? LAYOUT,
    redirect: menu.redirect,
    meta: {
      title: menu.name,
      icon: menu.icon,
      hidden: menu.hidden,
      affix: menu.affix,
      cache: menu.keepAlive,
      permissions: menu.permissions,
      roles: menu.roles,
      activeMenu: menu.activeMenu,
      frameSrc: menu.frameSrc,
      alwaysShow: menu.alwaysShow,
      order: menu.order,
    },
  }

  if (hasChildren) {
    route.children = children
  }
  return route
}

/** 顶层 path 以 / 开头，子级 path 相对 */
function normalizePath(path: string, isTopLevel: boolean): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  if (isTopLevel) return path.startsWith('/') ? path : `/${path}`
  return path
}

/** 菜单节点是否可访问（权限 + 角色） */
function hasMenuAccess(menu: MenuRoute, options: BuildOptions): boolean {
  if (menu.permissions?.length && !hasPermission(menu.permissions, options.permissions)) {
    return false
  }
  if (menu.roles?.length && !hasRole(menu.roles, options.roles)) {
    return false
  }
  return true
}
