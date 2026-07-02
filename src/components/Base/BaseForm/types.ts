import type { FormItemRule } from 'element-plus'
import type { Option } from '@/api/types/common'

/** 表单字段类型 */
export type FieldType =
  | 'input'
  | 'textarea'
  | 'number'
  | 'select'
  | 'date'
  | 'daterange'
  | 'switch'
  | 'radio'
  | 'checkbox'
  | 'cascader'
  | 'slot'

/** 表单字段 schema */
export interface FormField {
  /** 字段名 */
  prop: string
  /** 标签 */
  label: string
  /** 字段类型 */
  type: FieldType
  /** 占位符 */
  placeholder?: string
  /** 默认值 */
  defaultValue?: unknown
  /** 选项（select / radio / checkbox） */
  options?: Option[]
  /** 是否必填 */
  required?: boolean
  /** 校验规则 */
  rules?: FormItemRule[]
  /** 栅格跨度（24 栅格） */
  span?: number
  /** 是否禁用 */
  disabled?: boolean | ((form: Record<string, unknown>) => boolean)
  /** 是否显示（联动） */
  visibleIf?: (form: Record<string, unknown>) => boolean
  /** 是否清空 */
  clearable?: boolean
  /** 透传给原生组件的属性 */
  attrs?: Record<string, unknown>
}

/** BaseForm props */
export interface BaseFormProps {
  fields: FormField[]
  modelValue: Record<string, unknown>
  labelWidth?: string
  labelPosition?: 'left' | 'right' | 'top'
  inline?: boolean
  disabled?: boolean
}
