# 伴学老师后台管理系统 - 收尾实施计划（G4 → H → I）

> 本计划是 9 阶段（A-I）脚手架工程的最后一轮收尾。阶段 A-F0-F 已在前序完成，
> 阶段 G（业务视图 + service）已完成 4/5 视图 + 3 service，仅剩 `course/schedule`。
> 本轮目标：补齐最后 1 个视图 → 编写文档 → 验证收尾，使项目「可编译、可构建、可运行、可维护」。

## 一、Summary 概要

| 阶段 | 内容 | 产物 |
|------|------|------|
| G4 | 排课管理视图 | `src/views/course/schedule/index.vue` |
| H | 项目文档 | `README.md` + `docs/{architecture,conventions,permission,decision-log}.md` |
| I | 验证收尾 | type-check / build / lint:check 通过 |

## 二、Current State Analysis 现状分析（基于 Phase 1 探索）

### 已完成（经 Glob / Read 确认）
- **视图（10/11）**：login、error/404、error/403、redirect、profile、dashboard、teacher/list、teacher/detail、student/list、course/management
- **service（3/3）**：teacher.service.ts、student.service.ts、course.service.ts
- **基础组件**：BasePage / BaseTable / BaseForm / BaseDialog / BaseSearch / BasePagination / BaseButton / BaseIcon / BaseEmpty
- **业务组件**：StatusBadge / DictTag / PageHeader / TeacherSelector
- **composables**：useTable / useForm / useECharts / usePermission / useDict / useDialog / useLoading / useDownload / useTheme
- **stores**：user / permission / app / tagsView
- **router**：index / guards / permission / dynamic / component-map / routes / types
- **api**：auth / user / teacher / student / course / dashboard / dict + types/
- **mocks**：db.ts（含 schedules 数据，日期 2026-07-02、2026-07-03）

### 已确认无需处理
- `src/api/modules/` 空目录已不存在（Glob 返回空），无需清理
- README.md 当前为占位内容（仅 `prompt`），需重写
- `docs/` 目录不存在，需新建

### 关键依赖确认（影响 G4 实现）
- `courseApi.getSchedule(params: { startDate; endDate })` 返回 `ScheduleItem[]`（**非分页**）
- `courseService.fetchSchedule` 直接透传上述方法
- `ScheduleItem` 字段：id / courseId / courseName / teacherName / teacherId / studentName / studentId / date / startTime / endTime / classroom / status
- mock 排课数据日期：2026-07-02（2 条）、2026-07-03（2 条），status 均为 `'scheduled'`
- 视图路径 `course/schedule/index` 与 mock 菜单 `component` 字段一致（component-map 解析无障碍）

## 三、Proposed Changes 拟定变更

### 阶段 G4：排课管理视图

**文件**：`src/views/course/schedule/index.vue`（NEW）

**设计要点**：
- **结构**：`BasePage` + 日期范围选择器（`el-date-picker type="daterange"`）+ `BaseTable`（只读列表，无 actions）
- **数据源**：`courseService.fetchSchedule({ startDate, endDate })`，返回 `ScheduleItem[]`（非分页，故不用 `useTable` / `BasePagination`）
- **默认日期范围**：本周（周一 ~ 周日）。今天为 2026-07-02（周四），本周即 2026-06-29 ~ 2026-07-05，可覆盖 mock 数据日期 07-02/07-03
- **日期处理**：用 `dayjs`（已装依赖）计算本周起止，格式 `YYYY-MM-DD`
- **列定义**（`TableColumn<ScheduleItem>`，无 actions）：
  | prop | label | width | 渲染 |
  |------|-------|-------|------|
  | date | 日期 | 120 | 直接显示 |
  | — | 时间 | 140 | formatter 拼接 `startTime ~ endTime` |
  | courseName | 课程 | — (minWidth 180) | 直接显示 |
  | teacherName | 教师 | 110 | 直接显示 |
  | studentName | 学员 | 110 | 直接显示 |
  | classroom | 教室 | 100 | 直接显示 |
  | status | 状态 | 100 | slot + StatusBadge |
- **状态映射**（statusMapping）：`scheduled → 已排课(success)` / `finished → 已完成(info)` / `cancelled → 已取消(danger)`
- **交互**：日期范围切换后自动查询；轻量只读，不做日历拖拽
- **AutoImport 边界**（遵循既有约定）：`ref / reactive / onMounted` 自动导入；`ElMessage`、`courseService`、类型、`dayjs`、`StatusBadge`、`TableColumn` 类型需显式 import

