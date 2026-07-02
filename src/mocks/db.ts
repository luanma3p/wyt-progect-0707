import type { UserInfoResp, MenuRoute } from '@/api/types'
import type { TeacherDetailResp } from '@/api/types/teacher'
import type { StudentListItem, StudentFollowRecord } from '@/api/types/student'
import type { CourseListItem, ScheduleItem } from '@/api/types/course'
import type { DashboardOverviewResp } from '@/api/types/dashboard'
import type { DictItem } from '@/api/types/common'
import { TeacherStatus, CourseStatus, Gender } from '@/enums/business'
import { DataScope } from '@/enums/permission'

/** API 前缀（与 axios baseURL 一致） */
export const API_PREFIX = import.meta.env.VITE_API_BASE_URL || '/dev-api'

/** 统一成功响应 */
export function ok<T>(data: T, message = 'success') {
  return { code: 200, data, message }
}

/** 统一失败响应 */
export function fail(message: string, code = 500) {
  return { code, data: null, message }
}

/** 用户账号与信息 */
export const users: Array<{
  username: string
  password: string
  token: string
  userInfo: UserInfoResp
}> = [
  {
    username: 'admin',
    password: '123456',
    token: 'admin-token-mock',
    userInfo: {
      id: 1,
      username: 'admin',
      nickname: '超级管理员',
      avatar: '',
      email: 'admin@banxue.com',
      phone: '13800000000',
      deptName: '管理部',
      roles: ['admin'],
      permissions: ['*:*:*'],
      dataScopes: [DataScope.ALL],
    },
  },
  {
    username: 'teacher',
    password: '123456',
    token: 'teacher-token-mock',
    userInfo: {
      id: 2,
      username: 'teacher',
      nickname: '张老师',
      avatar: '',
      email: 'teacher@banxue.com',
      phone: '13800000001',
      deptName: '教学部',
      roles: ['teacher'],
      permissions: [
        'teacher:list',
        'teacher:detail',
        'student:list',
        'course:list',
        'course:schedule',
        'dashboard:view',
      ],
      dataScopes: [DataScope.SELF],
    },
  },
]

/** 动态菜单树（dashboard 由 constantRoutes 提供，此处不含） */
export const menus: MenuRoute[] = [
  {
    id: 2,
    parentId: null,
    name: '教师管理',
    path: '/teacher',
    component: 'Layout',
    redirect: '/teacher/list',
    type: 'menu',
    icon: 'user',
    order: 2,
    children: [
      {
        id: 21,
        parentId: 2,
        name: '教师列表',
        path: 'list',
        component: 'teacher/list/index',
        type: 'menu',
        permissions: ['teacher:list'],
      },
      {
        id: 22,
        parentId: 2,
        name: '教师详情',
        path: 'detail/:id',
        component: 'teacher/detail/index',
        type: 'menu',
        hidden: true,
        permissions: ['teacher:detail'],
      },
    ],
  },
  {
    id: 3,
    parentId: null,
    name: '学员管理',
    path: '/student',
    component: 'Layout',
    redirect: '/student/list',
    type: 'menu',
    icon: 'people',
    order: 3,
    children: [
      {
        id: 31,
        parentId: 3,
        name: '学员列表',
        path: 'list',
        component: 'student/list/index',
        type: 'menu',
        permissions: ['student:list'],
      },
    ],
  },
  {
    id: 4,
    parentId: null,
    name: '课程管理',
    path: '/course',
    component: 'Layout',
    redirect: '/course/management',
    type: 'menu',
    icon: 'reading',
    order: 4,
    children: [
      {
        id: 41,
        parentId: 4,
        name: '课程列表',
        path: 'management',
        component: 'course/management/index',
        type: 'menu',
        permissions: ['course:list'],
      },
      {
        id: 42,
        parentId: 4,
        name: '排课管理',
        path: 'schedule',
        component: 'course/schedule/index',
        type: 'menu',
        permissions: ['course:schedule'],
      },
    ],
  },
]

