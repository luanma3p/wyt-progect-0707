# 伴学老师后台管理系统 — 脚手架完成实施计划

> 本计划基于对当前磁盘代码的全面探索，整合前序会话的所有决策，提供一份**决策完整、可直接执行**的实施路线。
> 执行者无需再做任何架构选择，按阶段顺序实施即可。

---

## 一、Summary（总览）

为「伴学老师后台管理系统」完成一个**可长期维护**的 Vue 3 + TypeScript 项目脚手架。当前磁盘上并存两代代码（新版基线 + 旧版死代码），入口/构建配置部分已修复，但布局、视图、MSW、service、文档等层完全缺失，项目尚不可编译运行。

本计划通过 **9 个阶段（A–I）** 完成修复与补齐：
- **A** 修复入口与构建配置（main.ts / element-plus.ts / useForm.ts / scss partials）
- **B** 清理旧版死代码（router/api/types/utils/components 下的冲突文件）
- **C** 完成组件层（base→Base 改名、补全 Base 与 Business 组件、global-components.d.ts）
- **D** 布局 layouts（default 含侧边栏/导航/标签/面包屑，blank 纯净）
- **E** MSW Mock 集成（browser/db/handlers，env 开关）
- **F** 基础视图（login / error{403,404} / profile / redirect）
- **G** 业务视图 + service 层（teacher / student / course / dashboard）
- **H** 文档（architecture / conventions / permission / decision-log + README）
- **I** 验证收尾（type-check / build / dev 联调）

**技术栈基线**：Vue 3.4 + TS 5.5（strict）+ Vite 5.4 + Pinia 2.2 + Vue Router 4.4 + Element Plus 2.8 + ECharts 5.5 + Axios + MSW v2。

---

## 二、Current State Analysis（当前状态分析）

### 2.1 已存在且为新版基线（保留不动）

| 层 | 文件 | 说明 |
|---|---|---|
| 构建配置 | `vite.config.ts` | 已含 AutoImport / Components(ElementPlusResolver) / SVG icons / compression / scss additionalData / `/dev-api` proxy / manualChunks |
| API 层 | `api/{auth,user,teacher,student,course,dashboard,dict}.ts` + `api/types/{common,auth,user,teacher,student,course,dashboard}.ts` | 新版，用 `http` 命名导入，类型完整 |
| Store 层 | `stores/index.ts` + `stores/modules/{user,permission,app,tagsView}.ts` | 新版，`fetchUserInfo`/`isRoutesGenerated`/`http`/`appSettings`/persist |
| Router 层 | `router/{index,routes,guards,dynamic,component-map,permission,types}.ts` | 新版，`router/index.ts` 内部已调用 `setupRouterGuards` |
| Utils | `utils/request.ts`（http + default service）、`auth/storage/validate/format/download/tree/permission/index.ts` | 完整 |
| Composables | `useTable/useForm/useDialog/useDict/usePermission/useLoading/useDownload/useECharts/useTheme/index.ts` | 完整 |
| Directives | `directives/{index,permission,debounce,copy}.ts` | 完整 |
| Plugins | `plugins/{index,element-plus,icons}.ts` | element-plus.ts 仅注册服务式 API，**缺 `app.use(ElementPlus)`** |
| Config | `config/{index,settings}.ts` | `appSettings`/`defaultSettings`/`updateSettings` |
| Enums | `enums/{business,http,permission}.ts` | 完整 |
| 基础组件 | `components/base/{BaseTable,BaseForm,BaseDialog,BaseSearch,BasePagination,BaseButton}` | 目录小写，导出不完整 |
| 样式 | `assets/styles/{index,variables,mixins,reset,element-overrides}.scss` | partial 缺 `@use variables` |
| 类型桩 | `auto-imports.d.ts`（全量 vue API）、`components.d.ts`（空）、`types/global.d.ts`（RouteMeta 增强）、`types/common.ts`、`types/entity/*` | 完整 |

