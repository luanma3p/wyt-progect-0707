import { http, HttpResponse } from 'msw'
import { API_PREFIX, ok, dicts } from '../db'

export const dictHandlers = [
  http.get(`${API_PREFIX}/dict/:code`, ({ params }) => {
    const code = params.code as string
    const items = dicts[code] || []
    return HttpResponse.json(ok(items))
  }),
]
