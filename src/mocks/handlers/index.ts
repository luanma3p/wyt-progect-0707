import { authHandlers } from './auth'
import { userHandlers } from './user'
import { teacherHandlers } from './teacher'
import { studentHandlers } from './student'
import { courseHandlers } from './course'
import { dashboardHandlers } from './dashboard'
import { dictHandlers } from './dict'

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...teacherHandlers,
  ...studentHandlers,
  ...courseHandlers,
  ...dashboardHandlers,
  ...dictHandlers,
]