### 2.2 破损/冲突（必须修复）

| 文件 | 问题 | 修复 |
|---|---|---|
| `src/main.ts` | 引用破损 `router/guard.ts`（单数）；样式路径 `@/styles/` 错（应为 `@/assets/styles/`）；未走 `setupStore`/`setupPlugins`/`setupMock`；与 `router/index.ts` 内部守卫重复注册 | 重写 |
| `src/plugins/element-plus.ts` | 仅注册服务式 API，未 `app.use(ElementPlus)`，导致 v-loading 指令及组件未全局注册 | 添加全量注册 |
| `src/composables/useForm.ts` | `FormExpose.validate` 返回 `Promise<boolean>`，但 BaseForm 经可选链返回 `Promise<boolean> \| undefined` | 放宽类型 |
| `src/assets/styles/{reset,element-overrides,mixins}.scss` | 使用 `$color-*` 等变量但未 `@use variables` | 各加 `@use './variables.scss' as *;` |
| `src/composables/index.ts` | 仅导出 4 个 composable，缺 useDict/useLoading/useDownload/useECharts/useTheme | 补全导出 |
| `src/components/base/index.ts` | 导出不完整（缺 BasePagination/BaseButton），引用旧 types.ts | 重写 |
| `src/components/base/BaseSearch/index.vue` | import 路径 `@/components/Base/BaseForm`（大写）与实际目录（小写）不符 | 随目录改名统一 |
| `env.d.ts` | 声明的 `VITE_API_PREFIX/VITE_PORT/VITE_ROUTER_MODE/VITE_TOKEN_KEY` 在 .env 未定义；`VITE_USE_MOCK/VITE_DROP_CONSOLE/VITE_PROXY_TARGET` 在 .env 有但声明缺 | 补全 ImportMetaEnv |
| `.prettierrc` 与 `.prettierrc.json` 并存 | `trailingComma` 冲突（all vs none） | 删除 `.prettierrc.json`，保留 `.prettierrc` |

### 2.3 死代码（必须删除）

- `src/router/{guard.ts, routes.static.ts, helper.ts}`（旧版，引用断裂 API）
- `src/api/modules/`（整个目录：auth/user/role.ts，default import 风格 + 断裂类型引用）
- `src/api/mock.ts`（引用 `@/types/user` 断裂）
- `src/api/types/system.ts`（RouteItem 双轨制）
- `src/types/{shims-vue.d.ts, router.d.ts}`（与 global.d.ts 的 RouteMeta 重复且语义冲突）
- `src/utils/types.ts`（旧工具类型）
- `src/components/base/types.ts`（引用不存在的 `OptionItem`，且 BaseTable/BaseForm 各自有 types.ts）

### 2.4 完全缺失（需新建）

- `src/components/index.ts`（setupGlobalComponents）
- `src/components/Base/{BasePage,BaseEmpty,BaseIcon}/index.vue`
- `src/components/Business/{DictTag,StatusBadge,PageHeader,TeacherSelector}/index.vue`
- `src/types/global-components.d.ts`（手写 Base/Business 的 GlobalComponents 声明）
- `src/layouts/{default,blank}/` 全套（侧边栏/导航/标签/面包屑/主内容区）
- `src/views/{login,dashboard,profile,redirect,error/{404,403},teacher/{list,detail},student/list,course/{management,schedule}}`
- `src/service/{teacher,student,course}.service.ts`
- `mocks/{browser,index,db}.ts` + `mocks/handlers/*` + `public/mockServiceWorker.js`
- `docs/{architecture,conventions,permission,decision-log}.md` + `README.md`

---

## 三、Assumptions & Decisions（假设与决策）

