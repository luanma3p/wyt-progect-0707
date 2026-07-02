import { teacherApi } from '@/api/teacher'
import type {
  AuditTeacherReq,
  TeacherDetailResp,
  TeacherListReq,
  TeacherListItem,
} from '@/api/types/teacher'

/**
 * 教师管理 Service：封装 API 调用，供 composable / view 使用。
 * 当前直透 API（无 DTO 转换），保留分层以便后续扩展字段映射 / 枚举转换。
 */
export const teacherService = {
  /** 教师列表（分页 + 筛选） */
  fetchList: (params: TeacherListReq) => teacherApi.getList(params),

  /** 教师详情 */
  fetchDetail: (id: string) => teacherApi.getDetail(id),

  /** 审核（通过 / 驳回） */
  audit: (data: AuditTeacherReq) => teacherApi.audit(data),

  /** 停用 / 启用 */
  toggleStatus: (id: string, status: string) => teacherApi.toggleStatus(id, status),
}

export type { TeacherListItem, TeacherDetailResp, TeacherListReq, AuditTeacherReq }
