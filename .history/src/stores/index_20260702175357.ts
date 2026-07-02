import type { App } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const store = createPinia()
store.use(piniaPluginPersistedstate)

/** 注册 Pinia */
export function setupStore(app: App) {
  app.use(store)
}

export { store }
export default store
