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

/** 学员新增/编辑表单 */
export interface StudentForm {
  id?: string
  name: string
  phone: string
  grade: string
  teacherId: string
  gender?: string
  parentName?: string
  parentPhone?: string
  address?: string
  remark?: string
}

/** 学员详情 */
export interface StudentDetailResp extends StudentListItem {
  gender?: string
  parentName?: string
  parentPhone?: string
  address?: string
  remark?: string
  followRecords: StudentFollowRecord[]
}

/** 学员列表响应 */
export type StudentListResp = PageResult<StudentListItem>
