# 伴学老师后台管理系统 — 脚手架收尾实施计划（阶段 F–I + 关键修复）

> 本计划是 [banxue-scaffold-final-implementation.md](./banxue-scaffold-final-implementation.md) 的延续与收尾。
> **阶段 A–E 已完成并经磁盘验证**（见下方「当前状态分析」）。本计划只覆盖**剩余工作**：一项阻塞性权限 Bug 修复 + 阶段 F/G/H/I。
> 执行者无需再做任何架构选择，按顺序实施即可。所有文件路径、API 签名、组件 props 均基于实际磁盘代码核对。

---

## 一、Summary（总览）

完成「伴学老师后台管理系统」脚手架的最后收尾，使其**可编译、可构建、可运行、可维护**。

剩余工作分 5 步：
- **F0（阻塞修复）** 修复 `hasPermission` 通配符不识别 `*:*:*` 的 Bug —— 否则 admin 登录后看不到任何菜单/路由/按钮
- **F** 基础视图（login / error{403,404} / profile / redirect / dashboard）—— 6 个文件
- **G** 业务视图 + service 层（teacher / student / course）—— 3 个 service + 5 个视图
- **H** 文档（README + docs/）—— 5 个文件
- **I** 验证收尾（生成 d.ts → type-check → build → dev 联调 → lint）

**技术栈基线**：Vue 3.4 + TS 5.5（strict）+ Vite 5.4 + Pinia 2.2 + Vue Router 4.4 + Element Plus 2.8 + ECharts 5.5 + Axios + MSW v2。

---

## 二、Current State Analysis（当前状态分析）

### 2.1 阶段 A–E 已完成（保留不动，仅记录）

经 Explore agent 逐文件核对，以下均已存在且内容有效：

| 阶段 | 关键产物 | 状态 |
|---|---|---|
| A | `src/main.ts`（setupStore→router→setupPlugins→条件 setupMock→mount）、`plugins/element-plus.ts`（含 `app.use(ElementPlus)`）、`composables/useForm.ts`（validate 返回 `Promise<boolean> \| undefined`）、3 个 scss partial（含 `@use variables`）、`composables/index.ts`（全导出）、`components/Base/index.ts`、`env.d.ts`、删除 `.prettierrc.json` | ✅ |
| B | 删除 `router/{guard,routes.static,helper}.ts`、`api/modules/*`、`api/mock.ts`、`api/types/system.ts`、`types/{shims-vue,router}.d.ts`、`utils/types.ts`、`components/base/types.ts` | ✅（仅遗留空目录 `src/api/modules/`，I 阶段清理） |
| C | `components/Base/`（9 组件）+ `components/Business/`（4 组件）+ `components/index.ts`（setupGlobalComponents）+ `types/global-components.d.ts`；小写 `base/` 已不存在 | ✅ |
| D | `layouts/default/`（index + Sidebar/SidebarItem/Navbar/TagsView/Breadcrumb/AppMain）+ `layouts/blank/` | ✅ |
| E | `public/mockServiceWorker.js` + `mocks/{browser,index,db}.ts` + `mocks/handlers/{index,auth,user,teacher,student,course,dashboard,dict}.ts` + `assets/icons/{user,people,reading}.svg` | ✅ |

### 2.2 阻塞性 Bug（必须最先修复）

**文件**：`src/utils/permission.ts:4-10`

```ts
export function hasPermission(required: string | string[], owned: string[]): boolean {
  if (!owned.length) return false
  const requiredList = Array.isArray(required) ? required : [required]
  // 拥有通配符 * 视为超管
  if (owned.includes('*')) return true   // ← 只认单星号
  return requiredList.some((code) => owned.includes(code))
}
```

**问题**：mock admin 用户（`src/mocks/db.ts:49`）的 permissions 为 `['*:*:*']`（RuoYi 风格超管标识），但 `hasPermission` 只识别单星号 `'*'`。

**影响范围（全部链路）**：
- `router/dynamic.ts:81` `hasMenuAccess` → admin 所有菜单被拒 → **动态路由为空，侧边栏无菜单**
- `stores/modules/permission.ts:72` `filterMenuTree` → 同上
- `stores/modules/permission.ts:45` `checkPermission` → v-permission 指令全部失效
- `router/permission.ts:9` `checkRoutePermission` → 路由级校验失效

**结论**：不修复则 admin 登录后系统不可用。这是 F0 必须最先处理。