| # | 决策 | 理由 |
|---|---|---|
| D1 | **唯一基线 = 新版**。所有旧版死代码删除，不尝试兼容 | 旧版引用断裂 API，无法运行 |
| D2 | **Element Plus 全量注册**（`app.use(ElementPlus)`）+ ElementPlusResolver 仅生成 d.ts + 全量 CSS import | 保证 v-loading 等指令与所有组件可用，简化维护 |
| D3 | **目录大小写标准化**：`components/base` → `components/Base`，新增 `components/Business` | 三层模型 UI库→Base→Feature，命名一致 |
| D4 | **SCSS 双重保障**：additionalData 注入 + partial 自含 `@use './variables.scss' as *;` | Sass @use 同模块去重，不报错；partial 独立编译亦安全 |
| D5 | **自动导入依赖**：`computed/ref/watch` 等由 AutoImport 提供，vue-tsc 读 `auto-imports.d.ts` 桩通过 | 已有全量桩文件 |
| D6 | **Base/Business 组件通过 `setupGlobalComponents` 显式注册 + 手写 `global-components.d.ts`** | vue-tsc 不识别运行时全局注册，需静态声明 |
| D7 | **MSW v2**，handler 匹配 `/dev-api/*`，env `VITE_USE_MOCK=true` 开关，main.ts 动态 import | 与生产分离，零成本切换 |
| D8 | **service 层薄封装**：teacher/student/course 各一个 service.ts，封装 API 调用 + 业务转换（Entity↔DTO），composable 调 service | 分层单向依赖 View→Composable→Service→API |
| D9 | **首次验证顺序**：先 `npx vite build` 生成 d.ts → 再 `vue-tsc --noEmit` → 最后 `npm run dev` 联调 | 解决 dts 鸡蛋问题 |
| D10 | **删除 `.prettierrc.json`**，保留 `.prettierrc`（trailingComma: all） | 消除配置冲突 |
| D11 | **`env.d.ts` 补全**：移除未定义字段，补全 `VITE_USE_MOCK/VITE_DROP_CONSOLE/VITE_PROXY_TARGET` | 类型与实际 env 对齐 |

---

## 四、Proposed Changes（分阶段实施）

### 阶段 A：修复入口与构建配置

**目标**：让入口编排正确、Element Plus 全量可用、类型对齐、样式可编译。

#### A1. 重写 `src/main.ts`
- 编排顺序：`createApp(App)` → `setupStore(app)` → `app.use(router)` → `setupPlugins(app)` → 条件 `setupMock()` → `app.mount('#app')`
- import：`virtual:svg-icons-register`、`element-plus/dist/index.css`、`nprogress/nprogress.css`、`@/assets/styles/index.scss`
- setupMock：`if (import.meta.env.VITE_USE_MOCK === 'true') { const { setupMock } = await import('@/mocks'); await setupMock() }`，用 `.finally(() => app.mount('#app'))` 兜底
- 移除对 `router/guard` 的引用（router/index.ts 内部已注册 guards）
- 保留 `app.config.errorHandler`

#### A2. 修改 `src/plugins/element-plus.ts`
- 添加 `import ElementPlus from 'element-plus'`
- 在 `setupElementPlus` 中 `app.use(ElementPlus)`
- 保留服务式 API 全局属性挂载

#### A3. 修改 `src/composables/useForm.ts`
- `FormExpose.validate` 返回类型改为 `Promise<boolean> | undefined`

#### A4. 修改 3 个 SCSS partial
- `reset.scss`、`element-overrides.scss`、`mixins.scss` 顶部各加 `@use './variables.scss' as *;`

#### A5. 修改 `src/composables/index.ts`
- 补全导出：`useDict`、`useLoading`、`useDownload`、`useECharts`、`useTheme` 及其相关类型

#### A6. 修改 `src/components/base/index.ts`
- 重写导出：`BaseTable/BaseForm/BaseDialog/BaseSearch/BasePagination/BaseButton` + 类型（`TableColumn` from `./BaseTable/types`、`FormField/FieldType/BaseFormProps` from `./BaseForm/types`）
- 移除对旧 `./types` 的引用

