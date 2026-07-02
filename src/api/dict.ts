import { http } from '@/utils/request'
import type { DictItem } from './types/common'

export const dictApi = {
  /** 按字典编码获取字典项 */
  getByCode: (code: string) => http.get<DictItem[]>(`/dict/${code}`),
}