### 2.3 视图层完全缺失

`src/views/` 目录为空。路由（`router/routes.ts`）与动态路由（`router/component-map.ts` 解析 mock 菜单 `component` 字段）引用的 11 个视图全部需新建。

**路由引用清单（来自 `routes.ts` constantRoutes + `component-map.ts` + `mocks/db.ts` 菜单）**：

| 路由来源 | component 字段 / 引用路径 | 物理文件 |
|---|---|---|
| constantRoutes | `@/views/login/index.vue` | `src/views/login/index.vue` |
| constantRoutes | `@/views/error/403.vue` | `src/views/error/403.vue` |
| constantRoutes | `@/views/error/404.vue` | `src/views/error/404.vue` |
| constantRoutes | `@/views/redirect/index.vue` | `src/views/redirect/index.vue` |
| constantRoutes | `@/views/dashboard/index.vue` | `src/views/dashboard/index.vue` |
| constantRoutes | `@/views/profile/index.vue` | `src/views/profile/index.vue` |
| mock 菜单 `/teacher/list` | `teacher/list/index` | `src/views/teacher/list/index.vue` |
| mock 菜单 `/teacher/detail/:id` | `teacher/detail/index` | `src/views/teacher/detail/index.vue` |
| mock 菜单 `/student/list` | `student/list/index` | `src/views/student/list/index.vue` |
| mock 菜单 `/course/management` | `course/management/index` | `src/views/course/management/index.vue` |
| mock 菜单 `/course/schedule` | `course/schedule/index` | `src/views/course/schedule/index.vue` |

> **关键约束**：视图文件路径必须与 mock 菜单 `component` 字段**完全一致**，否则 `component-map.ts:14` 的 `/src/views/${component}.vue` 匹配失败，回退到 404。

### 2.4 已确认的 API / 组件 / composable 签名（用于 G 阶段落地）

**API 层**（`src/api/*.ts`，均用 `http` 命名导入）：
- `teacherApi`: `getList(params: TeacherListReq)`、`getDetail(id)`、`audit(data: AuditTeacherReq)`、`toggleStatus(id, status)`
- `studentApi`: `getList(params: StudentListReq)`、`getFollowRecords(studentId)`、`addFollow(data: AddFollowReq)`
- `courseApi`: `getList(params)`、`create(data: CourseForm)`、`update(id, data)`、`remove(id)`、`getSchedule(params)`、`addSchedule(data)`、`removeSchedule(id)`
- `dashboardApi`: `getOverview()`

**Composable 签名**（已读源码确认）：
- `useTable<T, Q>(apiFn, options)` → `{ loading, list, total, page{pageNum,pageSize}, query, search, reset, reload, onPageChange, onSizeChange }`；`apiFn` 签名为 `(params: Q) => Promise<PageResult<T>>`
- `useForm<T>(apiFn, options)` → `{ formRef, form, loading, visible, mode, isView, open({mode,data}), close(), submit() }`；`formRef` 需绑定到 BaseForm 的 expose
- `useECharts(el, option)` → `{ chart, loading, render, resize }`；**注意**：使用 `echarts/core`，调用方必须自行注册图表组件（LineChart/PieChart + Grid/Tooltip/Legend + CanvasRenderer）
- `usePermission()` → `{ hasPerm, hasRole, hasDataScope, permissions, roles, dataScopes }`
- `useDict()` → 用于 DictTag

**Base 组件 props**（已读 types.ts 确认）：
- `BaseTable`: `columns: TableColumn[]`、`data`、`loading`、`stripe`、`border`、`rowKey`。`TableColumn` 含 `prop/label/width/minWidth/fixed/align/slot/dict/formatter/actions/type`；`actions: TableAction[]` 含 `label/perm/danger/disabled/show/onClick/confirm`
- `BaseForm`: `fields: FormField[]`、`modelValue`、`labelWidth`、`disabled`。`FormField` 含 `prop/label/type/placeholder/defaultValue/options/required/rules/span/disabled/visibleIf`；`type` 枚举：input/textarea/number/select/date/daterange/switch/radio/checkbox/cascader/slot
- `BaseSearch`、`BaseDialog`、`BasePagination`、`BaseButton`、`BasePage`、`BaseEmpty`、`BaseIcon` 已就绪
- `Business/DictTag`（props: code/value）、`StatusBadge`（props: status/mapping）、`PageHeader`、`TeacherSelector` 已就绪

