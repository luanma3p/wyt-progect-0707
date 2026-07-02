import type { PageQuery, PageResult } from './common'
import type { TeacherStatus } from '@/enums/business'

/** 教师列表查询 */
export interface TeacherListReq extends PageQuery {
  keyword?: string
  status?: TeacherStatus
  subject?: string
  startDate?: string
  endDate?: string
}

/** 教师列表项 */
export interface TeacherListItem {
  id: string
  name: string
  avatar?: string
  phone: string
  gender: string
  subject: string
  status: TeacherStatus
  rating: number
  studentCount: number
  courseCount: number
  deptName?: string
  createdAt: string
}

/** 教师详情 */
export interface TeacherDetailResp extends TeacherListItem {
  email: string
  idCard: string
  intro: string
  qualifications: TeacherQualification[]
  followRecords: TeacherFollowRecord[]
}

/** 资质 */
export interface TeacherQualification {
  id: string
  name: string
  type: string
  fileUrl: string
  status: string
  auditedAt?: string
  auditor?: string
  remark?: string
}

/** 跟进记录 */
export interface TeacherFollowRecord {
  id: string
  content: string
  operator: string
  createdAt: string
}

/** 审核请求 */
export interface AuditTeacherReq {
  id: string
  action: 'approve' | 'reject'
  remark?: string
}

/** 教师列表响应 */
export type TeacherListResp = PageResult<TeacherListItem>
