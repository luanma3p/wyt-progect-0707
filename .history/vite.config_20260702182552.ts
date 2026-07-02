import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import viteCompression from 'vite-plugin-compression'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.VITE_PORT) || 5173
  const apiPrefix = env.VITE_API_BASE_URL || '/dev-api'

  return {
    plugins: [
      vue(),
      // 自动导入 vue/vue-router/pinia/@vueuse 的常用 API（computed/ref/defineStore...）
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
        dts: 'src/auto-import