**userStore**（`stores/modules/user.ts`）：`login(payload: LoginReq)`、`fetchUserInfo()`、`logout()`、`resetToken()`；state: `token/userInfo/roles/permissions/dataScopes`

**权限工具修复后的行为**：`hasPermission('teacher:audit', ['*:*:*'])` → true（超管）；`hasPermission('teacher:audit', ['teacher:list'])` → false

### 2.5 已确认的脚本与依赖

`package.json` scripts：`dev`、`build`（`vue-tsc --noEmit && vite build`）、`type-check`、`lint`、`lint:check`、`format`、`msw:init`。ECharts 5.5、dayjs、lodash-es、@vueuse/core 均已装。

### 2.6 文档现状

`README.md` 仅含占位符 `# wyt-progect-0707\nprompt`，需重写。`docs/` 目录不存在，需新建。

---

## 三、Assumptions & Decisions（假设与决策）

| # | 决策 | 理由 |
|---|---|---|
| D1 | **F0 修复 `hasPermission` 支持 `*` 与 `*:*:*` 双通配符**，并兼容 `module:*` 段通配 | mock 用 `*:*:*`（RuoYi 惯例），utils 只认 `*` 是 Bug；同时支持段通配可覆盖未来 `teacher:*` 这类标识，零副作用 |
| D2 | **service 层薄封装**：teacher/student/course 各一 service.ts，封装 API 调用 + Entity↔DTO 转换，composable/view 调 service | 分层单向依赖 View→Composable→Service→API，长期可维护 |
| D3 | **dashboard 归入 F 阶段**（而非 G） | dashboard 在 constantRoutes 中（非动态路由），且是登录后首页，F 阶段先建可让基础流程跑通；G 阶段专注 teacher/student/course |
| D4 | **dashboard 图表按需注册**：在 dashboard 视图内 `echarts/core` 注册 LineChart/PieChart/GridComponent/TooltipComponent/LegendComponent/CanvasRenderer | useECharts 只提供容器与生命周期，组件注册由调用方负责（源码注释明确） |
| D5 | **业务视图统一模式**：BasePage + BaseSearch + BaseTable + BaseDialog+BaseForm，用 useTable/useForm 编排 | 复用已建组件，保证四个业务模块交互一致 |
| D6 | **审核/停用用 v-permission 指令演示按钮级权限**：`v-permission="'teacher:audit'"`、`v-permission="'teacher:disable'"` | 验证三级权限中的按钮级；admin（`*:*:*`）可见，teacher 账号不可见 |
| D7 | **profile 修改密码为 mock 交互**（前端提示成功，不调真实接口） | 无对应 mock handler，避免增加 mock 复杂度；演示表单即可 |
| D8 | **redirect 视图**用 `onBeforeMount` + `router.replace(to.fullPath)` 实现刷新当前页（配合 keep-alive） | 标准做法，AppMain 已有 keep-alive + cachedViews |
| D9 | **首次验证顺序**：先 `npx vite build` 生成 `auto-imports.d.ts`/`components.d.ts` → 再 `npm run type-check` → `npm run build` → `npm run dev` 联调 → `npm run lint:check` | 解决 AutoImport d.ts 鸡蛋问题 |
| D10 | **清理遗留空目录 `src/api/modules/`** | I 阶段收尾时一并删除 |

---

## 四、Proposed Changes（分步实施）

### 阶段 F0：修复权限通配符（阻塞，最先做）

**文件**：`src/utils/permission.ts`

**修改 `hasPermission`**：识别超管通配 `*` 与 `*:*:*`，并支持段通配（如 `teacher:*` 匹配 `teacher:audit`）。

```ts
const SUPER_WILDCARDS = new Set(['*', '*:*:*'])

/** 是否是超管通配标识 */
function isSuperAdmin(owned: string[]): boolean {
  return owned.some((p) => SUPER_WILDCARDS.has(p))
}

/** 单个权限码是否被拥有的权限覆盖（含段通配 teacher:*） */
function codeMatches(code: string, owned: string[]): boolean {
  return owned.some((p) => {
    if (p === code) return true
    // 段通配：teacher:* 匹配 teacher:audit
    if (p.endsWith(':*')) {
      const prefix = p.slice(0, -1) // 'teacher:'
      return code.startsWith(prefix)
    }
    return false
  })
}

export function hasPermission(required: string | string[], owned: string[]): boolean {
  if (!owned.length) return false
  if (isSuperAdmin(owned)) return true
  const requiredList = Array.isArray(required) ? required : [required]
  return requiredList.some((code) => codeMatches(code, owned))
}
```

