import { http, HttpResponse } from 'msw'
import { API_PREFIX, ok, users, menus } from '../db'

export const userHandlers = [
  http.get(`${API_PREFIX}/user/info`, ({ request }) => {
    const auth = request.headers.get('Authorization') || ''
    const token = auth.replace('Bearer ', '')
    const user = users.find((u) => u.token === token)
    if (!user) {
      return HttpResponse.json({ code: 401001, data: null, message: '未登录或登录已过期' })
    }
    return HttpResponse.json(ok(user.userInfo))
  }),

  http.get(`${API_PREFIX}/user/menus`, () => {
    return HttpResponse.json(ok(menus))
  }),
]
