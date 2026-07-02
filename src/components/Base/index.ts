/**
 * 基础组件层统一出口
 * 三层组件模型：UI库(El) → Base(此处) → Feature(views/components)
 */
import BaseTable from './BaseTable/index.vue'
import BaseForm from './BaseForm/index.vue'
import BaseDialog from './BaseDialog/index.vue'
import BaseSearch from './BaseSearch/index.vue'
import BasePagination from './BasePagination/index.vue'
import BaseButton from './BaseButton/index.vue'
import BasePage from './BasePage/index.vue'
import BaseEmpty from './BaseEmpty/index.vue'
import BaseIcon from './BaseIcon/index.vue'

export {
  BaseTable,
  BaseForm,
  BaseDialog,
  BaseSearch,
  BasePagination,
  BaseButton,
  BasePage,
  BaseEmpty,
  BaseIcon,
}
export type { TableColumn } from './BaseTable/types'
export type { FormField, FieldType, BaseFormProps } from './BaseForm/types'
