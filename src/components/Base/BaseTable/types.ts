import type { VNode } from 'vue'

/** 表格列配置 */
export interface TableColumn<T = Record<string, unknown>> {
  /** 字段名 */
  prop: keyof T & string
  /** 列标题 */
  label: string
  /** 列宽 */
  width?: number | string
  /** 最小列宽 */
  minWidth?: number | string
  /** 固定列 */
  fixed?: 'left' | 'right' | boolean
  /** 对齐 */
  align?: 'left' | 'center' | 'right'
  /** 表头对齐 */
  headerAlign?: 'left' | 'center' | 'right'
  /** 是否可排序 */
  sortable?: boolean | 'custom'
  /** 是否显示溢出提示 */
  showOverflowTooltip?: boolean
  /** 自定义格式化 */
  formatter?: (row: T, column: TableColumn<T>, value: unknown, index: number) => string
  /** 字典编码（自动用 DictTag 渲染） */
  dict?: string
  /** 自定义渲染插槽名 */
  slot?: string
  /** 列类型 */
  type?: 'index' | 'selection' | 'expand'
  /** 操作列配置 */
  actions?: TableAction<T>[]
  /** 是否显示该列（动态控制） */
  show?: (row: T) => boolean
}

/** 操作列按钮 */
export interface TableAction<T = Record<string, unknown>> {
  label: string
  /** 权限码（配合 v-permission） */
  perm?: string | string[]
  /** 是否危险操作 */
  danger?: boolean
  /** 是否禁用 */
  disabled?: (row: T) => boolean
  /** 是否显示 */
  show?: (row: T) => boolean
  /** 点击回调 */
  onClick: (row: T) => void
  /** 确认提示（有则弹确认框） */
  confirm?: string
}

/** 表格 props */
export interface BaseTableProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  /** 是否显示斑马纹 */
  stripe?: boolean
  /** 是否显示边框 */
  border?: boolean
  /** 行 key */
  rowKey?: string | ((row: T) => string)
  /** 是否可选择 */
  selectable?: boolean
  /** 已选行（双向） */
  selection?: T[]
  /** 空数据文案 */
  emptyText?: string
}

export type { VNode }