/** 教师数据（含详情字段） */
export const teachers: TeacherDetailResp[] = [
  {
    id: 't001',
    name: '李明',
    phone: '13900000001',
    gender: Gender.MALE,
    subject: '数学',
    status: TeacherStatus.APPROVED,
    rating: 4.8,
    studentCount: 12,
    courseCount: 3,
    deptName: '数学组',
    createdAt: '2025-09-01 10:00:00',
    email: 'liming@banxue.com',
    idCard: '310***********1234',
    intro: '十年教龄，擅长初高中数学提分辅导。',
    qualifications: [
      {
        id: 'q1',
        name: '教师资格证',
        type: 'certificate',
        fileUrl: '',
        status: 'approved',
        auditedAt: '2025-09-02',
        auditor: 'admin',
      },
    ],
    followRecords: [
      { id: 'f1', content: '入职培训完成', operator: 'admin', createdAt: '2025-09-01 14:00:00' },
    ],
  },
  {
    id: 't002',
    name: '王芳',
    phone: '13900000002',
    gender: Gender.FEMALE,
    subject: '英语',
    status: TeacherStatus.PENDING,
    rating: 0,
    studentCount: 0,
    courseCount: 0,
    deptName: '英语组',
    createdAt: '2026-06-15 09:30:00',
    email: 'wangfang@banxue.com',
    idCard: '310***********5678',
    intro: '新入职英语教师，专八水平。',
    qualifications: [
      { id: 'q2', name: '教师资格证', type: 'certificate', fileUrl: '', status: 'pending' },
    ],
    followRecords: [],
  },
  {
    id: 't003',
    name: '赵强',
    phone: '13900000003',
    gender: Gender.MALE,
    subject: '物理',
    status: TeacherStatus.APPROVED,
    rating: 4.6,
    studentCount: 8,
    courseCount: 2,
    deptName: '理科组',
    createdAt: '2025-03-10 08:00:00',
    email: 'zhaoqiang@banxue.com',
    idCard: '310***********9012',
    intro: '物理竞赛金牌教练。',
    qualifications: [
      {
        id: 'q3',
        name: '教师资格证',
        type: 'certificate',
        fileUrl: '',
        status: 'approved',
        auditedAt: '2025-03-11',
        auditor: 'admin',
      },
    ],
    followRecords: [],
  },
  {
    id: 't004',
    name: '陈静',
    phone: '13900000004',
    gender: Gender.FEMALE,
    subject: '语文',
    status: TeacherStatus.REJECTED,
    rating: 0,
    studentCount: 0,
    courseCount: 0,
    deptName: '文科组',
    createdAt: '2026-06-20 11:00:00',
    email: 'chenjing@banxue.com',
    idCard: '310***********3456',
    intro: '资料不全，待补充。',
    qualifications: [
      {
        id: 'q4',
        name: '教师资格证',
        type: 'certificate',
        fileUrl: '',
        status: 'rejected',
        remark: '证书过期',
      },
    ],
    followRecords: [],
  },
  {
    id: 't005',
    name: '刘洋',
    phone: '13900000005',
    gender: Gender.MALE,
    subject: '化学',
    status: TeacherStatus.DISABLED,
    rating: 4.2,
    studentCount: 0,
    courseCount: 0,
    deptName: '理科组',
    createdAt: '2024-09-01 10:00:00',
    email: 'liuyang@banxue.com',
    idCard: '310***********7890',
    intro: '已停用。',
    qualifications: [],
    followRecords: [],
  },
]

