import { studentApi } from '@/api/student'
import type {
  AddFollowReq,
  StudentDetailResp,
  StudentFollowRecord,
  StudentForm,
  StudentListItem,
  StudentListReq,
} from '@/api/types/student'

/**
 * 学员管理 Service：封装 API 调用，供 composable / view 使用。
 */
export const studentService = {
  /** 学员列表（分页 + 筛选） */
  fetchList: (params: StudentListReq) => studentApi.getList(params),

  /** 学员详情 */
  fetchDetail: (id: string) => studentApi.getDetail(id),

  /** 新增 / 更新（按 id 是否存在分流） */
  save: (data: StudentForm) =>
    data.id ? studentApi.update(data.id, data) : studentApi.create(data),

  /** 删除学员 */
  remove: (id: string) => studentApi.remove(id),

  /** 学员跟进记录 */
  fetchFollows: (studentId: string) => studentApi.getFollowRecords(studentId),

  /** 新增跟进 */
  addFollow: (data: AddFollowReq) => studentApi.addFollow(data),
}

export type {
  StudentListItem,
  StudentFollowRecord,
  StudentListReq,
  AddFollowReq,
  StudentForm,
  StudentDetailResp,
}
