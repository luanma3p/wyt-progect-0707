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
        dts: 'src/auto-imports.d.ts',
        eslintrc: { enabled: true, filepath: '.eslintrc-auto-import.json' },
      }),
      // 仅用 ElementPlusResolver 生成 El* 组件的 GlobalComponents 类型声明（供 vue-tsc）；
      // 运行时 El* 由 app.use(ElementPlus) 全量注册，Base/Business 由 setupGlobalComponents 注册。
      Components({
        resolvers: [ElementPlusResolver()],
        dts: 'src/components.d.ts',
      }),
      // SVG 雪碧图（BaseIcon 使用 #icon-xxx）
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
        symbolId: 'icon-[dir]-[name]',
      }),
      // gzip 压缩
      viteCompression({ threshold: 10240 }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          // 全局注入设计 token，供 SFC <style lang="scss"> 直接使用 $color-*