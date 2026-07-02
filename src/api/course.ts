import { http } from '@/utils/request'
import type { CourseForm, CourseListReq, CourseListResp, ScheduleItem } from './types/course'

export const courseApi = {
  /** 课程列表 */
  getList: (params: CourseListReq) => http.get<CourseListResp>('/course/list', params),

  /** 新增课程 */
  create: (data: CourseForm) => http.post<void>('/course', data),

  /** 更新课程 */
  update: (id: string, data: CourseForm) => http.put<void>(`/course/${id}`, data),

  /** 删除课程 */
  remove: (id: string) => http.delete<void>(`/course/${id}`),

  /** 排课列表（按日期范围） */
  getSchedule: (params: { startDate: string; endDate: string }) =>
    http.get<ScheduleItem[]>('/course/schedule', params),

  /** 新增排课 */
  addSchedule: (data: Partial<ScheduleItem>) => http.post<void>('/course/schedule', data),

  /** 删除排课 */
  removeSchedule: (id: string) => http.delete<void>(`/course/schedule/${id}`),
}
