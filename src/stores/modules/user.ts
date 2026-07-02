import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '@/api/auth'
import { userApi } from '@/api/user'
import type { LoginReq, UserInfoResp } from '@/api/types'
import { getToken, removeToken, setToken } from '@/utils/auth'
import type { DataScope } from '@/enums/permission'
import { usePermissionStore } from './permission'
import { useTagsViewStore } from './tagsView'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken())
  const userInfo = ref<UserInfoResp | null>(null)
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])
  const dataScopes = ref<DataScope[]>([])

  /** 登录 */
  async function login(payload: LoginReq): Promise<void> {
    const res = await authApi.login(payload)
    token.value = res.token
    setToken(res.token)
  }

  /** 拉取用户信息 + 权限 */
  async function fetchUserInfo(): Promise<UserInfoResp> {
    const info = await userApi.getUserInfo()
    userInfo.value = info
    roles.value = info.roles ?? []
    permissions.value = info.permissions ?? []
    dataScopes.value = info.dataScopes ?? []
    return info
  }

  /** 登出 */
  async function logout(): Promise<void> {
    try {
      await authApi.logout()
    } catch {
      // 即使接口失败也清空本地
    }
    resetToken()
    const permissionStore = usePermissionStore()
    const tagsViewStore = useTagsViewStore()
    permissionStore.resetRoutes()
    tagsViewStore.removeAllViews()
  }

  /** 重置 token 与用户状态 */
  function resetToken(): void {
    token.value = ''
    userInfo.value = null
    roles.value = []
    permissions.value = []
    dataScopes.value = []
    removeToken()
  }

  return {
    token,
    userInfo,
    roles,
    permissions,
    dataScopes,
    login,
    fetchUserInfo,
    logout,
    resetToken,
  }
},
{
  persist: {
    key: 'BANXUE_USER',
    pick: ['token'],
  },
})
