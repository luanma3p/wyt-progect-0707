# 伴学老师后台管理系统 — 脚手架完成与修复实施计划

## Summary（摘要）

本计划用于把「伴学老师后台管理系统」Vue 3 脚手架从**当前不可编译的半成品状态**推进到**可长期维护、可构建、可运行（MSW 演示）**的完整骨架。

上一轮会话已完成核心层（utils/request、api、stores、router 新版、composables、部分 Base 组件），但因上下文丢失，磁盘上**并存两代互不兼容的代码**，且入口/构建配置仍是旧最小版，导致项目无法编译。本计划分 9 个阶段：先修复入口与构建配置、清理死代码，再补齐组件层、布局、MSW、登录/错误页、业务视图、service 层、文档，最后验证收尾。

所有约定遵守项目记忆硬约束（Vue 3.4+ `<script setup>` / TS strict / Axios 二次封装于 `utils/request.ts` / 动态路由权限 / feature 模块组织 / Pinia 模块化 / 三层 UI 模型 / ESLint+Prettier+TS 检查）与已批准方案 `vue3-scaffold-plan.md`。

---

## Current State Analysis（当前状态分析）

### ✅ 已完成且高质量（新版，作为唯一基线保留）
- `src/utils/request.ts` — Axios 二次封装，导出 `http` 与 `default service`，含 token/loading/取消/重试/业务码分流/`redirectToLogin` 动态 import 避免循环依赖。
- `src/api/{auth,user,teacher,student,course,dashboard,dict}.ts` + `src/api/types/*.ts` — 类型化 API，`authApi`/`userApi`/`teacherApi` 等，`http.get/post/...` 泛型返回。
- `src/stores/{index.ts,modules/{user,permission,app,tagsView}.ts}` — 新版 API：`fetchUserInfo`/`isRoutesGenerated`/`checkPermission`/`appSettings`；token 持久化。
- `src/router/{routes.ts,guards.ts,dynamic.ts,component-map.ts,permission.ts,types.ts,index.ts}` — 动态路由完整链路，`router/index.ts` 内部已调用 `setupRouterGuards`。
- `src/composables/{useTable,useForm,useDialog,useDict,usePermission,useLoading,useDownload,useECharts,useTheme,index}.ts` — `useForm` 用 `FormExpose` 最小接口对齐 BaseForm。
- `src/components/base/{BaseTable,BaseForm,BaseDialog,BaseSearch,BasePagination,BaseButton}/index.vue` + 各自 `types.ts` — 新版泛型/Schema 驱动。
- `src/directives/{permission,debounce,copy,index}.ts`、`src/plugins/{element-plus,icons,index}.ts`、`src/config/*`、`src/constants/keys.ts`、`src/enums/*`、`src/types/{global.d.ts,common.ts,entity/*}`、`src/auto-imports.d.ts`、`src/components.d.ts`（桩）。
- 根配置：`package.json`（依赖齐全含 msw/unplugin）、`tsconfig.json`、`tsconfig.node.json`、`.eslintrc.cjs`、`.prettierrc`、`.editorconfig`、`.env*`、`commitlint.config.cjs`、`lint-staged.config.cjs`、`index.html`、`.husky/*`。

### ❌ 破损/冲突（必须修复）
1. **`vite.config.ts` 是最小旧版**：无 `unplugin-auto-import`（但 `App.vue`/`useForm.ts` 等依赖 `computed` 等自动导入）；scss 注入路径错误 `@/styles/variables.scss`（实际在 `@/assets/styles/`）；proxy key `/api` 与 baseURL `/dev-api` 不一致；无 svg-icons/compression/manualChunks(echarts)。
2. **`src/main.ts` 是旧版**：`import { setupRouterGuard } from './router/guard'`（引用已破损的旧 guard）；`import '@/styles/index.scss'`（路径错）；未走 `setupStore`/`setupPlugins`/`setupMock`；且 `router/index.ts` 内部已注册新版 guards → 重复注册。
3. **样式路径错**：样式在 `src/assets/styles/{index,variables,mixins,reset,element-overrides}.scss`，但 `main.ts`/`vite.config.ts` 写成 `@/styles/...`。
4. **`src/plugins/index.ts`** `import { setupGlobalComponents } from '@/components'` — `src/components/index.ts` 不存在 → 编译失败。
5. **`src/components/base/index.ts`** 与实际组件脱节：仅导出 4 个组件，类型从旧 `./types` 导出（非泛型 `TableColumn`、`FormItemConfig`），与组件实际使用的 `BaseTable/types.ts`(泛型)/`BaseForm/types.ts`(`FormField`) 不符；缺 BasePagination/BaseButton/BasePage/BaseEmpty/BaseIcon。
6. **`src/components/base/types.ts`**（旧）`import type { OptionItem } from '@/types/global'` — `OptionItem` 不存在 → 编译失败。