/** 学员数据 */
export const students: StudentListItem[] = [
  {
    id: 's001',
    name: '张一',
    grade: '初三',
    phone: '13700000001',
    teacherName: '李明',
    teacherId: 't001',
    courseCount: 3,
    totalHours: 48,
    lastFollowAt: '2026-06-28 10:00:00',
    status: 'active',
  },
  {
    id: 's002',
    name: '张二',
    grade: '初二',
    phone: '13700000002',
    teacherName: '李明',
    teacherId: 't001',
    courseCount: 2,
    totalHours: 32,
    lastFollowAt: '2026-06-25 14:00:00',
    status: 'active',
  },
  {
    id: 's003',
    name: '张三',
    grade: '高一',
    phone: '13700000003',
    teacherName: '赵强',
    teacherId: 't003',
    courseCount: 2,
    totalHours: 40,
    lastFollowAt: '2026-06-20 09:00:00',
    status: 'active',
  },
  {
    id: 's004',
    name: '张四',
    grade: '高三',
    phone: '13700000004',
    teacherName: '赵强',
    teacherId: 't003',
    courseCount: 1,
    totalHours: 20,
    lastFollowAt: '2026-06-15 16:00:00',
    status: 'paused',
  },
  {
    id: 's005',
    name: '张五',
    grade: '初一',
    phone: '13700000005',
    teacherName: '李明',
    teacherId: 't001',
    courseCount: 1,
    totalHours: 16,
    lastFollowAt: '2026-06-30 11:00:00',
    status: 'active',
  },
  {
    id: 's006',
    name: '张六',
    grade: '高二',
    phone: '13700000006',
    teacherName: '赵强',
    teacherId: 't003',
    courseCount: 3,
    totalHours: 60,
    lastFollowAt: '2026-06-18 13:00:00',
    status: 'active',
  },
]

/** 学员跟进记录 */
export const studentFollows: StudentFollowRecord[] = [
  {
    id: 'sf1',
    studentId: 's001',
    type: 'phone',
    content: '近期学习状态良好，数学成绩提升明显',
    operator: '李明',
    createdAt: '2026-06-28 10:00:00',
  },
  {
    id: 'sf2',
    studentId: 's001',
    type: 'visit',
    content: '家长沟通，对教学满意',
    operator: '李明',
    createdAt: '2026-06-15 14:00:00',
  },
  {
    id: 'sf3',
    studentId: 's002',
    type: 'phone',
    content: '作业完成度需提高',
    operator: '李明',
    createdAt: '2026-06-25 14:00:00',
  },
]

/** 课程数据 */
export const courses: CourseListItem[] = [
  {
    id: 'c001',
    name: '初三数学冲刺班',
    subject: '数学',
    grade: '初三',
    teacherName: '李明',
    teacherId: 't001',
    totalHours: 48,
    price: 4800,
    status: CourseStatus.PUBLISHED,
    studentCount: 12,
  },
  {
    id: 'c002',
    name: '高一物理竞赛班',
    subject: '物理',
    grade: '高一',
    teacherName: '赵强',
    teacherId: 't003',
    totalHours: 60,
    price: 7200,
    status: CourseStatus.PUBLISHED,
    studentCount: 8,
  },
  {
    id: 'c003',
    name: '初二英语基础班',
    subject: '英语',
    grade: '初二',
    teacherName: '王芳',
    teacherId: 't002',
    totalHours: 40,
    price: 4000,
    status: CourseStatus.DRAFT,
    studentCount: 0,
  },
  {
    id: 'c004',
    name: '高三语文作文专项',
    subject: '语文',
    grade: '高三',
    teacherName: '陈静',
    teacherId: 't004',
    totalHours: 20,
    price: 2400,
    status: CourseStatus.OFFLINE,
    studentCount: 0,
  },
  {
    id: 'c005',
    name: '高二化学实验班',
    subject: '化学',
    grade: '高二',
    teacherName: '刘洋',
    teacherId: 't005',
    totalHours: 32,
    price: 3840,
    status: CourseStatus.PUBLISHED,
    studentCount: 6,
  },
]

