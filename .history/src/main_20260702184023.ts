import { createApp } from 'vue'
import 'element-plus/dist/index.css'
import 'nprogress/nprogress.css'
import 'virtual:svg-icons-register'

import App from './App.vue'
import router from './router'
import { setupStore } from './stores'
import { setupPlugins } from './plugins'

import '@/assets/styles/index.scss'

const app = createApp(App)

// Pinia 状态管理（含持久化插件）
setupStore(app)

// 路由（router/index.ts 内部已注册守卫）
app.use(router)

// 插件（Element Plus / 图标 / 指令 / 全局组件）
setupPlugins(app)

// 全局错误兜底
app.config.errorHandler = (err, _instance, info) => {
  console.error('[Global Error]', info, err)
}

// Mock（仅开发环境且显式开启时启动，零成本切换）
const enableMock = import.meta.env.VITE_USE_MOCK === 'true'
const bootstrap = enableMock
  ? import('@/mocks').then(({ setupMock }) => setupMock())
  : Promise.resolve()

bootstrap.finally(() => {
  app.mount('#app')
})
