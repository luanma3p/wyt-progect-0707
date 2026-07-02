import { courseApi } from '@/api/course'
import type {
  CourseForm,
  CourseListItem,
  CourseListReq,
  ScheduleItem,
} from '@/api/types/course'

/**
 * 课程 / 排课 Service：封装 API 调用，供 composable / view 使用。
 */
export const courseService = {
  /** 课程列表（分页 + 筛选） */
  fetchList: (params: CourseListReq) => courseApi.getList(params),

  /** 新增 / 更新（按 id 是否存在分流） */
  save: (data: CourseForm) =>
    data.id ? courseApi.update(data.id, data) : courseApi.create(data),

  /** 删除课程 */
  remove: (id: string) => courseApi.remove(id),

  /** 排课列表（按日期范围） */
  fetchSchedule: (params: { startDate: string; endDate: string }) =>
    courseApi.getSchedule(params),
}

export type { CourseListItem, CourseForm, CourseListReq, ScheduleItem }