/** 排课数据 */
export const schedules: ScheduleItem[] = [
  {
    id: 'sc001',
    courseId: 'c001',
    courseName: '初三数学冲刺班',
    teacherName: '李明',
    teacherId: 't001',
    studentName: '张一',
    studentId: 's001',
    date: '2026-07-02',
    startTime: '09:00',
    endTime: '11:00',
    classroom: 'A101',
    status: 'scheduled',
  },
  {
    id: 'sc002',
    courseId: 'c002',
    courseName: '高一物理竞赛班',
    teacherName: '赵强',
    teacherId: 't003',
    studentName: '张三',
    studentId: 's003',
    date: '2026-07-02',
    startTime: '14:00',
    endTime: '16:00',
    classroom: 'B201',
    status: 'scheduled',
  },
  {
    id: 'sc003',
    courseId: 'c001',
    courseName: '初三数学冲刺班',
    teacherName: '李明',
    teacherId: 't001',
    studentName: '张二',
    studentId: 's002',
    date: '2026-07-03',
    startTime: '09:00',
    endTime: '11:00',
    classroom: 'A101',
    status: 'scheduled',
  },
  {
    id: 'sc004',
    courseId: 'c005',
    courseName: '高二化学实验班',
    teacherName: '刘洋',
    teacherId: 't005',
    studentName: '张六',
    studentId: 's006',
    date: '2026-07-03',
    startTime: '14:00',
    endTime: '16:00',
    classroom: 'C301',
    status: 'scheduled',
  },
]

/** 字典数据 */
export const dicts: Record<string, DictItem[]> = {
  teacher_status: [
    { label: '待审核', value: TeacherStatus.PENDING, tagType: 'warning' },
    { label: '已通过', value: TeacherStatus.APPROVED, tagType: 'success' },
    { label: '已驳回', value: TeacherStatus.REJECTED, tagType: 'danger' },
    { label: '已停用', value: TeacherStatus.DISABLED, tagType: 'info' },
  ],
  course_status: [
    { label: '草稿', value: CourseStatus.DRAFT, tagType: 'info' },
    { label: '已发布', value: CourseStatus.PUBLISHED, tagType: 'success' },
    { label: '已下架', value: CourseStatus.OFFLINE, tagType: 'warning' },
  ],
  gender: [
    { label: '男', value: Gender.MALE, tagType: '' },
    { label: '女', value: Gender.FEMALE, tagType: '' },
    { label: '未知', value: Gender.UNKNOWN, tagType: 'info' },
  ],
}

/** 看板概览数据 */
export const dashboardOverview: DashboardOverviewResp = {
  stat: {
    totalTeachers: teachers.length,
    totalStudents: students.length,
    totalCourses: courses.length,
    pendingAudits: teachers.filter((t) => t.status === TeacherStatus.PENDING).length,
  },
  teacherTrend: [
    { date: '2026-01', newTeachers: 2, activeTeachers: 3 },
    { date: '2026-02', newTeachers: 1, activeTeachers: 4 },
    { date: '2026-03', newTeachers: 0, activeTeachers: 4 },
    { date: '2026-04', newTeachers: 1, activeTeachers: 5 },
    { date: '2026-05', newTeachers: 0, activeTeachers: 5 },
    { date: '2026-06', newTeachers: 2, activeTeachers: 4 },
  ],
  courseDist: [
    { subject: '数学', count: 1 },
    { subject: '物理', count: 1 },
    { subject: '英语', count: 1 },
    { subject: '语文', count: 1 },
    { subject: '化学', count: 1 },
  ],
  recentAudits: [
    {
      id: 'a1',
      teacherName: '王芳',
      status: 'pending',
      operator: '—',
      auditedAt: '2026-06-15 09:30:00',
    },
    {
      id: 'a2',
      teacherName: '陈静',
      status: 'rejected',
      operator: 'admin',
      auditedAt: '2026-06-21 10:00:00',
    },
    {
      id: 'a3',
      teacherName: '李明',
      status: 'approved',
      operator: 'admin',
      auditedAt: '2025-09-02 11:00:00',
    },
  ],
}
