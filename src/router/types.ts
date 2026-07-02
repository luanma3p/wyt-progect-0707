import type { RouteRecordRaw, RouteRecordName } from 'vue-router'

/** 应用路由记录（meta 已通过 global.d.ts 增强） */
export type AppRouteRecord = RouteRecordRaw & {
  name?: RouteRecordName
  children?: AppRouteRecord[]
}