**伪代码骨架**：
```vue
<script setup lang="ts">
import dayjs from 'dayjs'
import { courseService } from '@/service/course.service'
import type { ScheduleItem } from '@/service/course.service'
import type { TableColumn } from '@/components/Base/BaseTable/types'

defineOptions({ name: 'CourseSchedule' })

const statusMapping = { scheduled: { text: '已排课', type: 'success' }, ... }
const columns: TableColumn<ScheduleItem>[] = [ ... ]  // 7 列，无 actions
const loading = ref(false)
const list = ref<ScheduleItem[]>([])
const dateRange = ref<[string, string]>([本周一, 本周日])

async function fetch() {
  if (!dateRange.value) return
  loading.value = true
  try { list.value = await courseService.fetchSchedule({ startDate: dateRange.value[0], endDate: dateRange.value[1] }) }
  finally { loading.value = false }
}
function onDateChange() { fetch() }
onMounted(fetch)
</script>
```

### 阶段 H：项目文档

#### H1：README.md（重写）
**受众**：新加入项目的开发者。**内容大纲**：
1. 项目简介（伴学老师后台管理系统定位）
2. 技术栈（Vue 3.4 / TS 5 / Vite 5 / Pinia 2 / Vue Router 4 / Element Plus 2.8 / ECharts 5.5 / MSW v2 / Axios）
3. 环境要求（Node ≥ 18）
4. 快速开始：`npm install` → `npm run dev`
5. 登录账号：`admin / 123456`（超管）、`teacher / 123456`（教师，权限受限）
6. npm scripts 说明（dev / build / type-check / lint / lint:check / format / msw:init）
7. 目录结构概览（一级 + 关键二级）
8. Mock 说明（MSW v2，env 开关 `VITE_USE_MOCK`）
9. 文档导航（指向 docs/ 下 4 篇文档）
10. 浏览器兼容性

#### H2：docs/architecture.md
**内容**：
1. 分层架构图：View → Composable → Service → API →（Axios 封装）→ Mock/后端
2. 目录结构详解（src/ 下各目录职责）
3. 三层组件模型：UI库(El) → Base → Business，全局注册机制 + global-components.d.ts 桩
4. 状态管理：Pinia 模块（user/permission/app/tagsView）职责划分
5. 路由体系：constantRoutes + 动态路由（buildRoutesFromMenus + component-map）
6. 请求链路：axios 二次封装（utils/request.ts）→ 统一响应结构 → 错误处理
7. Mock 体系：MSW v2 worker + handlers + db

#### H3：docs/conventions.md
**内容**：
1. 命名规范：文件 kebab-case、组件 PascalCase、composable useXxx、store useXxxStore
2. 目录组织：feature-based，业务模块集中在 views/
3. TypeScript：strict 模式、type-first（API 层定义 Req/Resp 接口）、避免 any
4. AutoImport 边界（关键约定）：
   - 自动导入：vue（ref/reactive/computed/onMounted）、vue-router（useRoute/useRouter）、pinia（defineStore/@vueuse/core）
   - 必须显式 import：ElMessage/ElMessageBox、stores、自定义 composables、Element Plus 图标、API、类型、Base 组件类型
5. 组件开发：Base 组件 generic + defineExpose、Business 组件含业务语义
6. 视图开发：useTable 编排分页、手动弹窗管理（formRef = ref<InstanceType<typeof BaseForm>>()）
7. 提交规范：commitlint conventional（feat/fix/docs/refactor/chore）
8. 代码检查：ESLint + Prettier + vue-tsc，husky + lint-staged

#### H4：docs/permission.md
**内容**：
1. 权限模型：JWT + RBAC 三级
2. 登录流程：login → token → fetchUserInfo（roles/permissions/dataScopes）→ generateRoutes
3. 路由级权限：动态路由（buildRoutesFromMenus 过滤 permissions）+ guards 守卫
4. 按钮级权限：`v-permission` 指令 + `hasPerm` composable，BaseTable actions 自动 perm 过滤
5. 数据级权限：dataScopes（all/self），预留扩展
6. **通配符规则**（F0 修复核心）：
   - 超管：`*` 或 `*:*:*` 全量放行
   - 段通配：`teacher:*` 匹配 `teacher:audit` 等
   - 精确匹配：`teacher:list`
