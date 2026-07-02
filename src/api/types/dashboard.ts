/** 概览统计卡片 */
export interface DashboardStat {
  totalTeachers: number
  totalStudents: number
  totalCourses: number
  pendingAudits: number
}

/** 教师增长趋势 */
export interface TeacherTrendItem {
  date: string
  newTeachers: number
  activeTeachers: number
}

/** 课程分布 */
export interface CourseDistItem {
  subject: string
  count: number
}

/** 最近审核 */
export interface RecentAuditItem {
  id: string
  teacherName: string
  status: string
  operator: string
  auditedAt: string
}

/** 看板聚合响应 */
export interface DashboardOverviewResp {
  stat: DashboardStat
  teacherTrend: TeacherTrendItem[]
  courseDist: CourseDistItem[]
  recentAudits: RecentAuditItem[]
}
