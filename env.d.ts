/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 应用标题 */
  readonly VITE_APP_TITLE: string
  /** API 基础地址（同时作为代理前缀与请求 baseURL） */
  readonly VITE_API_BASE_URL: string
  /** 是否启用 MSW Mock（'true' / 'false'） */
  readonly VITE_USE_MOCK: string
  /** 是否移除 console（生产环境） */
  readonly VITE_DROP_CONSOLE: string
  /** 开发环境代理目标地址 */
  readonly VITE_PROXY_TARGET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