7. 如何新增权限：后端菜单配 permissions → 前端 v-permission="'xxx:yyy'" → 权限码集中在角色配置
8. 两个账号权限差异表（admin 全量 vs teacher 受限 6 个权限码）

#### H5：docs/decision-log.md
**内容**（记录关键架构决策与理由）：
1. 为何选 MSW v2（vs mockjs）：Service Worker 拦截真实网络请求，不污染 axios，可平滑切换后端
2. 为何 Element Plus 全量注册（vs 按需）：后台系统组件密度高，全量注册开发效率优先，unplugin-vue-components 补充类型
3. 为何 AutoImport 仅覆盖 vue/router/pinia/@vueuse：避免过度隐式导入降低可读性，ElMessage/组件/类型保持显式
4. 为何手动弹窗管理（vs useForm composable）：全局组件 stub 类型不含 expose，显式 import BaseForm 获得真实类型 + 控制力更强
5. 为何 ECharts 按需注册（useECharts 用 echarts/core）：减小打包体积，调用方按需 echarts.use
6. 为何 service 层存在：View → Service → API 单向依赖，service 可承载编排逻辑（如 save 分流 create/update），便于 mock→后端切换
7. 为何权限通配符支持 `*:*:*`：兼容 RuoYi 风格后端超管标识
8. 为何三层组件模型：复用与业务解耦，Base 不含业务、Business 含业务语义、View 编排

### 阶段 I：验证收尾

按以下顺序执行（每步通过再进下一步）：

1. **类型检查**：`npm run type-check`（vue-tsc --noEmit）
   - 预期可能问题：新建 schedule 视图的类型摩擦、global-components stub 与 BaseForm expose 的已知妥协
   - 处理原则：优先修真实类型错误；对全局组件 stub 的固有摩擦用类型断言（已在既有代码中采用的策略）
2. **构建**：`npm run build`（vue-tsc + vite build）
   - 验证产物 `dist/` 生成、无构建错误
3. **Lint 检查**：`npm run lint:check`（eslint .）
   - 修复 lint 报错（不自动 fix，先人工核对）；如需批量可 `npm run lint`
4. **冒烟（可选）**：`npm run dev` 启动开发服务器
   - 验证 MSW worker 正常启用、登录可用、admin/teacher 权限差异符合预期（admin 看到全部菜单，teacher 仅看到授权菜单）
   - 注：若环境不支持长时间运行 dev server，则以前 3 步通过为准

## 四、Assumptions & Decisions 假设与决策

| # | 决策 | 理由 |
|---|------|------|
| 1 | schedule 视图用 `BaseTable` 而非裸 `el-table` | 与系统其他列表视图保持一致，复用 loading/字典/slot 能力 |
| 2 | schedule 不用 `useTable`/`BasePagination` | `getSchedule` 返回数组非分页，强套 useTable 反而别扭 |
| 3 | 默认日期范围取「本周」 | 自然覆盖 mock 数据日期（07-02/07-03 在本周），且符合真实业务直觉 |
| 4 | schedule 为只读列表 | 计划明确「不强制做日历拖拽」，保持轻量；增删排课 API 已存在但本轮不接 UI |
| 5 | 文档语言为中文 | 用户沟通语言为中文，团队为中文团队 |
| 6 | 不再调用 NotifyUser 二次确认 | 计划批准后直接执行，遵循 system-reminder 约束 |
| 7 | 验证以 type-check/build/lint:check 三步为准 | dev 冒烟为可选，环境受限时不阻塞收尾 |

## 五、Verification 验证步骤

1. `course/schedule/index.vue` 创建后，`npm run type-check` 无新增错误
2. 文档 5 个文件创建后，目录 `docs/` 存在且 README 非占位
3. `npm run build` 成功生成 `dist/`
4. `npm run lint:check` 通过（或仅剩既有、可接受的风格警告）
5. （可选）`npm run dev` 后 admin 登录可见「排课管理」菜单并展示 4 条 mock 数据

## 六、执行顺序

1. 创建 `src/views/course/schedule/index.vue` → 标记 G 完成
2. 创建 `README.md` + `docs/{architecture,conventions,permission,decision-log}.md` → 标记 H 完成
3. 依次运行 type-check → build → lint:check → 标记 I 完成
4. 返回最终响应（含验证结果摘要 + 账号信息 + 后续可演进方向）
