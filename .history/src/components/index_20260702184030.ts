import type { App } from 'vue'
import BaseTable from './base/BaseTable/index.vue'
import BaseForm from './base/BaseForm/index.vue'
import BaseDialog from './base/BaseDialog/index.vue'
import BaseSearch from './base/BaseSearch/index.vue'
import BasePagination from './base/BasePagination/index.vue'
import BaseButton from './base/BaseButton/index.vue'

/**
 * 注册全局基础/业务组件。
 * 阶段 C 将补充 BasePage/BaseEmpty/BaseIcon 与 Business 组件。
 */
export function setupGlobalComponents(app: App) {
  app.component('BaseTable', BaseTable)
  app.component('BaseForm', BaseForm)
  app.component('BaseDialog', BaseDialog)
  app.component('BaseSearch', BaseSearch)
  app.component('BasePagination', BasePagination)
  app.component('BaseButton', BaseButton)
}