#### A7. 修改 `env.d.ts`
- ImportMetaEnv 字段对齐实际 .env：保留 `VITE_APP_TITLE`、`VITE_API_BASE_URL`、`VITE_USE_MOCK`、`VITE_DROP_CONSOLE`、`VITE_PROXY_TARGET`；移除未定义的 `VITE_API_PREFIX/VITE_PORT/VITE_ROUTER_MODE/VITE_TOKEN_KEY`

#### A8. 删除 `.prettierrc.json`
- 保留 `.prettierrc`

**验证点**：vite 配置可加载；main.ts 无断裂引用；scss 可预处理。

---

### 阶段 B：清理死代码

**目标**：消除新旧冲突，确保唯一基线。

**删除文件清单**：
- `src/router/guard.ts`
- `src/router/routes.static.ts`
- `src/router/helper.ts`
- `src/api/modules/auth.ts`
- `src/api/modules/user.ts`
- `src/api/modules/role.ts`
- `src/api/modules/`（空目录）
- `src/api/mock.ts`
- `src/api/types/system.ts`
- `src/types/shims-vue.d.ts`
- `src/types/router.d.ts`
- `src/utils/types.ts`
- `src/components/base/types.ts`

**验证点**：全局搜索无对上述文件的 import 引用。

---

### 阶段 C：完成组件层

**目标**：补齐 Base/Business 组件，目录改名，全局注册，类型声明。

#### C1. 目录改名 `components/base` → `components/Base`
- 使用 `git mv`（Windows 大小写不敏感，必要时两步：`base` → `base-tmp` → `Base`）
- 全局更新 import 路径（BaseSearch 内部、components/index.ts 等）

#### C2. 新建 Base 组件
- `components/Base/BasePage/index.vue`：页面容器（标题 + 工具栏 slot + 内容区），配合 PageHeader
- `components/Base/BaseEmpty/index.vue`：空状态（图标 + 文案 + action slot）
- `components/Base/BaseIcon/index.vue`：SVG 图标包装（name → `<svg-icon>`），依赖 `virtual:svg-icons-register`

#### C3. 新建 Business 组件
- `components/Business/DictTag/index.vue`：字典标签（value → label + el-tag，props: code/value），内部用 useDict
- `components/Business/StatusBadge/index.vue`：状态徽章（status → color + text），props: status/type
- `components/Business/PageHeader/index.vue`：页头（title + breadcrumb + actions slot）
- `components/Business/TeacherSelector/index.vue`：教师选择器（el-select + 远程搜索，调 teacherApi.getList）

#### C4. 新建 `src/components/index.ts`
- `setupGlobalComponents(app)`：注册所有 Base + Business 组件为全局组件

#### C5. 新建 `src/types/global-components.d.ts`
- 手写 `declare module 'vue' { export interface GlobalComponents { ... } }`
- 声明所有 Base/Business 组件的类型（用 `DefineComponent` 桩）

#### C6. 重写 `src/components/Base/index.ts`（阶段 A6 已做，此处确认导出含新 Base 组件）

**验证点**：vue-tsc 识别全局组件；setupGlobalComponents 注册无遗漏。

---

### 阶段 D：布局 layouts

**目标**：提供默认后台布局与空白布局。

#### D1. `src/layouts/default/index.vue`
- 结构：`<Sidebar />` + `<div class="main"><Navbar /><TagsView /><AppMain /></div>`
- 用 `useAppStore`（sidebarCollapsed）、`usePermissionStore`（menus）、`useTagsViewStore`、`useUserStore`
- 响应式：监听 window resize 设置 device

