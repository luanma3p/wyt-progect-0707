import { http } from '@/utils/request'
import type { DashboardOverviewResp } from './types/dashboard'

export const dashboardApi = {
  /** 看板聚合数据 */
  getOverview: () => http.get<DashboardOverviewResp>('/dashboard/overview'),
}