### 🗑 死代码/重复文件（必须删除）
- `src/router/guard.ts`、`src/router/routes.static.ts`、`src/router/helper.ts` — 旧版，引用不存在的 store API（`isLoggedIn`/`getUserInfo`/`resetState`/`routesLoaded`/`hasAnyRole`/`initAffixTags`）与 `@/stores` 不存在的具名导出、`settings`（应为 `appSettings`）。
- `src/api/modules/{auth,user,role}.ts` — 旧版，用 `request` default import + 旧类型 `LoginParameters`/`UserInfo`/`RouteItem`，与新版 `authApi`/`userApi` 重复。
- `src/api/mock.ts` — 旧版，引用不存在的 `@/types/user`、`./types/system`。
- `src/api/types/system.ts` — 旧 `RouteItem`，已被 `api/types/user.ts` 的 `MenuRoute` 取代。
- `src/types/shims-vue.d.ts`、`src/types/router.d.ts` — 旧 shim，`env.d.ts` 与 `global.d.ts` 已覆盖。
- `src/utils/types.ts` — 旧工具类型，`types/common.ts` 已覆盖。
- `src/components/base/types.ts` — 旧非泛型类型，见上。

### 🆕 完全缺失（需新建）
- `src/components/index.ts`（`setupGlobalComponents`）
- Base 组件：`BasePage`、`BaseEmpty`、`BaseIcon`
- Business 组件：`DictTag`、`StatusBadge`、`PageHeader`、`TeacherSelector`
- `src/layouts/{default,blank}` 全套（sidebar/header/tagsView/breadcrumb/logo/appMain）
- `src/views/{login,dashboard,profile,redirect,error/{404,403},teacher,list,detail,student,list,course,management,schedule}`
- `src/service/{teacher,student,course}.service.ts`
- `mocks/{browser,index,db}.ts` + `mocks/handlers/*` + `public/mockServiceWorker.js`
- `docs/{architecture,conventions,permission,decision-log}.md`、`README.md`

---

## Assumptions & Decisions（假设与决策）

1. **唯一基线 = 新版**：以 `http`/`authApi`/`userApi`/`fetchUserInfo`/`isRoutesGenerated`/`checkRoutePermission`/`appSettings` 为准；旧版文件全部删除。
2. **自动导入**：现有代码依赖 `computed`/`ref` 等全局可用，因此 `vite.config.ts` 必须配置 `unplugin-auto-import`（vue/vue-router/pinia/@vueuse/core）；`src/auto-imports.d.ts` 桩已存在，dev 时插件刷新。
3. **Element Plus 注册策略（稳健优先）**：保留 `app.use(ElementPlus)` 全量注册 + `import 'element-plus/dist/index.css'` 全量样式；**不启用** `unplugin-vue-components` 的 ElementPlusResolver（避免按需样式/指令样式引入的坑）。Base/Business 组件通过 `setupGlobalComponents` 显式全局注册。按需加载作为未来优化写入 decision-log。
4. **目录大小写标准化**：`src/components/base` → `Base`，新建 `Business`；Windows 上做两步改名（`base`→`base_tmp`→`Base`）或重建，确保跨平台一致。
5. **样式路径**：统一用 `@/assets/styles/...`；修正 `main.ts` 与 `vite.config.ts`。
6. **代理/baseURL 对齐**：baseURL 保持 `/dev-api`（来自 env）；vite proxy key 改为 `/dev-api` 并 rewrite 去前缀；MSW handler 匹配 `/dev-api/*` 路径。
7. **看板**：单一 `dashboardApi.getOverview()` 返回 `stat/teacherTrend/courseDist/recentAudits`；用 `useECharts` 渲染折线+饼图。
8. **service 薄层**：对 teacher/student/course 做轻量 DTO↔Entity 映射与聚合，演示分层；简单 CRUD 由 composable 直连 api。
9. **目录分页字段**：沿用现有 `pageNum`/`pageSize`（全链路一致）。
10. **`FormExpose` 类型修正**：`BaseForm` 的 `validate` 经可选链返回 `Promise<boolean> | undefined`，将 `useForm.ts` 的 `FormExpose.validate` 返回类型放宽为 `Promise<boolean> | undefined` 以对齐。

