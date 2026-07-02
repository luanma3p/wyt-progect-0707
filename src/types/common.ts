// 公共业务类型（与 api/types/common.ts 区分：这里放纯前端业务模型）
export type Nullable<T> = T | null
export type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> }
export type Awaitable<T> = T | Promise<T>

/** tagsView 标签 */
export interface ViewTag {
  name: string
  path: string
  title: string
  affix?: boolean
  cache?: boolean
  noCache?: boolean
  meta?: Record<string, unknown>
  query?: Record<string, unknown>
  params?: Record<string, unknown>
}
