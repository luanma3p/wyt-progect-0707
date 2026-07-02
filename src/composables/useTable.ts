import { reactive, ref, type Ref } from 'vue'
import type { PageQuery, PageResult } from '@/api/types/common'

export interface UseTableOptions<Q> {
  /** 是否立即加载，默认 true */
  immediate?: boolean
  /** 默认查询参数 */
  defaultQuery?: Partial<Q>
  /** 默认每页条数 */
  defaultPageSize?: number
  /** 成功回调 */
  onSuccess?: (res: PageResult) => void
}

/**
 * 表格分页查询编排：组合 loading / list / total / 分页 / 查询 / 重置。
 * View 层只负责把返回值绑定到模板。
 */
export function useTable<T, Q extends PageQuery = PageQuery>(
  apiFn: (params: Q) => Promise<PageResult<T>>,
  options: UseTableOptions<Q> = {},
) {
  const loading = ref(false)
  const list = ref<T[]>([]) as Ref<T[]>
  const total = ref(0)
  const page = reactive({
    pageNum: 1,
    pageSize: options.defaultPageSize ?? 10,
  })
  const query = reactive<Partial<Q>>({ ...(options.defaultQuery ?? {}) })

  async function loadData() {
    loading.value = true
    try {
      const params = { ...query, ...page } as Q
      const res = await apiFn(params)
      list.value = res.list
      total.value = res.total
      options.onSuccess?.(res)
    } finally {
      loading.value = false
    }
  }

  function search() {
    page.pageNum = 1
    loadData()
  }

  function reset() {
    Object.keys(query).forEach((k) => {
      ;(query as Record<string, unknown>)[k] = undefined
    })
    if (options.defaultQuery) Object.assign(query, options.defaultQuery)
    search()
  }

  function onPageChange(p: number) {
    page.pageNum = p
    loadData()
  }

  function onSizeChange(s: number) {
    page.pageSize = s
    page.pageNum = 1
    loadData()
  }

  const reload = loadData

  if (options.immediate !== false) {
    loadData()
  }

  return {
    loading,
    list,
    total,
    page,
    query,
    search,
    reset,
    reload,
    onPageChange,
    onSizeChange,
  }
}