---

## Proposed Changes（分阶段实施）

### 阶段 A — 修复入口与构建配置
**A1. 重写 `vite.config.ts`**：加入 `AutoImport`（imports: vue/vue-router/pinia/@vueuse/core，dts: `src/auto-imports.d.ts`，eslintrc: `.eslintrc-auto-import.json`）；`viteSvgIcons`（iconDirs: `src/assets/icons`，symbolId: `icon-[dir]-[name]`）；`viteCompression`；scss `additionalData: '@use "@/assets/styles/variables.scss" as *;'`；proxy `'/dev-api'` → target，rewrite 去 `/dev-api`；`manualChunks`（vue/element/echarts/utils）。保留 `@` 别名。
**A2. 重写 `src/main.ts`**：编排 `setupApp` = createApp → `setupStore(app)`（来自 `@/stores`）→ `app.use(router)`（router 内部已注册 guards，不再调旧 `setupRouterGuard`）→ `setupPlugins(app)`（来自 `@/plugins`）→ `setupMock().finally(() => app.mount('#app'))`。样式改 `import '@/assets/styles/index.scss'`、`import 'nprogress/nprogress.css'`。保留全局错误处理。`setupMock` 来自 `@/mocks`，仅当 `import.meta.env.VITE_USE_MOCK === 'true'` 时启动 worker。
**A3. 修正 `src/plugins/index.ts`**：依赖 `@/components` 的 `setupGlobalComponents`（阶段 C 创建后即可）。
**A4. 类型修正 `src/composables/useForm.ts`**：`FormExpose.validate` 返回 `Promise<boolean> | undefined`。

### 阶段 B — 清理死代码
删除：`src/router/guard.ts`、`src/router/routes.static.ts`、`src/router/helper.ts`、`src/api/modules/`（整个目录）、`src/api/mock.ts`、`src/api/types/system.ts`、`src/types/shims-vue.d.ts`、`src/types/router.d.ts`、`src/utils/types.ts`、`src/components/base/types.ts`。

### 阶段 C — 完成组件层
**C1. 目录改名**：`src/components/base` → `src/components/Base`；新建 `src/components/Business/`。
**C2. 新建 Base 组件**：
- `Base/BasePage/index.vue` — 页面容器（标题/面包屑槽/操作栏槽/默认插槽），统一页面内边距。
- `Base/BaseEmpty/index.vue` — 空态（icon + text + 插槽），props: `description`、`image`。
- `Base/BaseIcon/index.vue` — svg-symbol 图标包装（用 `vite-svg-icons` 的 `#icon-xxx`），props: `name`、`size`、`color`。
**C3. 新建 Business 组件**：
- `Business/DictTag/index.vue` — 用 `useDict(code)` + `el-tag` 渲染字典值，props: `code`、`value`。
- `Business/StatusBadge/index.vue` — 通用状态徽标，props: `status`、`map`（status→{label,type}）。
- `Business/PageHeader/index.vue` — 页头（标题/描述/返回/操作槽），emit `back`。
- `Business/TeacherSelector/index.vue` — 教师下拉选择（远程搜索），用 `teacherApi.getList`，props: `modelValue`、`multiple`。
**C4. 重写 `src/components/Base/index.ts`**：导出全部 9 个 Base 组件 + 从各组件 `types.ts` 重新导出类型（`TableColumn`/`TableAction`/`BaseTableProps`、`FormField`/`FieldType`/`BaseFormProps`）。
**C5. 新建 `src/components/Business/index.ts`**：导出 4 个 Business 组件。
**C6. 新建 `src/components/index.ts`**：`setupGlobalComponents(app)` 注册全部 Base+Business 组件为全局组件。

