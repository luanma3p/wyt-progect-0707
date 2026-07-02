import { ref } from 'vue'

/** 局部 loading 计数，支持嵌套调用 */
export function useLoading(initial = false) {
  const loading = ref(initial)
  let count = initial ? 1 : 0

  function start() {
    count++
    loading.value = true
  }

  function end() {
    if (count > 0) count--
    if (count === 0) loading.value = false
  }

  /** 包装异步任务，自动管理 loading */
  async function wrap<T>(fn: () => Promise<T>): Promise<T> {
    start()
    try {
      return await fn()
    } finally {
      end()
    }
  }

  return { loading, start, end, wrap }
}
