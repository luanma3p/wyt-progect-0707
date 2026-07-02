import type { App } from 'vue'
import { setupElementPlus } from './element-plus'
import { setupIcons } from './icons'
import { setupDirectives } from '@/directives'
import { setupGlobalComponents } from '@/components'

/** 统一插件注册入口 */
export function setupPlugins(app: App) {
  setupElementPlus(app)
  setupIcons(app)
  setupDirectives(app)
  setupGlobalComponents(app)
}

export * from './element-plus'
export * from './icons'
