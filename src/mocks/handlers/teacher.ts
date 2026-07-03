import { http, HttpResponse } from 'msw'
import { API_PREFIX, ok, fail, teachers } from '../db'
import { TeacherStatus, Gender } from '@/enums/business'
import type { TeacherForm } from '@/api/types/teacher'

export const teacherHandlers = [
  // 列表（分页 + 筛选）—— 精确路径优先于 :id
  http.get(`${API_PREFIX}/teacher/list`, ({ request }) => {
    const url = new URL(request.url)
    const pageNum = Number(url.searchParams.get('pageNum') || 1)
    const pageSize = Number(url.searchParams.get('pageSize') || 10)
    const keyword = url.searchParams.get('keyword') || ''
    const status = url.searchParams.get('status') || ''

    let list = [...teachers]
    if (keyword) {
      list = list.filter((t) => t.name.includes(keyword) || t.phone.includes(keyword))
    }
    if (status) {
      list = list.filter((t) => t.status === status)
    }
    const total = list.length
    const start = (pageNum - 1) * pageSize
    const pageList = list.slice(start, start + pageSize)
    return HttpResponse.json(ok({ list: pageList, total }))
  }),

  // 新增教师
  http.post(`${API_PREFIX}/teacher`, async ({ request }) => {
    const body = (await request.json()) as TeacherForm
    const newTeacher = {
      id: `t${Date.now()}`,
      name: body.name,
      phone: body.phone,
      gender: body.gender || Gender.MALE,
      subject: body.subject,
      status: TeacherStatus.APPROVED,
      rating: 0,
      studentCount: 0,
      courseCount: 0,
      deptName: '',
      createdAt: new Date().toLocaleString('zh-CN'),
      email: body.email || '',
      idCard: '',
      intro: body.intro || '',
      qualifications: [],
      followRecords: [],
    }
    teachers.push(newTeacher)
    return HttpResponse.json(ok(null, '教师已创建'))
  }),

  // 更新教师
  http.put(`${API_PREFIX}/teacher/:id`, async ({ request, params }) => {
    const body = (await request.json()) as TeacherForm
    const teacher = teachers.find((t) => t.id === params.id)
    if (!teacher) return HttpResponse.json(fail('教师不存在', 404))
    Object.assign(teacher, {
      name: body.name,
      phone: body.phone,
      gender: body.gender,
      subject: body.subject,
      email: body.email,
      intro: body.intro,
    })
    return HttpResponse.json(ok(null, '教师已更新'))
  }),

  // 删除教师
  http.delete(`${API_PREFIX}/teacher/:id`, ({ params }) => {
    const idx = teachers.findIndex((t) => t.id === params.id)
    if (idx > -1) teachers.splice(idx, 1)
    return HttpResponse.json(ok(null, '教师已删除'))
  }),

  // 详情
  http.get(`${API_PREFIX}/teacher/:id`, ({ params }) => {
    const teacher = teachers.find((t) => t.id === params.id)
    if (!teacher) return HttpResponse.json(fail('教师不存在', 404))
    return HttpResponse.json(ok(teacher))
  }),

  // 审核
  http.post(`${API_PREFIX}/teacher/audit`, async ({ request }) => {
    const body = (await request.json()) as {
      id: string
      action: 'approve' | 'reject'
      remark?: string
    }
    const teacher = teachers.find((t) => t.id === body.id)
    if (teacher) {
      teacher.status = body.action === 'approve' ? TeacherStatus.APPROVED : TeacherStatus.REJECTED
    }
    return HttpResponse.json(ok(null, body.action === 'approve' ? '审核通过' : '已驳回'))
  }),

  // 切换状态
  http.put(`${API_PREFIX}/teacher/:id/status`, async ({ request, params }) => {
    const body = (await request.json()) as { status: TeacherStatus }
    const teacher = teachers.find((t) => t.id === params.id)
    if (teacher) teacher.status = body.status
    return HttpResponse.json(ok(null, '状态已更新'))
  }),
]