### 阶段 D — 布局 layouts
**D1. `src/layouts/default/index.vue`**：`ElContainer` 横向布局（Sidebar + 右侧 `ElContainer`[Header + TagsView + AppMain]）；侧边栏折叠态接 `appStore.sidebarCollapsed`；监听 `useResizeObserver` 设置 `appStore.device`。
**D2. `src/layouts/default/components/Sidebar/`**：
- `Logo.vue`（图标+标题，折叠时仅图标）
- `SidebarItem.vue`（递归菜单项，处理 `meta.hidden`/`alwaysShow`/单子节点/外链 `frameSrc`）
- `index.vue`（`ElMenu` 从 `permissionStore.menus` 渲染，`router` 模式，`collapse` 跟随侧边栏）
**D3. `src/layouts/default/components/Header.vue`**：折叠按钮、`Breadcrumb`、右侧（主题切换 `useTheme`、全屏、用户头像下拉「个人中心/登出」）。
**D4. `src/layouts/default/components/Breadcrumb.vue`**：从 `route.matched` 过滤 `meta.title && !hidden` 渲染 `ElBreadcrumb`。
**D5. `src/layouts/default/components/TagsView.vue`**：`ElScroll` 横向标签页，从 `tagsViewStore.visitedViews` 渲染；右键菜单（关闭/关闭其他/关闭左侧/关闭右侧/全部关闭）；`affix` 不可关；点击跳转；当前高亮。
**D6. `src/layouts/default/components/AppMain.vue`**：`<router-view v-slot>` + `<keep-alive :include="tagsViewStore.cachedViews">`；`<transition>`。
**D7. `src/layouts/blank/index.vue`**：裸 `<router-view />`（用于登录等）。

### 阶段 E — MSW Mock 集成
**E1. `public/mockServiceWorker.js`**：运行 `msw init public/ --save` 生成。
**E2. `mocks/db.ts`**：种子数据（admin/teacher 用户、菜单树 `MenuRoute[]`、教师/学员/课程列表、看板聚合、字典：`teacher_status`/`audit_status`/`gender`/`subject`/`course_status`）。
**E3. `mocks/handlers/*.ts`**（匹配 `/dev-api/*`）：
- `auth.ts`：`POST /dev-api/auth/login`（admin/123456 → token）、`POST /dev-api/auth/logout`
- `user.ts`：`GET /dev-api/user/info`（按 token 返回 UserInfoResp）、`GET /dev-api/user/menus`（返回菜单树）
- `teacher.ts`：`GET /dev-api/teacher/list`（分页+过滤）、`GET /dev-api/teacher/:id`、`POST /dev-api/teacher/audit`、`PUT /dev-api/teacher/:id/status`
- `student.ts`：列表/详情/跟进
- `course.ts`：课程 CRUD、排课
- `dashboard.ts`：`GET /dev-api/dashboard/overview`
- `dict.ts`：`GET /dev-api/dict/:code`
- `index.ts`：聚合导出
每个 handler 用 `HttpResponse.json({ code:200, data, message:'ok' })` 包成 `ApiResponse`，`delay(200~500)`。
**E4. `mocks/browser.ts`**：`setupWorker(...handlers)`。
**E5. `mocks/index.ts`**：`setupMock()`：`if (VITE_USE_MOCK) { await worker.start({ onUnhandledRequest: 'bypass' }); console.log('[MSW] Mocking enabled') }`；prod 构建时 `mocks` 不打包（动态 import）。

### 阶段 F — 登录/错误/profile/redirect 视图
**F1. `src/views/login/index.vue`**：居中卡片 + `ElForm`（用户名/密码/记住我），调 `userStore.login`，成功后 `router.replace(redirect || '/')`；展示演示账号 admin/123456；`v-permission` 不适用（白名单页）。
**F2. `src/views/error/404.vue`、`403.vue`**：居中提示 + 返回首页按钮。
**F3. `src/views/redirect/index.vue`：`onBeforeMount` 用 `router.replace({ path: route.params.path, query: route.query })` 实现刷新当前页（配合 `cachedViews` 重载）。
**F4. `src/views/profile/index.vue`**：`el-descriptions` 展示用户信息 + 修改密码 `ElForm`（调 `userApi`，若无 changePassword API 则仅前端演示）。

