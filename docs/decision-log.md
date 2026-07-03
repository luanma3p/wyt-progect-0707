# 决策记录（Decision Log）

> 本文档记录项目关键架构决策的背景、备选方案与选择理由，作为后续演进的参考依据。

## 1. 为何选 MSW v2（vs mockjs）

**背景**：项目需要前端独立开发的 Mock 方案，支持后续平滑切换到真实后端。

**备选**：

- **mockjs**：通过拦截 XMLHttpRequest 改写响应，流行但侵入性强
- **MSW v2**（Mock Service Worker）：基于 Service Worker 在网络层拦截请求

**选择 MSW v2 的理由**：

- **不污染 axios**：MSW 在浏览器网络层拦截，axios 完全无感知，请求代码与生产一致
- **真实 HTTP 语义**：保留 request/response 全流程，headers、status code、延迟均可模拟
- **平滑切换**：关闭 `VITE_USE_MOCK` 即走真实后端，零代码改动
- **类型友好**：handler 用 TypeScript 编写，与 API 层类型一致
- **v2 API 更规范**：采用标准 `Request`/`Response` 对象，符合 Fetch 规范

**代价**：需生成 `mockServiceWorker.js`（`npm run msw:init`），开发环境依赖 Service Worker。

## 2. 为何 Element Plus 全量注册（vs 按需）

**背景**：后台管理系统 UI 组件密度高，需权衡开发效率与打包体积。

**备选**：

- **全量注册**（`app.use(ElementPlus)`）：所有 `El*` 组件 + 指令全局可用
- **按需引入**（unplugin-vue-components + resolver）：仅打包用到的组件

**选择全量注册的理由**：

- **开发效率优先**：后台系统大量使用 El 组件，全量注册避免反复 import，模板中直接用
- **指令可用**：`v-loading`、`v-infinite-scroll` 等指令在按需模式下需额外配置，全量注册开箱即用
- **类型补全**：`unplugin-vue-components` 仍生成 `components.d.ts` 提供类型，IDE 体验不降级
- **体积可控**：Vite 构建会 tree-shake 未使用的 JS，实际增量主要在 CSS（可接受）

**代价**：打包体积略大于严格按需，但后台系统对首屏体积敏感度低于 C 端。

## 3. 为何 AutoImport 仅覆盖 vue/router/pinia/@vueuse

**背景**：`unplugin-auto-import` 可自动导入大量 API，但过度隐式会降低代码可读性。

**选择「窄覆盖」的理由**：

- **可读性**：`ref` / `computed` / `useRoute` 等 Vue 核心 API 高频且语义明确，自动导入减少噪音
- **显式优先**：`ElMessage`、stores、composables、API、类型等业务符号若隐式出现，新开发者难以追溯来源
- **避免歧义**：显式 `import { ElMessage } from 'element-plus'` 让依赖关系一目了然
- **降低心智负担**：明确的边界比「全自动」更易维护（详见 [编码规范 · AutoImport 边界](conventions.md#四-autoimport-边界关键约定)）

**代价**：部分 import 语句略显啰嗦，但换来可追溯性。

## 4. 为何手动弹窗管理（vs useForm composable）

**背景**：表单弹窗是后台系统高频场景，需在「封装度」与「类型安全」间权衡。

**备选**：

- **useForm composable**：封装 formRef / visible / loading / submit，统一弹窗逻辑
- **手动管理**：视图中 `ref<InstanceType<typeof BaseForm>>()` + 手动 visible/loading

**选手动管理的理由**：

- **类型安全**：`BaseForm` 通过 `defineExpose` 暴露 `validate` 等方法，但全局组件的 `DefineComponent` stub 类型不含 expose；显式 `import BaseForm from '@/components/Base/BaseForm/index.vue'` + `InstanceType<typeof BaseForm>` 可获得真实 expose 类型
- **控制力**：弹窗的 mode（create/edit）、数据回填、提交后回调等差异较大，手动管理更灵活
- **避免过度抽象**：useForm 试图统一异构场景，反而引入配置复杂度

**现状**：`useForm` composable 仍保留在 `src/composables/`，供简单场景选用；复杂表单弹窗推荐手动管理。

## 5. 为何 ECharts 按需注册（useECharts 用 echarts/core）

**背景**：ECharts 全量引入约 1MB+，需控制打包体积。

**选择按需注册的理由**：

- **体积优化**：`useECharts` 基于 `echarts/core`，仅 import 用到的图表/组件/渲染器
- **调用方明确**：各视图自行 `echarts.use([LineChart, PieChart, GridComponent, ...])`，按需且可见
- **tree-shake 友好**：未 use 的模块不会打包

**代价**：调用方需手动注册所需组件，略有模板代码（但可接受，因图表视图数量有限）。

## 6. 为何引入 Service 层

**背景**：View 直接调 API 也可工作，是否需要中间 Service 层？

**选择引入 Service 层的理由**：

- **编排逻辑归属**：如 `courseService.save` 按 `id` 是否存在分流 create/update，这类逻辑放 View 会重复，放 API 层会污染纯请求定义
- **Mock→后端切换**：Service 层是切换点，API 层变更时只需调整 Service 透传，View 无感
- **单向依赖清晰**：View → Service → API，依赖方向明确，便于测试与替换
- **聚合能力**：Service 可聚合多个 API（如 `fetchDetail` 同时拉详情 + 跟进记录）

**代价**：多一层薄封装，但换来可维护性与可测试性。

## 7. 为何权限通配符支持 `*:*:*`

**背景**：超管权限标识在不同后端框架中不统一。

**选择兼容 `*` 与 `*:*:*` 的理由**：

- **`*`**：通用超管标识，语义直观
- **`*:*:*`**：RuoYi 风格后端的超管标识（三段式），国内后台系统常见
- **段通配 `模块:*`**：支持「模块管理员」角色（如 `teacher:*` 管理教师模块全部操作）

**实现**：`SUPER_WILDCARDS = new Set(['*', '*:*:*'])`，`hasPermission` 短路判断；段通配用 `endsWith(':*')` + `startsWith` 匹配（详见 [权限设计 · 通配符规则](permission.md#六-通配符规则核心)）。

## 8. 为何三层组件模型（UI库 → Base → Business）

**背景**：组件复用与业务解耦的平衡。

**选择三层模型的理由**：

- **UI 库（Element Plus）**：提供原子组件，无业务
- **Base 层**：封装交互模式（如配置式表单、分页表格），不含业务，可跨项目复用
- **Business 层**：组合 Base + 业务语义（如 StatusBadge 接收状态码 + 映射），含业务但无页面编排
- **View 层**：页面编排，组合 Business + Base + composable

**收益**：

- 复用粒度清晰：Base 跨业务，Business 跨页面，View 单页面
- 变更隔离：业务变化止于 Business/View，Base 稳定
- 类型传导：Base 泛型（`BaseTable<T>`）让类型从 View 流入组件

## 9. 为何 package.json 中 @rushstack/eslint-patch 曾写错包名

**背景**：项目初始化时 `package.json` 误写为 `@rush-stack/eslint-patch`（带连字符），导致 `npm install` 报 404。

**根因**：npm registry 上真实包名为 `@rushstack/eslint-patch`（无连字符，`rushstack` 连写），易与 `@rush-stack/*` 系列其他包混淆。

**修复**：统一修正 `package.json` 与 `.eslintrc.cjs` 中的包名为 `@rushstack/eslint-patch`，版本升至 `^1.16.1`。

**教训**：scoped 包名（`@scope/name`）的 scope 部分需严格核对 registry，连字符差异会导致 404 而非明显的拼写错误。
