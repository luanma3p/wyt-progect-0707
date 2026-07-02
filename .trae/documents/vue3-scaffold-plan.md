# 伴学老师后台管理系统 — Vue 3 框架搭建方案

## Context（背景）

当前项目目录 `d:\codeDocument\wyt-progect-0707` 为空（仅有空 `README.md`），需要从零搭建「伴学老师后台管理系统」的 Vue 3 项目框架。目标是建立一个**可长期维护**的工程骨架：分层清晰、类型安全、约定优于配置、可演进、可测试。

本方案遵守项目记忆中的硬约束（Vue 3.4+ `<script setup>` / TS strict / Axios 二次封装于 `utils/request.ts` / 动态路由权限 / feature 模块组织 / Pinia 模块化 / 三层 UI 模型 / ESLint+Prettier+TS 检查），并采纳用户确认的三项选择：

- **业务示例模块**：教师管理、学员管理、课程/排课、数据看板
- **Mock 方案**：MSW（Mock Service Worker），环境变量开关
- **权限模型**：JWT + RBAC 动态路由（路由级 + 按钮级 `v-permission` + 数据级）

## 总体设计原则

- 分层单向依赖：View → Composable → Service(可选) → Store/API，禁止反向调用
- 类型安全驱动：strict + 类型化 API/Store/路由 meta
- Service 设为薄层可选：简单 CRUD 由 composable 直连 api，复杂聚合才落 service
- 业务数据默认不进 Store：Store 只承载跨页面共享态（鉴权/布局/标签/字典缓存）
- 关键决策写入 `docs/decision-log.md`

## 完整目录结构

```
wyt-progect-0707/
├── .env / .env.development / .env.production   # 多环境变量
├── .editorconfig / .prettierrc / .prettierignore
├── commitlint.config.js / eslint.config.js     # 工程化（flat config）
├── package.json / pnpm-lock.yaml
├── tsconfig.json / tsconfig.node.json
├── vite.config.ts                              # 别名/代理/自动导入/压缩/svg
├── index.html
├── docs/                                       # 架构/约定/权限/决策记录
│   ├── architecture.md  conventions.md  permission.md  decision-log.md
├── public/  (favicon + mockServiceWorker.js)
├── mocks/                                       # MSW（与 src 解耦）
│   ├── browser.ts  index.ts  db.ts
│   └── handlers/  (auth/user/teacher/student/course/dashboard/dict + index.ts)
└── src/
    ├── main.ts  App.vue  env.d.ts  auto-imports.d.ts  components.d.ts
    ├── api/                  # 纯 HTTP 调用
    │   ├── types/            # 类型化 DTO（common/auth/user/teacher/student/course/dashboard）
    │   └── auth.ts user.ts teacher.ts student.ts course.ts dashboard.ts dict.ts
    ├── assets/  (images/ icons/ styles/{index,variables,mixins,reset,element-overrides}.scss)
    ├── components/
    │   ├── Base/             # BaseTable BaseForm BaseDialog BaseSearch BasePagination BaseButton BasePage BaseEmpty BaseIcon
    │   ├── Business/         # DictTag StatusBadge TeacherSelector PageHeader
    │   └── index.ts
    ├── composables/          # useTable useForm useDialog useDict usePermission useLoading useDownload useECharts useTheme
    ├── directives/           # permission debounce copy
    ├── enums/                # http permission business
    ├── layouts/  default/ (sidebar/header/tagsView/breadcrumb/logo)  blank/
    ├── plugins/  index.ts element-plus.ts icons.ts
    ├── router/  index.ts routes.ts guards.ts dynamic.ts component-map.ts permission.ts
    ├── service/  teacher.service.ts student.service.ts course.service.ts
    ├── stores/  index.ts  modules/{user,permission,app,tagsView}.ts
    ├── types/  global.d.ts common.ts  entity/{teacher,student,course,user}.ts
    ├── utils/  request.ts auth.ts storage.ts validate.ts format.ts download.ts tree.ts permission.ts index.ts
    ├── config/  settings.ts index.ts
    ├── constants/  keys.ts
    └── views/
        ├── login/  dashboard/  profile/  error/{404,403}
        ├── teacher/  (list detail audit qualification)
        ├── student/  (list follow-up)
        └── course/   (management schedule)
```

## 分层架构与调用规则

| 层 | 职责 | 禁止 |
|---|---|---|
| View | 模板渲染、事件绑定、调用 composable | 直接 import api、写业务分支 |
| Composable | 流程编排、组合 store/service、局部状态 | 操作 DOM、写持久化 |
| Service(可选) | DTO↔Entity 转换、聚合、规则校验 | 持响应式状态、调 UI 库 |
| Store | 跨页面共享态（鉴权/布局/标签） | 嵌入表单逻辑 |
| API | HTTP 请求、返回类型化 DTO | 业务判断、ElMessage |

