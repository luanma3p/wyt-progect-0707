import { http } from '@/utils/request'
import type { AddFollowReq, StudentFollowRecord, StudentListReq, StudentListResp } from './types/student'

export const studentApi = {
  /** 学员列表 */
  getList: (params: StudentListReq) => http.get<StudentListResp>('/student/list', params),

  /** 学员跟进记录 */
  getFollowRecords: (studentId: string) =>
    http.get<StudentFollowRecord[]>(`/student/${studentId}/follows`),

  /** 新增跟进 */
  addFollow: (data: AddFollowReq) => http.post<void>('/student/follow', data),
}
