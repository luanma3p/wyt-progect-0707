import { http } from '@/utils/request'
import type { AuditTeacherReq, TeacherDetailResp, TeacherListReq, TeacherListResp } from './types/teacher'

export const teacherApi = {
  /** 教师列表 */
  getList: (params: TeacherListReq) => http.get<TeacherListResp>('/teacher/list', params),

  /** 教师详情 */
  getDetail: (id: string) => http.get<TeacherDetailResp>(`/teacher/${id}`),

  /** 审核（通过/驳回） */
  audit: (data: AuditTeacherReq) => http.post<void>('/teacher/audit', data),

  /** 停用/启用 */
  toggleStatus: (id: string, status: string) =>
    http.put<void>(`/teacher/${id}/status`, { status }),
}