典型链路：登录 `login → useAuth → userStore.login → api/auth.login`；教师列表 `view → useTable(teacherApi.getList) → api/teacher`；权限路由 `guards → permissionStore.generateRoutes → api/user.getMenus → dynamic.ts 转换 → router.addRoute`。

## 核心封装设计

### Axios 二次封装 `src/utils/request.ts`
- 类型化响应壳 `ApiResponse<T>`；请求可选项 `RequestOptions { showError, showLoading, withToken, returnFull, retry }`
- 请求拦截：注入 `Authorization: Bearer <token>` + `X-Request-Id`；loading 计数；AbortController 取消
- 响应拦截：按 `code` 分流（SUCCESS 解包返回 data；TOKEN_EXPIRED/INVALID 跳登录；业务码 showError）；错误分支处理 401/403/超时/5xx/取消
- 对外 `http.get/post/put/delete/upload/download`，泛型返回 `Promise<T>`

### 动态路由 + 权限系统
- `routes.ts` 静态常量路由（login/404/403/redirect + dashboard/profile）
- `component-map.ts` 用 `import.meta.glob('@/views/**/*.vue')` 解析后端 component 字符串
- `dynamic.ts` 递归转换 menu→route，处理 path/component/meta 透传，按权限过滤
- `guards.ts`：token 校验 → 首次进入拉 userInfo + generateRoutes + addRoute + replace 重导 → 路由级 `meta.permissions` 校验 → tagsView addView + 标题
- `directives/permission.ts`：`v-permission="'teacher:add'"` 按钮级，无权移除元素
- 三级权限：路由/菜单级（meta+守卫+菜单过滤）、按钮级（v-permission + BaseButton）、数据级（usePermission.hasDataScope 控制列/操作）

### 通用 composables
- `useTable<T,Q>(apiFn, options)`：loading/list/total/page/query + search/reset/reload/onPageChange/onSizeChange，immediate 默认 true
- `useForm<T>(apiFn, options)`：formRef/form/loading/visible/mode + submit/open/close，含 validate + 成功提示
- `useDialog<T>()`：visible/title/mode/data + open/close + isView
- `useDict(...codes)`：批量加载带 Map 缓存 + getLabel

### Base 组件
- `BaseTable<T>`：`columns: TableColumn<T>[]` 配置驱动，含 selection/空态/loading 插槽、操作列 actions、字典渲染
- `BaseForm`：`schema: FormSchema[]` 驱动 + 校验 + 字段联动（visibleIf/disabledIf）
- `BaseDialog`：v-model:visible + loading + footer 插槽
- `BaseSearch`：schema 驱动查询条 + 搜索/重置/折叠
- `BasePagination`：v-model:page/pageSize + total

## MSW 集成方案
- `VITE_USE_MOCK` 控制（dev 默认 true，prod false）
- `mocks/browser.ts` 用 `setupWorker(...handlers)`；`main.ts` 中 `setupMock().finally(() => app.mount('#app'))`
- handler 按模块组织，与 `api/` 一一对应；`db.ts` 提供种子数据；`delay()` 模拟网络
- `public/mockServiceWorker.js` 由 `msw init` 生成
- 切换真实后端只需改 env，代码无改动

## 状态管理（Pinia + persistedstate）
- `user`：token/userInfo/roles/permissions/dataScopes + login/fetchUserInfo/logout/resetToken；token 持久化
- `permission`：routes/addRoutes/menus/isRoutesGenerated + generateRoutes/resetRoutes + hasPermission/hasRole；不持久化
- `app`：sidebarCollapsed/theme/size/language/device + toggle/set；部分字段持久化
- `tagsView`：visitedViews/cachedViews + add/remove/removeOther/removeAll/removeLeft/removeRight；不持久化

## 类型系统
- `api/types/*.ts` 线上 DTO；`types/entity/*.ts` 领域实体（service 做映射）；`types/common.ts` 公共（PageQuery/PageResult/Option/DictItem/TreeNode）
- `enums/*.ts` 消除魔法值（TeacherStatus/AuditStatus/ResultEnum 等）
- `types/global.d.ts` 增强 `RouteMeta`；`env.d.ts` 类型化 `ImportMetaEnv`

## 配置与工程化
- 多环境 `.env`：VITE_APP_TITLE / VITE_API_BASE_URL / VITE_USE_MOCK / VITE_DROP_CONSOLE
- `vite.config.ts`：`@` 别名、dev proxy（mock 时空）、AutoImport（vue/vue-router/pinia/@vueuse/core + ElementPlusResolver）、Components（Base/Business + EP resolver）、svg-icons、compression、scss additionalData 注入 variables、manualChunks（vue/element/echarts）
- `tsconfig.json`：strict + noUnusedLocals/Parameters/ImplicitReturns + paths `@/*`
- ESLint flat config（vue+ts+prettier）+ Prettier + lint-staged
- husky pre-commit（lint-staged）+ commit-msg（commitlint conventional）

