/** HTTP / 业务返回码枚举 */
export enum ResultEnum {
  SUCCESS = 200,
  ERROR = 500,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  TIMEOUT = 408,
}

/** 业务返回码（与后端约定） */
export enum BusinessCodeEnum {
  SUCCESS = 200,
  TOKEN_EXPIRED = 401001,
  TOKEN_INVALID = 401002,
  NO_PERMISSION = 403001,
  PARAM_ERROR = 400001,
  SERVER_ERROR = 500000,
}

/** 请求超时（毫秒） */
export const REQUEST_TIMEOUT = 15000

/** 默认成功码 */
export const DEFAULT_SUCCESS_CODE = ResultEnum.SUCCESS