**验证点**：`hasPermission('teacher:audit', ['*:*:*'])` → true；`hasPermission(['teacher:list'], ['teacher:list','student:list'])` → true；`hasPermission('teacher:audit', ['teacher:list'])` → false。

---

### 阶段 F：基础视图（6 个文件）

#### F1. `src/views/login/index.vue`
- **职责**：登录表单 + 登录逻辑
- **实现**：
  - 原生 `el-form`（用户名/密码/记住我），不强制用 BaseForm（登录表单样式特殊）
  - 调 `userStore.login({ username, password })` → 成功后 `router.replace(redirect || '/')`
  - 默认填充 `admin / 123456` 便于演示（`VITE_USE_MOCK` 时）
  - 失败用 `ElMessage.error` 提示
  - 品牌 logo + 标题「伴学老师后台管理系统」
- **关键依赖**：`useUserStore`、`useRoute`/`useRouter`（AutoImport 提供）、`ElMessage`、el-form/el-input/el-button/el-checkbox（EP 全量已注册）

#### F2. `src/views/error/404.vue` 与 `src/views/error/403.vue`
- **职责**：错误页
- **实现**：居中布局，`el-result`（EP 组件）展示图标/标题/描述 + 「返回首页」按钮（`router.push('/')`）
  - 404：`icon="warning"`，标题「404」，描述「页面不存在」
  - 403：`icon="locked"`，标题「403」，描述「抱歉，您没有权限访问该页面」

#### F3. `src/views/profile/index.vue`
- **职责**：个人中心
- **实现**：
  - 上半：用户信息卡（`el-card` + `el-descriptions`）展示 nickname/username/email/phone/deptName/roles
  - 下半：修改密码表单（`el-form`：旧密码/新密码/确认密码 + 校验），提交时 mock 提示成功（D7）
  - 数据来自 `userStore.userInfo`
- **关键依赖**：`useUserStore`、el-card/el-descriptions/el-form/el-input/el-button

#### F4. `src/views/redirect/index.vue`
- **职责**：配合 keep-alive 刷新当前页
- **实现**（D8）：
```vue
<script setup lang="ts">
const route = useRoute()
const router = useRouter()
onBeforeMount(() => {
  router.replace(route.fullPath)
})
</script>
<template>
  <div />
</template>
```

#### F5. `src/views/dashboard/index.vue`（D3，归入 F）
- **职责**：数据看板首页
- **实现**：
  - 4 个统计卡片（`el-row` + `el-col` + `el-card`）：教师/学员/课程总数 + 待审核数，用 `dashboardApi.getOverview()` 取 `stat`
  - 教师增长趋势折线图：`useECharts` + 按需注册（D4）
    ```ts
    import * as echarts from 'echarts/core'
    import { LineChart, PieChart } from 'echarts/charts'
    import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
    import { CanvasRenderer } from 'echarts/renderers'
    echarts.use([LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent, CanvasRenderer])
    ```
  - 课程分布饼图：同上 option
  - 最近审核列表：`el-table` 渲染 `recentAudits`（teacherName/status/auditor/auditedAt），状态用 `StatusBadge`
  - 用 `BasePage` 包裹整体
- **关键依赖**：`dashboardApi`、`useECharts`、`BasePage`、`StatusBadge`、el-row/el-col/el-card/el-table

**F 阶段验证点**：路由可解析；登录后跳 dashboard；dashboard 卡片与图表渲染。

---

### 阶段 G：业务视图 + service 层（3 service + 5 视图）

#### G1. service 层（薄封装，D2）

**`src/service/teacher.service.ts`**
```ts
import { teacherApi } from '@/api/teacher'
import type { TeacherListReq, TeacherListItem, TeacherDetailResp, AuditTeacherReq } from '@/api/types/teacher'

export const teacherService = {
  fetchList: (params: TeacherListReq) => teacherApi.getList(params),
  fetchDetail: (id: string) => teacherApi.getDetail(id),
  audit: (data: AuditTeacherReq) => teacherApi.audit(data),
  toggleStatus: (id: string, status: string) => teacherApi.toggleStatus(id, status),
}
// 类型再导出，供 view 使用
export type { TeacherListItem, TeacherDetailResp, TeacherListReq }
```

