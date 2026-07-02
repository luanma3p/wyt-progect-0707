import { worker } from './browser'

/**
 * 启动 MSW Mock（仅开发环境且 VITE_USE_MOCK=true 时由 main.ts 调用）。
 * 未匹配的请求直接放行（bypass），交给 vite proxy 处理。
 */
export async function setupMock() {
  await worker.start({
    onUnhandledRequest: 'bypass',
  })
  // eslint-disable-next-line no-console
  console.log('[MSW] Mock 服务已启动')
}

export { worker }