### 阶段 G — 业务模块视图 + service 层
**G1. service 层**（薄层）：`src/service/{teacher,student,course}.service.ts` — DTO→Entity 映射 + 聚合；export `teacherService.list/getDetail/audit/...` 等，内部调 `teacherApi` 并做字段转换（演示分层；entity 类型用 `@/types/entity/*`）。
**G2. `src/views/dashboard/index.vue`**：4×`StatCard`（stat）+ `TeacherTrendChart`（折线，`useECharts`）+ `CourseDistChart`（饼图）+ 最近审核 `BaseTable`；`useDashboardData` composable 并发 `dashboardApi.getOverview` + 字典；暗黑主题跟随。
**G3. `src/views/teacher/list/index.vue`**：`BasePage` + `BaseSearch`（keyword/status/subject）+ `BaseTable`（列：头像/姓名/手机号/科目/状态[DictTag]/评分/操作）+ `BasePagination`；操作列 `v-permission`（teacher:audit/teacher:status）；审核 `BaseDialog`+`BaseForm`（`useForm(teacherService.audit)`）；数据级：无 `teacher:phone:view` 权限时手机号脱敏。
**G4. `src/views/teacher/detail/index.vue`**：`PageHeader` + `el-descriptions` + 资质 `el-timeline` + 跟进记录 `el-timeline`；路由 `meta.activeMenu=/teacher/list`。
**G5. `src/views/student/list/index.vue`**：`BaseSearch`+`BaseTable`+`BasePagination`；行点击打开 `StudentDetailDrawer`（主从联动）；跟进 `BaseDialog`+`BaseForm`（校验演示）。
**G6. `src/views/course/management/index.vue`**：课程 `BaseTable` + `CourseFormDialog`（`BaseForm` 多级联动：科目→课程类型）+ `useForm`。
**G7. `src/views/course/schedule/index.vue`**：`ElCalendar` + 当日排课列表 + 新增排课 `BaseDialog`（冲突检测：同教师/学员时间段）；演示日历交互（点击日期新增）。

### 阶段 H — 文档
- `docs/architecture.md`：分层架构、调用规则、目录约定。
- `docs/conventions.md`：命名/提交/组件分层/composable 约定。
- `docs/permission.md`：三级权限模型与使用方式。
- `docs/decision-log.md`：关键决策（EP 全量注册、自动导入、MSW、FormExpose 解耦、动态 import 避免循环依赖等）。
- `README.md`：项目介绍/技术栈/目录/启动（`npm install`、`npm run dev`、admin/123456）/脚本/切换真实后端/新增 feature 流程。

### 阶段 I — 验证收尾
1. `npm install`（确保 node_modules 就绪）。
2. `npx msw init public/ --save`（生成 mockServiceWorker.js）。
3. `npm run type-check`（`vue-tsc --noEmit`）零错误；逐项修复（重点：组件 ref 类型、未用变量、`OptionItem` 残留引用）。
4. `npm run build`（`vue-tsc --noEmit && vite build`）成功，chunk 合理。
5. `npm run lint:check` 零 error（必要时 `npm run lint`）。
6. `npm run dev` 手动走查：控制台 `[MSW] Mocking enabled` → admin/123456 登录 → 菜单按权限渲染 → 看板图表+resize+暗黑跟随 → 教师列表分页/搜索/详情/审核 → 学员主从/抽屉/弹窗校验 → 排课日历 → tagsView 多页签/affix/刷新 → 无 `teacher:add` 角色登录「新增」按钮消失 → 访问无权 URL 跳 403 → mock TOKEN_EXPIRED 自动跳登录。

---

## Verification（验证标准）
- 自动化：`vue-tsc --noEmit` 零错误；`npm run build` 成功；`npm run lint:check` 零 error。
- 运行：`npm run dev` + MSW，完成手动走查清单（阶段 I.6）。
- 长期维护：新增 feature 仅加 `views/`+`api/`+`api/types/`+`mocks/handlers/` 四类文件无需改全局；切换真实后端仅改 `.env` 的 `VITE_USE_MOCK=false`。

## 关键风险与缓解
- **首次构建 dts 缺失**：`auto-imports.d.ts`/`components.d.ts` 桩已存在，保证 `vue-tsc` 先行通过；dev/build 时插件刷新。
- **循环依赖**：`request.ts` 已用 `await import('@/router')` 动态导入规避；保持不变。
- **EP 全量包体**：作为可接受权衡写入 decision-log，按需加载列为未来优化。
- **目录大小写**：强制 `Base`/`Business`，跨平台一致。
