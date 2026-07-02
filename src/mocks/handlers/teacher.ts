import { http, HttpResponse } from 'msw'
import { API_PREFIX, ok, fail, teachers } from '../db'
import { TeacherStatus } from '@/enums/business'

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

  // 详情
  http.get(`${API_PREFIX}/teacher/:id`, ({ params }) => {
    const teacher = teachers.find((t) => t.id === params.id)
    if (!teacher) return HttpResponse.json(fail('教师不存在', 404))
    return HttpResponse.json(ok(teacher))
  }),

  // 审核
  http.post(`${API_PREFIX}/teacher/audit`, async ({ request }) => {
    const body = (await request.json()) as { id: string; action: 'approve' | 'reject'; remark?: string }
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
