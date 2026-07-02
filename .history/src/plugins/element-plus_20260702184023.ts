import type { App } from 'vue'
import ElementPlus from 'element-plus'
import { ElMessage, ElMessageBox, ElNotification, ElLoading } from 'element-plus'

/**
 * Element Plus 全量注册（组件 + 指令如 v-loading + 服务式 API）。
 * 配合 unplugin-vue-components 的 ElementPlusResolver 生成 El* 组件类型声明。
 */
export function setupElementPlus(app: App) {
  // 全量注册组件与指令（保证 v-loading 等指令可用）
  app.use(ElementPlus)
  // 服务式 API 挂到全局属性，便于非 setup 上下文使用
  app.config.globalProperties.$message = ElMessage
  app.config.globalProperties.$confirm = ElMessageBox
  app.config.globalProperties.$notify = ElNotification
  app.config.globalProperties.$loading = ElLoading
}

export { ElMessage, ElMessageBox, ElNotification, ElLoading }
