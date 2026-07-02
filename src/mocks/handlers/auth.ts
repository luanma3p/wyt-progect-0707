import { http, HttpResponse } from 'msw'
import { API_PREFIX, ok, fail, users } from '../db'

export const authHandlers = [
  http.post(`${API_PREFIX}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { username: string; password: string }
    const user = users.find(
      (u) => u.username === body.username && u.password === body.password,
    )
    if (!user) {
      return HttpResponse.json(fail('用户名或密码错误', 400001))
    }
    return HttpResponse.json(
      ok({ token: user.token, refreshToken: user.token, expiresIn: 7200 }),
    )
  }),

  http.post(`${API_PREFIX}/auth/logout`, () => {
    return HttpResponse.json(ok(null, '已退出'))
  }),

  http.post(`${API_PREFIX}/auth/refresh`, () => {
    return HttpResponse.json(
      ok({ token: 'refreshed-token', refreshToken: 'refreshed-token', expiresIn: 7200 }),
    )
  }),
]
