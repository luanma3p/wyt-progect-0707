/** 统一响应壳（与后端约定） */
export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message: string
}

/** 分页查询基础参数 */
export interface PageQuery {
  pageNum: number
  pageSize: number
  [key: string]: unknown
}

/** 分页结果 */
export interface PageResult<T = unknown> {
  list: T[]
  total: number
  pageNum?: number
  pageSize?: number
}

/** 下拉选项 */
export interface Option<T = string | number> {
  label: string
  value: T
  disabled?: boolean
}

/** 字典项 */
export interface DictItem {
  label: string
  value: string | number
  raw?: unknown
  tagType?: '' | 'success' | 'warning' | 'danger' | 'info'
}

/** 树节点 */
export interface TreeNode<T = unknown> {
  id: string | number
  parentId?: string | number | null
  label?: string
  children?: TreeNode<T>[]
  data?: T
}

/** 通用 id 参数 */
export interface IdParam {
  id: string | number
}
