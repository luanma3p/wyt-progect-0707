import { reactive } from 'vue'
import { dictApi } from '@/api/dict'
import type { DictItem } from '@/api/types/common'

// 模块级缓存，避免重复请求
const dictCache = new Map<string, DictItem[]>()

/**
 * 字典批量加载（带缓存）。
 * 用法：const { dictMap, getLabel } = useDict('teacher_status', 'audit_status')
 */
export function useDict(...codes: string[]) {
  const dictMap = reactive<Record<string, DictItem[]>>({})

  async function load() {
    await Promise.all(
      codes.map(async (code) => {
        if (dictCache.has(code)) {
          dictMap[code] = dictCache.get(code)!
          return
        }
        try {
          const items = await dictApi.getByCode(code)
          dictCache.set(code, items)
          dictMap[code] = items
        } catch {
          dictMap[code] = []
        }
      }),
    )
  }

  function getLabel(code: string, value: string | number | undefined | null): string {
    if (value == null) return ''
    const item = dictMap[code]?.find((i) => i.value === value)
    return item?.label ?? String(value)
  }

  function getTagType(
    code: string,
    value: string | number | undefined | null,
  ): 'success' | 'warning' | 'danger' | 'info' | undefined {
    if (value == null) return undefined
    const tagType = dictMap[code]?.find((i) => i.value === value)?.tagType
    if (!tagType) return undefined
    return tagType as 'success' | 'warning' | 'danger' | 'info'
  }

  load()

  return { dictMap, getLabel, getTagType, reload: load }
}