**`src/service/student.service.ts`**：`fetchList`/`fetchFollows`/`addFollow` + 类型再导出
**`src/service/course.service.ts`**：`fetchList`/`save`(create|update)/`remove`/`fetchSchedule` + 类型再导出

> service 当前直透 API（无 DTO 转换需求），但保留分层以便后续扩展（如字段映射、枚举转换）。

#### G2. 教师管理

**`src/views/teacher/list/index.vue`**
- **结构**：`BasePage`（title「教师管理」）+ `BaseSearch`（keyword/status）+ `BaseTable` + 审核 `BaseDialog`+`BaseForm`
- **编排**：
  - `useTable<TeacherListItem, TeacherListReq>(teacherService.fetchList, { defaultPageSize: 10 })`
  - `useForm(teacherService.audit, { successMsg: '审核已提交' })` —— 审核弹窗
- **表格列**：头像+姓名（slot）、手机、性别、学科、状态（`StatusBadge` mapping teacher_status）、评分、学员数、操作列
- **操作列**（用 `actions` 配置 + `v-permission` 演示 D6）：
  - 「详情」→ `router.push('/teacher/detail/' + row.id)`
  - 「审核」→ `v-permission="'teacher:audit'"`，仅 pending 显示，打开审核弹窗（approve/reject + remark）
  - 「停用/启用」→ `v-permission="'teacher:disable'"`，调用 `toggleStatus`
- **审核弹窗**：BaseForm fields = [action(radio: approve/reject), remark(textarea)]，submit 调 `useForm.submit`

**`src/views/teacher/detail/index.vue`**
- **结构**：`BasePage` + 返回按钮 + `el-card` 基本信息 + `el-table` 资质列表 + `el-timeline` 跟进记录
- **数据**：`teacherService.fetchDetail(route.params.id)`，onMounted 加载
- **展示**：`el-descriptions` 基本信息；资质表格（name/type/status/auditor）；跟进时间线（content/operator/createdAt）

#### G3. 学员管理

**`src/views/student/list/index.vue`**
- **结构**：`BasePage` + `BaseSearch`（keyword/grade）+ `BaseTable` + 跟进 `BaseDialog`
- **编排**：`useTable<StudentListItem, StudentListReq>(studentService.fetchList)`
- **列**：姓名、年级、电话、授课教师、课程数、总课时、最近跟进、状态、操作
- **操作**：「跟进」→ 打开弹窗，弹窗内 `el-timeline` 展示 `getFollowRecords` + 表单新增跟进（type/content）调 `addFollow`

#### G4. 课程/排课

**`src/views/course/management/index.vue`**
- **结构**：`BasePage` + `BaseSearch`（keyword/subject/status）+ `BaseTable` + CRUD `BaseDialog`+`BaseForm`
- **编排**：
  - `useTable<CourseListItem, CourseListReq>(courseService.fetchList)`
  - `useForm<CourseForm>(handleSubmit, { successMsg: '保存成功' })`，`handleSubmit` 根据 mode 调 create/update
- **列**：课程名、学科、年级、授课教师、课时、价格、状态（`StatusBadge` course_status）、学员数、操作
- **操作**：编辑（打开弹窗回填）、删除（`ElMessageBox.confirm` → remove），「新增」按钮在工具栏
- **表单 fields**：name(input)、subject(select)、grade(select)、teacherId(select，可用 TeacherSelector)、totalHours(number)、price(number)、intro(textarea)

**`src/views/course/schedule/index.vue`**
- **结构**：`BasePage` + 日期范围选择 + 排课列表（`el-table` 或简易网格）
- **数据**：`courseService.fetchSchedule({ startDate, endDate })`，默认本周
- **列**：日期、时间、课程、教师、学员、教室、状态
- 交互保持轻量（只读列表 + 日期切换），不强制做日历拖拽

#### G5. 验证点
各页面可加载、分页/搜索/弹窗可用、图表渲染、v-permission 在 admin/teacher 两账号下表现不同。

---

### 阶段 H：文档（5 个文件）

#### H1. `README.md`（重写）
- 项目简介 + 技术栈 + 功能模块
- 快速开始：`npm install` → `npm run dev` → 用 admin/123456 登录
- 可用脚本说明（dev/build/type-check/lint/format）
- 目录结构概览
- 文档索引（指向 docs/）

