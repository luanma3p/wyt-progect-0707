import type { PageQuery, PageResult } from './common'

/** 学员列表查询 */
export interface StudentListReq extends PageQuery {
  keyword?: string
  grade?: string
  teacherId?: string
}

/** 学员列表项 */
export interface StudentListItem {
  id: string
  name: string
  avatar?: string
  grade: string
  phone: string
  teacherName: string
  teacherId: string
  courseCount: number
  totalHours: number
  lastFollowAt?: string
  status: string
}

/** 学员跟进记录 */
export interface StudentFollowRecord {
  id: string
  studentId: string
  type: string
  content: string
  operator: string
  createdAt: string
}

/** 新增跟进 */
export interface AddFollowReq {
  studentId: string
  type: string
  content: string
}

/** 学员列表响应 */
export type StudentListResp = PageResult<StudentListItem>
