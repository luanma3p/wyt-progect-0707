import { http, HttpResponse } from 'msw'
import { API_PREFIX, ok, dashboardOverview } from '../db'

export const dashboardHandlers = [
  http.get(`${API_PREFIX}/dashboard/overview`, () => {
    return HttpResponse.json(ok(dashboardOverview))
  }),
]
