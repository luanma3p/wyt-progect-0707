/** 登录请求 */
export interface LoginReq {
  username: string
  password: string
  captcha?: string
  captchaKey?: string
  remember?: boolean
}

/** 登录响应 */
export interface LoginResp {
  token: string
  refreshToken?: string
  expiresIn?: number
}

/** 刷新 token 响应 */
export interface RefreshTokenResp {
  token: string
  expiresIn?: number
}

/** 登出请求 */
export interface LogoutReq {
  refreshToken?: string
}