#### D2. 拆分子组件（`src/layouts/default/components/`）
- `Sidebar/index.vue`：logo + 递归菜单（`SidebarItem` 递归渲染 menus）
- `Sidebar/SidebarItem.vue`：单菜单项（icon + title + children 递归）
- `Navbar/index.vue`：折叠按钮 + 面包屑 + 右侧（用户头像下拉/主题切换/全屏）
- `TagsView/index.vue`：多页签滚动条 + 右键菜单（关闭其他/左侧/右侧/全部）
- `Breadcrumb/index.vue`：根据 route.matched 渲染
- `AppMain/index.vue`：`<router-view v-slot>` + `<keep-alive :include="cachedViews">` + transition

#### D3. `src/layouts/blank/index.vue`
- 纯 `<router-view />`，用于登录/错误页

**验证点**：登录后能渲染 dashboard；侧边栏菜单来自动态路由；标签页可关闭。

---

### 阶段 E：MSW Mock 集成

**目标**：开发环境零后端运行。

#### E1. `public/mockServiceWorker.js`
- 运行 `npx msw init public/ --save` 生成

#### E2. `src/mocks/index.ts`
- `setupMock()`：开发环境启动 worker，`worker.start({ onUnhandledRequest: 'bypass' })`
- 导出 `setupMock`

#### E3. `src/mocks/browser.ts`
- `setupWorker(...handlers)`，导出 `worker`

#### E4. `src/mocks/db.ts`
- 内存数据库：users（admin/teacher）、teachers（列表 + 详情）、students、courses、schedules、dicts、dashboard overview
- 提供查询/修改辅助函数

#### E5. `src/mocks/handlers/`
- `auth.ts`：POST `/auth/login`、POST `/auth/logout`、POST `/auth/refresh`
- `user.ts`：GET `/user/info`、GET `/user/menus`（返回菜单树含 teacher/student/course/dashboard）
- `teacher.ts`：GET `/teacher/list`（分页+筛选）、GET `/teacher/:id`、POST `/teacher/audit`、PUT `/teacher/:id/status`
- `student.ts`：GET `/student/list`、GET `/student/:id/follows`、POST `/student/follow`
- `course.ts`：GET `/course/list`、POST/PUT/DELETE `/course`、GET `/course/schedule`
- `dashboard.ts`：GET `/dashboard/overview`
- `dict.ts`：GET `/dict/:code`
- `index.ts`：聚合所有 handlers

handler 路径前缀匹配 `/dev-api/*`（baseURL），返回 `ApiResponse` 结构 `{ code: 200, data, message }`。

**验证点**：`VITE_USE_MOCK=true` 时 dev 可登录（admin/123456）并加载菜单。

---

### 阶段 F：基础视图

**目标**：补齐路由引用的视图，使路由可解析。

#### F1. `src/views/login/index.vue`
- 表单（用户名/密码/记住我）+ 登录逻辑（userStore.login → 跳 redirect 或 /）
- 用 BaseForm 或原生 el-form；背景图/品牌区
- 默认填充 admin/123456 便于演示

#### F2. `src/views/error/404.vue` 与 `src/views/error/403.vue`
- 居中插画 + 文案 + 返回首页按钮

#### F3. `src/views/profile/index.vue`
- 用户信息卡 + 修改密码表单（mock）

#### F4. `src/views/redirect/index.vue`
- `onBeforeMount` 用 `router.replace(to.path)` 重载（配合 keep-alive 刷新）

**验证点**：路由可解析到组件，无 404。

---

### 阶段 G：业务视图 + service 层

**目标**：完成四个业务模块的可运行页面。

#### G1. service 层
- `src/service/teacher.service.ts`：`fetchTeacherList/fetchTeacherDetail/auditTeacher/toggleTeacherStatus`，DTO→Entity 转换
- `src/service/student.service.ts`：`fetchStudentList/fetchFollows/addFollow`
- `src/service/course.service.ts`：`fetchCourseList/saveCourse/removeCourse/fetchSchedule`

