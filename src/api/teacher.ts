import { http } from '@/utils/request'
import type {
  AuditTeacherReq,
  TeacherDetailResp,
  TeacherForm,
  TeacherListReq,
  TeacherListResp,
} from './types/teacher'

export const teacherApi = {
  /** 教师列表 */
  getList: (params: TeacherListReq) => http.get<TeacherListResp>('/teacher/list', params),

  /** 教师详情 */
  getDetail: (id: string) => http.get<TeacherDetailResp>(`/teacher/${id}`),

  /** 新增教师 */
  create: (data: TeacherForm) => http.post<void>('/teacher', data),

  /** 更新教师 */
  update: (id: string, data: TeacherForm) => http.put<void>(`/teacher/${id}`, data),

  /** 删除教师 */
  remove: (id: string) => http.delete<void>(`/teacher/${id}`),

  /** 审核（通过/驳回） */
  audit: (data: AuditTeacherReq) => http.post<void>('/teacher/audit', data),

  /** 停用/启用 */
  toggleStatus: (id: string, status: string) => http.put<void>(`/teacher/${id}/status`, { status }),
}
