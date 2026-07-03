import { http } from '@/utils/request'
import type {
  AddFollowReq,
  StudentDetailResp,
  StudentFollowRecord,
  StudentForm,
  StudentListReq,
  StudentListResp,
} from './types/student'

export const studentApi = {
  /** 学员列表 */
  getList: (params: StudentListReq) => http.get<StudentListResp>('/student/list', params),

  /** 学员详情 */
  getDetail: (id: string) => http.get<StudentDetailResp>(`/student/${id}`),

  /** 新增学员 */
  create: (data: StudentForm) => http.post<void>('/student', data),

  /** 更新学员 */
  update: (id: string, data: StudentForm) => http.put<void>(`/student/${id}`, data),

  /** 删除学员 */
  remove: (id: string) => http.delete<void>(`/student/${id}`),

  /** 学员跟进记录 */
  getFollowRecords: (studentId: string) =>
    http.get<StudentFollowRecord[]>(`/student/${studentId}/follows`),

  /** 新增跟进 */
  addFollow: (data: AddFollowReq) => http.post<void>('/student/follow', data),
}