#### G2. 教师管理
- `src/views/teacher/list/index.vue`：BaseSearch + BaseTable（状态/资质/操作列）+ 审核弹窗（BaseDialog + BaseForm）+ useTable/useForm
- `src/views/teacher/detail/index.vue`：教师基本信息 + 资质列表 + 跟进记录时间线

#### G3. 学员管理
- `src/views/student/list/index.vue`：BaseSearch + BaseTable + 跟进弹窗

#### G4. 课程/排课
- `src/views/course/management/index.vue`：课程 CRUD（表格 + 弹窗表单）
- `src/views/course/schedule/index.vue`：日历视图（el-calendar 或简易网格）展示排课

#### G5. 数据看板
- `src/views/dashboard/index.vue`：4 个统计卡片 + 教师趋势折线图（useECharts）+ 课程分布饼图 + 最近审核列表

**验证点**：各页面可加载、分页/搜索/弹窗可用、图表渲染。

---

### 阶段 H：文档

**目标**：长期可维护性的文档支撑。

- `README.md`：项目简介 / 技术栈 / 快速开始（install/dev/build/login） / 目录结构 / 文档索引
- `docs/architecture.md`：分层架构图 / 各层职责 / 依赖方向
- `docs/conventions.md`：命名/目录/类型/API/composable/组件约定
- `docs/permission.md`：JWT+RBAC 三级权限实现说明（路由/按钮/数据级）
- `docs/decision-log.md`：关键架构决策记录（ADR 风格）

**验证点**：文档与代码一致。

---

### 阶段 I：验证收尾

**目标**：确保可编译、可构建、可运行。

#### I1. 生成 d.ts（解决鸡蛋问题）
- 先跑 `npx vite build`（或 `npx vite` 让 AutoImport/Components 生成 `auto-imports.d.ts`/`components.d.ts`/`.eslintrc-auto-import.json`）

#### I2. 类型检查
- `npm run type-check`（vue-tsc --noEmit）通过

#### I3. 构建
- `npm run build` 通过

#### I4. 开发联调
- `npm run dev`，用 admin/123456 登录，验证：登录→动态路由→侧边栏菜单→dashboard→教师列表→审核弹窗→登出

#### I5. Lint
- `npm run lint:check` 通过

**验证点**：四项命令全绿；核心流程跑通。

---

## 五、Verification（整体验证标准）

1. **可编译**：`npm run type-check` 零错误
2. **可构建**：`npm run build` 产出 dist/
3. **可运行**：`npm run dev` 启动，admin/123456 登录成功，看到完整后台界面
4. **可维护**：文档齐全，分层清晰，类型安全
5. **无死代码**：全局搜索无对已删除文件的引用
6. **权限可用**：登录后动态路由注入；按钮级 v-permission 生效

---

## 六、风险与缓解

| 风险 | 缓解 |
|---|---|
| Windows 大小写不敏感导致 `base→Base` 改名失败 | 用 git mv 两步法，或直接创建 Base 目录迁移 |
| vue-tsc 不识别运行时全局组件 | 手写 `global-components.d.ts` 静态声明 |
| AutoImport 首次运行前 d.ts 不全 | 阶段 I 先跑 vite build 生成 d.ts 再 type-check |
| MSW worker 未初始化 | 阶段 E 先跑 `npx msw init public/ --save` |
| SCSS @use 重复加载 | Sass 同模块去重，已验证安全 |

---

## 七、执行顺序约束

阶段必须**严格按 A→B→C→D→E→F→G→H→I** 顺序执行：
- B 依赖 A（main.ts 不再引用死代码后再删）
- C 依赖 B（base/types.ts 删除后再重写 index.ts）
- D 依赖 C（布局用 Base/Business 组件）
- E 独立但 F/G 依赖其 mock 数据
- F/G 依赖 D（视图在布局内渲染）
- I 必须最后

每个阶段完成后用 TaskUpdate 标记 completed，再进入下一阶段。
