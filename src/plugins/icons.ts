import type { App } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

/** 全局注册 Element Plus 图标组件 */
export function setupIcons(app: App) {
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
}
