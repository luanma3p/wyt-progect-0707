import type { App } from 'vue'
import BaseTable from './Base/BaseTable/index.vue'
import BaseForm from './Base/BaseForm/index.vue'
import BaseDialog from './Base/BaseDialog/index.vue'
import BaseSearch from './Base/BaseSearch/index.vue'
import BasePagination from './Base/BasePagination/index.vue'
import BaseButton from './Base/BaseButton/index.vue'
import BasePage from './Base/BasePage/index.vue'
import BaseEmpty from './Base/BaseEmpty/index.vue'
import BaseIcon from './Base/BaseIcon/index.vue'
import DictTag from './Business/DictTag/index.vue'
import StatusBadge from './Business/StatusBadge/index.vue'
import PageHeader from './Business/PageHeader/index.vue'
import TeacherSelector from './Business/TeacherSelector/index.vue'

/**
 * 注册全局基础/业务组件。
 * Base 层：通用容器/表格/表单/弹窗等无业务语义组件。
 * Business 层：含业务语义的复合组件（字典标签/状态徽章等）。
 */
export function setupGlobalComponents(app: App) {
  app.component('BaseTable', BaseTable)
  app.component('BaseForm', BaseForm)
  app.component('BaseDialog', BaseDialog)
  app.component('BaseSearch', BaseSearch)
  app.component('BasePagination', BasePagination)
  app.component('BaseButton', BaseButton)
  app.component('BasePage', BasePage)
  app.component('BaseEmpty', BaseEmpty)
  app.component('BaseIcon', BaseIcon)
  app.component('DictTag', DictTag)
  app.component('StatusBadge', StatusBadge)
  app.component('PageHeader', PageHeader)
  app.component('TeacherSelector', TeacherSelector)
}
