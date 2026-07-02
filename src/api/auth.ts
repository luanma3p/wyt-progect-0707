import { http } from '@/utils/request'
import type { LoginReq, LoginResp, LogoutReq, RefreshTokenResp } from './types/auth'

export const authApi = {
  /** 登录 */
  login: (data: LoginReq) => http.post<LoginResp>('/auth/login', data, { withToken: false }),

  /** 登出 */
  logout: (data?: LogoutReq) => http.post<void>('/auth/logout', data),

  /** 刷新 token */
  refreshToken: (refreshToken: string) =>
    http.post<RefreshTokenResp>('/auth/refresh', { refreshToken }, { withToken: false }),
}
