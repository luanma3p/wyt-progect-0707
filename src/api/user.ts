import { http } from '@/utils/request'
import type { MenuRoute, UserInfoResp } from './types/user'

export const userApi = {
  /** 获取当前用户信息 */
  getUserInfo: () => http.get<UserInfoResp>('/user/info'),

  /** 获取菜单/路由（动态路由） */
  getMenus: () => http.get<MenuRoute[]>('/user/menus'),
}
