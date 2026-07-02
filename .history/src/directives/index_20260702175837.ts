import type { App } from 'vue'
import { permission } from './permission'
import { debounce } from './debounce'
import { copy } from './copy'

/** 批量注册自定义指令 */
export function setupDirectives(app: App) {
  app.directive('permission', permission)
  app.directive('debounce', debounce)
  app.directive('copy', copy)
}

export * from './permission'
export * from './debounce'
export * from './copy'
