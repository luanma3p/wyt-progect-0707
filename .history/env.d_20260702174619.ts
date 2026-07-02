/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 应用标题 */
  readonly VITE_APP_TITLE: string
  /** API 基础地址（代理目标） */
  readonly VITE_API_BASE_URL: string
  /** API 请求前缀（用于代理识别） */
  readonly VITE_API_PREFIX: string
  /** 开发服务器端口 */
  readonly VITE_PORT: string
  /** 路由模式 hash | history */
  readonly VITE_ROUTER_MODE: 'hash' | 'history'
  /** Token 存储键名 */
  readonly VITE_TOKEN_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
