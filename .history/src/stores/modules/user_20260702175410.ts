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
  async function login(payload: LoginReq): Promise<void>