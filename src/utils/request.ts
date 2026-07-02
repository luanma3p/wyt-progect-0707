import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { ElMessage, ElLoading } from 'element-plus'
import { v4 as uuidv4 } from 'uuid'
import { BusinessCodeEnum, ResultEnum } from '@/enums/http'
import type { ApiResponse } from '@/api/types/common'
import { getToken, removeToken } from './auth'

/** 单次请求可选行为 */
export interface RequestOptions {
  /** 业务错误是否弹 ElMessage，默认 true */
  showError?: boolean
  /** 是否触发全局 loading，默认 false */
  showLoading?: boolean
  /** 是否注入 token，默认 true */
  withToken?: boolean
  /** 是否返回完整 ApiResponse（而非解包 data），默认 false */
  returnFull?: boolean
  /** 网络错误重试次数，默认 0 */
  retry?: number
}

/** 业务错误抛出的异常 */
export class ApiError extends Error {
  code: number
  data?: unknown
  constructor(message: string, code: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.data = data
  }
}

// 全局 loading 计数
let loadingCount = 0
let loadingInstance: ReturnType<typeof ElLoading.service> | null = null

function startLoading() {
  loadingCount++
  if (loadingCount === 1) {
    loadingInstance = ElLoading.service({
      lock: true,
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.3)',
    })
  }
}

function endLoading() {
  if (loadingCount > 0) loadingCount--
  if (loadingCount === 0 && loadingInstance) {
    loadingInstance.close()
    loadingInstance = null
  }
}

// 请求取消（重复请求自动取消上一个）
const pendingMap = new Map<string, AbortController>()
function getPendingKey(config: InternalAxiosRequestConfig): string {
  const { method, url, params, data } = config
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&')
}
function addPending(config: InternalAxiosRequestConfig) {
  const key = getPendingKey(config)
  if (pendingMap.has(key)) {
    pendingMap.get(key)?.abort()
  }
  const controller = new AbortController()
  config.signal = controller.signal
  pendingMap.set(key, controller)
}
function removePending(config: InternalAxiosRequestConfig) {
  pendingMap.delete(getPendingKey(config))
}

// 跳转登录（避免循环依赖，动态引入 router）
async function redirectToLogin() {
  removeToken()
  pendingMap.forEach((c) => c.abort())
  pendingMap.clear()
  const { default: router } = await import('@/router')
  const current = router.currentRoute.value
  router.replace(`/login?redirect=${encodeURIComponent(current.fullPath)}`)
}

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
})

// 请求拦截
service.interceptors.request.use(
  (config) => {
    const options = (config as InternalAxiosRequestConfig & { _options?: RequestOptions })._options
    const opt = options ?? {}
    if (opt.withToken !== false) {
      const token = getToken()
      if (token) config.headers.Authorization = `Bearer ${token}`
    }
    config.headers['X-Request-Id'] = uuidv4()
    addPending(config)
    if (opt.showLoading) startLoading()
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const config = response.config as InternalAxiosRequestConfig & { _options?: RequestOptions }
    const options = config._options ?? {}
    removePending(config)
    if (options.showLoading) endLoading()

    const res = response.data
    // 非 JSON / 二进制流（如文件下载）
    if (response.config.responseType === 'blob' || !res || typeof res.code === 'undefined') {
      return response.data as unknown as AxiosResponse
    }

    // 业务码分流
    if (res.code === ResultEnum.SUCCESS || res.code === BusinessCodeEnum.SUCCESS) {
      return options.returnFull ? (res as unknown as AxiosResponse) : (res.data as unknown as AxiosResponse)
    }

    // token 失效
    if (res.code === BusinessCodeEnum.TOKEN_EXPIRED || res.code === BusinessCodeEnum.TOKEN_INVALID) {
      ElMessage.error(res.message || '登录已过期，请重新登录')
      redirectToLogin()
      return Promise.reject(new ApiError(res.message, res.code, res.data))
    }

    // 其他业务错误
    if (options.showError !== false) {
      ElMessage.error(res.message || '请求失败')
    }
    return Promise.reject(new ApiError(res.message, res.code, res.data))
  },
  (error) => {
    const config = error.config as (InternalAxiosRequestConfig & { _options?: RequestOptions }) | undefined
    if (config) {
      removePending(config)
      const options = config._options ?? {}
      if (options.showLoading) endLoading()
    }

    // 请求取消（静默）
    if (axios.isCancel(error) || error.name === 'CanceledError') {
      return Promise.reject(new ApiError('请求已取消', -1))
    }

    const status = error.response?.status
    let message = '请求失败'
    if (error.code === 'ECONNABORTED') {
      message = '请求超时，请稍后重试'
    } else if (status === 401) {
      message = '登录已过期，请重新登录'
      redirectToLogin()
    } else if (status === 403) {
      message = '没有访问权限'
    } else if (status === 404) {
      message = '请求资源不存在'
    } else if (status && status >= 500) {
      message = '服务器异常，请稍后重试'
    } else if (!error.response) {
      message = '网络异常，请检查网络连接'
    }
    if (config?._options?.showError !== false) {
      ElMessage.error(message)
    }
    return Promise.reject(new ApiError(message, status ?? -1, error.response?.data))
  },
)

/** 类型化请求入口 */
export function request<T = unknown>(
  config: AxiosRequestConfig,
  options: RequestOptions = {},
): Promise<T> {
  const merged = { ...config, _options: options } as InternalAxiosRequestConfig
  return service(merged) as unknown as Promise<T>
}

/** 对外便捷方法 */
export const http = {
  get<T = unknown>(url: string, params?: object, options?: RequestOptions): Promise<T> {
    return request<T>({ url, method: 'get', params }, options)
  },
  post<T = unknown>(url: string, data?: object, options?: RequestOptions): Promise<T> {
    return request<T>({ url, method: 'post', data }, options)
  },
  put<T = unknown>(url: string, data?: object, options?: RequestOptions): Promise<T> {
    return request<T>({ url, method: 'put', data }, options)
  },
  delete<T = unknown>(url: string, params?: object, options?: RequestOptions): Promise<T> {
    return request<T>({ url, method: 'delete', params }, options)
  },
  upload<T = unknown>(
    url: string,
    file: File | FormData,
    options?: RequestOptions,
  ): Promise<T> {
    const data = file instanceof FormData ? file : (() => {
      const fd = new FormData()
      fd.append('file', file)
      return fd
    })()
    return request<T>(
      { url, method: 'post', data, headers: { 'Content-Type': 'multipart/form-data' } },
      options,
    )
  },
  download(url: string, params?: object, options?: RequestOptions): Promise<Blob> {
    return request<Blob>(
      { url, method: 'get', params, responseType: 'blob' },
      options,
    )
  },
}

export default service
