import { http, HttpResponse } from 'msw'
import { API_PREFIX, ok, courses, schedules } from '../db'
import type { CourseForm } from '@/api/types/course'
import { CourseStatus } from '@/enums/business'

export const courseHandlers = [
  http.get(`${API_PREFIX}/course/list`, ({ request }) => {
    const url = new URL(request.url)
    const pageNum = Number(url.searchParams.get('pageNum') || 1)
    const pageSize = Number(url.searchParams.get('pageSize') || 10)
    const keyword = url.searchParams.get('keyword') || ''
    const subject = url.searchParams.get('subject') || ''

    let list = [...courses]
    if (keyword) list = list.filter((c) => c.name.includes(keyword))
    if (subject) list = list.filter((c) => c.subject === subject)
    const total = list.length
    const start = (pageNum - 1) * pageSize
    const pageList = list.slice(start, start + pageSize)
    return HttpResponse.json(ok({ list: pageList, total }))
  }),

  http.post(`${API_PREFIX}/course`, async ({ request }) => {
    const body = (await request.json()) as CourseForm
    courses.push({
      id: `c${Date.now()}`,
      name: body.name,
      subject: body.subject,
      grade: body.grade,
      teacherName: '',
      teacherId: body.teacherId,
      totalHours: body.totalHours,
      price: body.price,
      status: CourseStatus.DRAFT,
      studentCount: 0,
    })
    return HttpResponse.json(ok(null, '课程已创建'))
  }),

  http.put(`${API_PREFIX}/course/:id`, async ({ request, params }) => {
    const body = (await request.json()) as CourseForm
    const course = courses.find((c) => c.id === params.id)
    if (course) Object.assign(course, body)
    return HttpResponse.json(ok(null, '课程已更新'))
  }),

  http.delete(`${API_PREFIX}/course/:id`, ({ params }) => {
    const idx = courses.findIndex((c) => c.id === params.id)
    if (idx > -1) courses.splice(idx, 1)
    return HttpResponse.json(ok(null, '课程已删除'))
  }),

  http.get(`${API_PREFIX}/course/schedule`, ({ request }) => {
    const url = new URL(request.url)
    const startDate = url.searchParams.get('startDate') || ''
    const endDate = url.searchParams.get('endDate') || ''
    let list = [...schedules]
    if (startDate) list = list.filter((s) => s.date >= startDate)
    if (endDate) list = list.filter((s) => s.date <= endDate)
    return HttpResponse.json(ok(list))
  }),
]
