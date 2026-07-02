/** 将后端 component 字符串解析为懒加载组件函数 */
const modules = import.meta.glob('@/views/**/*.vue')

const LAYOUT = () => import('@/layouts/default/index.vue')

/**
 * 根据 component 字符串解析组件
 * - 'Layout' → 默认布局
 * - 'teacher/list/index' → @/views/teacher/list/index.vue
 */
export function resolveComponent(component?: string): (() => Promise<unknown>) | undefined {
  if (!component) return undefined
  if (component === 'Layout' || component === 'layout') return LAYOUT
  const target = `/src/views/${component}.vue`
  const matched = modules[target]
  if (matched) return matched as () => Promise<unknown>
  // 兜底：找不到组件用 404
  console.warn(`[router] 未找到组件: ${component}（已回退到 404）`)
  return () => import('@/views/error/404.vue')
}

export { LAYOUT }
