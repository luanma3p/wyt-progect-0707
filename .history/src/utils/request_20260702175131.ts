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
  /** 业务错误是否弹 ElMessage，