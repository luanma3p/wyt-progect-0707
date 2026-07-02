import type { PageQuery, PageResult } from './common'
import type { CourseStatus } from '@/enums/business'

/** 课程列表查询 */
export interface CourseListReq extends PageQuery {
  keyword?: string
  subject?: string
  status?: CourseStatus
}

/** 课程列表项 */
export interface CourseListItem {
  id: string
  name: string
  subject: string
  grade: string
  teacherName: string
  teacherId: string
  totalHours: number
  price: number
  status: CourseStatus
  studentCount: number
}

/** 课程表单 */
export interface CourseForm {
  id?: string
  name: string
  subject: string
  grade: string
  teacherId: string
  totalHours: number
  price: number
  intro?: string
  coverUrl?: string
}

/** 排课项 */
export interface ScheduleItem {
  id: string
  courseId: string
  courseName: string
  teacherName: string
  teacherId: string
  studentName: string
  studentId: string
  date: string
  startTime: string
  endTime: string
  classroom: string
  status: string
}

export type CourseListResp = PageResult<CourseListItem>
