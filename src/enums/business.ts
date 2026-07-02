/** 教师状态 */
export enum TeacherStatus {
  /** 待审核 */
  PENDING = 'pending',
  /** 已通过 */
  APPROVED = 'approved',
  /** 已驳回 */
  REJECTED = 'rejected',
  /** 已停用 */
  DISABLED = 'disabled',
}

/** 审核状态 */
export enum AuditStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/** 课程状态 */
export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  OFFLINE = 'offline',
}

/** 性别 */
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  UNKNOWN = 'unknown',
}

/** 是否通用布尔 */
export enum YesNo {
  NO = 0,
  YES = 1,
}