#### H2. `docs/architecture.md`
- 分层架构：View → Composable → Service → API → Store
- 各层职责与依赖方向
- 目录组织约定

#### H3. `docs/conventions.md`
- 命名（组件 PascalCase、composable use 前缀、API camelCase、类型 Resp/Req 后缀）
- 目录（views 按模块、components 分 Base/Business）
- 类型（API 类型在 api/types，业务实体在 types/entity）
- composable / 组件 / API 约定

#### H4. `docs/permission.md`
- JWT + RBAC 三级权限：路由级（meta+守卫）、按钮级（v-permission）、数据级（usePermission + dataScopes）
- 超管通配符 `*:*:*` 与段通配 `teacher:*` 规则
- 动态路由生成流程（fetchUserInfo → getMenus → buildRoutesFromMenus → addRoute）

#### H5. `docs/decision-log.md`（ADR 风格）
- 记录关键决策：Element Plus 全量注册、MSW 方案、service 薄封装、权限通配符规则、AutoImport dts 桩等

**验证点**：文档与代码一致，无失效引用。

---

### 阶段 I：验证收尾

#### I1. 清理遗留
- 删除空目录 `src/api/modules/`（D10）

#### I2. 生成 d.ts（解决鸡蛋问题，D9）
- `npx vite build`（让 AutoImport/Components 生成/刷新 `auto-imports.d.ts`、`components.d.ts`）

#### I3. 类型检查
- `npm run type-check`（vue-tsc --noEmit）通过；若有全局组件缺失声明，补 `global-components.d.ts`

#### I4. 构建
- `npm run build` 通过，产出 dist/

#### I5. 开发联调
- `npm run dev`，验证完整流程：
  1. admin/123456 登录 → 跳 dashboard
  2. 侧边栏显示「教师管理/学员管理/课程管理」+ 固定「数据看板」
  3. dashboard 卡片 + 折线图 + 饼图 + 审核列表渲染
  4. 教师列表分页/搜索/审核弹窗/详情页
  5. 学员列表 + 跟进弹窗
  6. 课程管理 CRUD + 排课列表
  7. 个人中心 + 修改密码 mock
  8. 登出 → 回登录页
  9. 切 teacher/123456 账号 → 看不到审核/停用按钮（v-permission 生效）

#### I6. Lint
- `npm run lint:check` 通过；如有问题 `npm run lint` 修复

**整体验证标准**：四项命令全绿；核心流程跑通；两账号权限差异可见。

---

## 五、Verification（整体验证标准）

1. **可编译**：`npm run type-check` 零错误
2. **可构建**：`npm run build` 产出 dist/
3. **可运行**：`npm run dev` 启动，admin/123456 登录成功，完整后台界面可用
4. **可维护**：文档齐全（README + docs/），分层清晰，类型安全
5. **权限可用**：登录后动态路由注入；admin 见全部按钮；teacher 账号按钮级权限差异可见
6. **无死代码**：`src/api/modules/` 空目录已清理

---

## 六、风险与缓解

| 风险 | 缓解 |
|---|---|
| `hasPermission` 修改影响既有调用 | 新逻辑对单星号 `*` 与精确匹配行为不变，仅**扩展**识别 `*:*:*` 与段通配，向后兼容 |
| dashboard ECharts 组件未注册导致空白 | G5/D4 明确按需注册清单，在 dashboard 视图内 echarts.use |
| 视图路径与 mock 菜单 component 不匹配 → 404 | 已核对 11 个路径完全一致（见 2.3 表） |
| AutoImport 首次 d.ts 不全导致 vue-tsc 报错 | I2 先跑 vite build 生成 d.ts 再 type-check |
| BaseForm expose 与 useForm.formRef 类型对齐 | useForm 的 FormExpose 已放宽 validate 返回类型（阶段 A 已修） |

---

## 七、执行顺序约束

**F0 → F → G → H → I**，严格顺序：
- F0 必须最先（否则后续联调 admin 看不到菜单）
- F 优先于 G（dashboard 是首页；G 的业务页依赖 F 验证过的布局/路由）
- H 可与 G 末尾并行，但为简洁按序执行
- I 必须最后（依赖所有代码就位）

每步完成后用 TaskUpdate 标记 completed，再进入下一步。
