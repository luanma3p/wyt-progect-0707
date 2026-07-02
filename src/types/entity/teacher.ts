import type { TeacherListItem } from '@/api/types/teacher'

/**
 * 教师领域实体（当前与 DTO 一致，后续若字段映射差异较大可在此转换）。
 * 业务层优先使用 Entity，与线上 DTO 解耦。
 */
export type Teacher = TeacherListItem