## 示例业务模块（演示点）
- **教师管理**：列表（BaseSearch+BaseTable+DictTag+操作列 v-permission+数据级隐藏手机号）、详情（el-descriptions+资质 tab+时间线）、审核（BaseDialog+BaseForm）、资质。演示表格/表单/详情/权限。
- **学员管理**：列表（主从联动）+ StudentDetailDrawer + StudentFollowDialog + 跟进时间线页。演示主从/抽屉/弹窗表单校验。
- **课程/排课**：课程 CRUD（CourseFormDialog 多级联动）+ ScheduleCalendar（拖拽排课+冲突检测）。演示复杂表单/日历交互。
- **数据看板**：4×StatCard + TeacherTrendChart（折线）+ CourseDistChart（饼图）+ 最近审核表。useDashboardData 并发聚合 + useECharts（resize/销毁/暗黑主题）。演示 ECharts 按需集成。

## 关键依赖（版本范围）
- 运行：vue ^3.4 / vue-router ^4.3 / pinia ^2.1 / pinia-plugin-persistedstate ^3.2 / element-plus ^2.7 / @element-plus/icons-vue ^2.3 / axios ^1.7 / echarts ^5.5 / @vueuse/core ^11 / nprogress / dayjs / lodash-es / js-cookie / path-to-regexp / qs / file-saver / uuid
- 开发：vite ^5.3 / @vitejs/plugin-vue / vue-tsc ^2 / typescript ^5.4 / sass / unplugin-auto-import / unplugin-vue-components / vite-plugin-svg-icons / vite-plugin-compression / eslint ^9 / eslint-plugin-vue / @typescript-eslint/* / @vue/eslint-config-typescript / eslint-config-prettier / eslint-plugin-prettier / prettier / husky / lint-staged / @commitlint/* / msw ^2.3 / 各 @types/*

## 分阶段实施步骤
1. 初始化项目（pnpm create vite vue-ts，删 demo，建目录骨架）
2. 装依赖 + 工程化配置（tsconfig/vite/eslint/prettier/husky/commitlint/.env）
3. 全局基建（main/App/plugins/全局样式/env.d.ts/自动导入配置）
4. Axios + API 层（request.ts + api/types/* + api/* 骨架）
5. Pinia stores（user/permission/app/tagsView + 持久化）
6. 路由体系（routes/guards/dynamic/component-map）
7. 权限系统（directives/permission + usePermission + 数据级）
8. composables（useTable/useForm/useDialog/useDict）
9. Base 组件（BaseTable/Form/Dialog/Search/Pagination/Page/Button）
10. 布局（layouts/default + blank）
11. MSW 集成（mocks/ 全套 + main 启动 + public/mockServiceWorker.js）
12. 登录页与流程（views/login + 登录链路 + 动态路由注入）
13. 业务模块（dashboard/teacher/student/course 四模块）
14. 文档（docs/architecture|conventions|permission|decision-log）
15. 验证收尾（type-check/build/lint/手动走查）

## 验证方式
- **自动化**：`vue-tsc --noEmit` 零错误；`pnpm build` 成功且 chunk 合理；`pnpm lint` 零 error
- **手动走查**（dev + MSW）：控制台见 `[MSW] Mocking enabled` → admin/123456 登录进 dashboard → 菜单按权限渲染 → 教师列表分页/搜索/详情/审核 loading 正常 → 看板图表渲染 + resize + 暗黑跟随 → 学员主从/抽屉/弹窗校验 → 排课日历拖拽 → tagsView 多页签/关闭/affix/刷新 → mock TOKEN_EXPIRED 自动跳登录 → 无 teacher:add 角色登录「新增」按钮消失 → 访问无权 URL 跳 403
- **长期维护验证**：新增 feature 只加 4 个文件（views/api/api-types/mocks-handler）无需改全局；切换真实后端仅改 env；决策有 decision-log 记录

## 关键文件（实施时重点）
- `src/utils/request.ts` — Axios 二次封装，API 统一入口
- `src/router/guards.ts` — 鉴权 + 动态路由注入 + 权限校验全流程
- `src/router/dynamic.ts` — 后端菜单→前端路由转换
- `src/stores/modules/permission.ts` — 权限状态与动态路由生成
- `src/composables/useTable.ts` — 表格分页编排，复用率最高
- `vite.config.ts` — 别名/代理/自动导入/压缩工程化中枢
