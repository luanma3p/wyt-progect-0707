import { http, HttpResponse } from 'msw'
import { API_PREFIX, ok, fail, students, studentFollows } from '../db'
import type { StudentForm } from '@/api/types/student'

export const studentHandlers = [
  // 列表
  http.get(`${API_PREFIX}/student/list`, ({ request }) => {
    const url = new URL(request.url)
    const pageNum = Number(url.searchParams.get('pageNum') || 1)
    const pageSize = Number(url.searchParams.get('pageSize') || 10)
    const keyword = url.searchParams.get('keyword') || ''
    const grade = url.searchParams.get('grade') || ''

    let list = [...students]
    if (keyword) {
      list = list.filter((s) => s.name.includes(keyword) || s.phone.includes(keyword))
    }
    if (grade) list = list.filter((s) => s.grade === grade)
    const total = list.length
    const start = (pageNum - 1) * pageSize
    const pageList = list.slice(start, start + pageSize)
    return HttpResponse.json(ok({ list: pageList, total }))
  }),

  // 新增学员
  http.post(`${API_PREFIX}/student`, async ({ request }) => {
    const body = (await request.json()) as StudentForm
    const newStudent = {
      id: `s${Date.now()}`,
      name: body.name,
      phone: body.phone,
      grade: body.grade,
      teacherName: '',
      teacherId: body.teacherId,
      courseCount: 0,
      totalHours: 0,
      lastFollowAt: undefined,
      status: 'active',
      gender: body.gender,
      parentName: body.parentName,
      parentPhone: body.parentPhone,
      address: body.address,
      remark: body.remark,
    }
    students.push(newStudent as any)
    return HttpResponse.json(ok(null, '学员已创建'))
  }),

  // 更新学员
  http.put(`${API_PREFIX}/student/:id`, async ({ request, params }) => {
    const body = (await request.json()) as StudentForm
    const student = students.find((s) => s.id === params.id)
    if (!student) return HttpResponse.json(fail('学员不存在', 404))
    Object.assign(student, {
      name: body.name,
      phone: body.phone,
      grade: body.grade,
      teacherId: body.teacherId,
      gender: body.gender,
      parentName: body.parentName,
      parentPhone: body.parentPhone,
      address: body.address,
      remark: body.remark,
    })
    return HttpResponse.json(ok(null, '学员已更新'))
  }),

  // 删除学员
  http.delete(`${API_PREFIX}/student/:id`, ({ params }) => {
    const idx = students.findIndex((s) => s.id === params.id)
    if (idx > -1) students.splice(idx, 1)
    return HttpResponse.json(ok(null, '学员已删除'))
  }),

  // 学员详情
  http.get(`${API_PREFIX}/student/:id`, ({ params }) => {
    const student = students.find((s) => s.id === params.id)
    if (!student) return HttpResponse.json(fail('学员不存在', 404))
    const records = studentFollows.filter((f) => f.studentId === params.id)
    return HttpResponse.json(ok({ ...student, followRecords: records }))
  }),

  // 跟进记录
  http.get(`${API_PREFIX}/student/:studentId/follows`, ({ params }) => {
    const records = studentFollows.filter((f) => f.studentId === params.studentId)
    return HttpResponse.json(ok(records))
  }),

  // 新增跟进
  http.post(`${API_PREFIX}/student/follow`, async ({ request }) => {
    const body = (await request.json()) as { studentId: string; type: string; content: string }
    studentFollows.push({
      id: `sf${Date.now()}`,
      studentId: body.studentId,
      type: body.type,
      content: body.content,
      operator: 'admin',
      createdAt: new Date().toLocaleString('zh-CN'),
    })
    return HttpResponse.json(ok(null, '跟进已添加'))
  }),
]
