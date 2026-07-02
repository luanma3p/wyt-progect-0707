import { http, HttpResponse } from 'msw'
import { API_PREFIX, ok, fail, students, studentFollows } from '../db'

export const studentHandlers = [
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

  http.get(`${API_PREFIX}/student/:studentId/follows`, ({ params }) => {
    const records = studentFollows.filter((f) => f.studentId === params.studentId)
    return HttpResponse.json(ok(records))
  }),

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
