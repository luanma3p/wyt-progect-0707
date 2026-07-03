# 架构设计

> 本文档描述「伴学老师后台管理系统」的整体架构、分层职责与核心机制。

## 一、分层架构

系统采用**单向依赖的分层架构**，数据自上而下流动，下层不感知上层：

```
┌─────────────────────────────────────────────────────┐
│  View（视图层）                                       │
│  views/**/*.vue — 页面编排，消费 composable + 组件     │
├─────────────────────────────────────────────────────┤
│  Composable（组合式层）                               │
│  useTable / useForm / useECharts / usePermission ... │
│  封装可复用的响应式逻辑                                │
├─────────────────────────────────────────────────────┤
│  Service（服务层）                                    │
│  *.service.ts — 封装 API 调用，承载编排（如 save 分流） │
├─────────────────────────────────────────────────────┤
│  API（接口层）                                        │
│  api/*.ts + api/types/* — 类型优先的 HTTP 请求定义     │
├─────────────────────────────────────────────────────┤
│  HTTP（请求封装）                                     │
│  utils/request.ts — axios 二次封装                    │
├─────────────────────────────────────────────────────┤
│  Mock / 后端                                          │
│  MSW v2 worker / 真实后端 API                         │
└─────────────────────────────────────────────────────┘
```

**依赖规则**：

- View → Composable → Service → API → HTTP（单向，不可逆向）
- Service 层可承载编排逻辑（如 `courseService.save` 按 `id` 是否存在分流 create/update），便于 Mock→后端切换时只改一处
- 跨层共享的纯逻辑放入 `utils/`（如 `permission.ts`、`format.ts`）

## 二、目录职责

| 目录                       | 职责                   | 关键约定                                |
| -------------------------- | ---------------------- | --------------------------------------- |
| `src/api/`                 | HTTP 请求定义 + 类型   | `types/` 存 Req/Resp 接口，type-first   |
| `src/components/Base/`     | 基础组件（不含业务）   | generic + defineExpose，全局注册        |
| `src/components/Business/` | 业务组件（含业务语义） | 组合 Base + 业务逻辑                    |
| `src/composables/`         | 组合式函数             | `useXxx` 命名，返回响应式状态与方法     |
| `src/enums/`               | 枚举常量               | business / permission / http            |
| `src/layouts/`             | 布局组件               | `default`（完整框架）/ `blank`（空白）  |
| `src/mocks/`               | MSW Mock               | `db.ts` 数据 + handlers 请求处理        |
| `src/router/`              | 路由体系               | constantRoutes + 动态路由 + 守卫        |
| `src/service/`             | Service 层             | 封装 API，承载编排                      |
| `src/stores/`              | Pinia 状态             | user / permission / app / tagsView      |
| `src/styles/`              | 全局样式               | SCSS 变量 + reset                       |
| `src/types/`               | 全局类型声明           | `global-components.d.ts` 等             |
| `src/utils/`               | 工具函数               | request / permission / format / storage |
| `src/views/`               | 业务视图               | feature-based 组织                      |

## 三、三层组件模型

系统采用 **UI 库 → Base → Business** 三层组件模型，逐层增强业务语义：

### 第 1 层：UI 库（Element Plus）

- 通过 `app.use(ElementPlus)` 全量注册，所有 `El*` 组件 + 指令全局可用
- 类型由 `unplugin-vue-components` 生成的 `components.d.ts` 提供

### 第 2 层：Base 基础组件（`src/components/Base/`）

- 不含业务逻辑，封装交互模式与样式规范
- 通过 `setupGlobalComponents` 全局注册
- 典型：`BaseTable`（分页表格）/ `BaseForm`（配置式表单）/ `BaseDialog`（弹窗）/ `BaseSearch`（搜索栏）/ `BasePagination` / `BasePage`
- **类型桩**：因运行时注册无法被 `vue-tsc` 静态分析，`src/types/global-components.d.ts` 手写 `DefineComponent` 桩声明全局组件类型

### 第 3 层：Business 业务组件（`src/components/Business/`）

- 含业务语义，组合 Base 组件 + 业务逻辑
- 典型：`StatusBadge`（状态标签）/ `DictTag`（字典标签）/ `TeacherSelector`（教师选择器）/ `PageHeader`

### 类型与 expose 约定

- Base 组件用 `generic` 支持泛型（如 `BaseTable<T>`）
- 需要外部调用的方法通过 `defineExpose` 暴露（如 `BaseForm` 暴露 `validate / resetFields / clearValidate / scrollToField`）
- 在视图中显式 `import BaseForm from '@/components/Base/BaseForm/index.vue'`，用 `ref<InstanceType<typeof BaseForm>>()` 获得真实 expose 类型

## 四、状态管理（Pinia）

| Store                | 职责           | 关键 state/action                                                                                   |
| -------------------- | -------------- | --------------------------------------------------------------------------------------------------- |
| `useUserStore`       | 用户认证与信息 | `token` / `userInfo` / `roles` / `permissions` / `dataScopes`；`login` / `fetchUserInfo` / `logout` |
| `usePermissionStore` | 路由权限       | `dynamicRoutes`；`generateRoutes`（调 `buildRoutesFromMenus`）/ `resetRoutes` / `checkPermission`   |
| `useAppStore`        | 应用全局状态   | 侧边栏折叠 / 主题 / 设备类型                                                                        |
| `useTagsViewStore`   | 标签页         | 已打开页面缓存 / keep-alive                                                                         |

状态通过 `pinia-plugin-persistedstate` 持久化（如 token），避免刷新丢失。

## 五、路由体系

### 常量路由（`constantRoutes`）

无需鉴权的路由，启动即注册：

- `/login`（登录）、`/403`、`/404`、`/redirect`（刷新中转）
- `/`（Layout 框架）→ `dashboard`（数据看板）、`profile`（个人中心）

### 动态路由

登录后根据用户 `permissions` / `roles` 从后端菜单树生成：

1. `userStore.fetchUserInfo()` 获取 `roles` / `permissions`
2. `permissionStore.generateRoutes()` 调用 `buildRoutesFromMenus(menus, { permissions, roles })`
3. 顶层菜单以 `Layout` 包裹，叶子节点经 `component-map.ts` 解析 `/src/views/${component}.vue` 懒加载
4. 菜单 `permissions` 字段过滤：无权限的菜单节点不生成路由
5. 最后注入 `notFoundRoute`（404 兜底）

### 路由守卫（`guards.ts`）

- 白名单（login/404/403）直接放行
- 无 token → 跳 login（带 redirect）
- 有 token 无 userInfo → 拉取用户信息 + 生成动态路由
- 动态路由就绪后 `next({ ...to, replace: true })` 确保新路由命中
- `NProgress` 进度条

### component-map 解析

- `resolveComponent(component: string)` 将菜单 `component` 字段（如 `teacher/list/index`）解析为 `() => import('/src/views/teacher/list/index.vue')`
- 通过 `import.meta.glob` 预扫描所有视图，路径必须与菜单 `component` 字段**完全一致**

## 六、请求链路（axios 二次封装）

`src/utils/request.ts` 提供类型安全的 HTTP 封装：

### 请求拦截

- 注入 `Authorization: Bearer <token>`（可通过 `withToken: false` 关闭）
- 注入 `X-Request-Id`（UUID）用于链路追踪
- **重复请求自动取消**：相同 method+url+params+data 的请求，新请求取消旧请求（`AbortController`）
- 可选全局 loading（`showLoading: true`）

### 响应拦截

- 统一响应结构 `{ code, data, message }`
- `code === 200` 成功 → 解包返回 `data`（`returnFull: true` 则返回完整响应）
- token 失效（`TOKEN_EXPIRED` / `TOKEN_INVALID`）→ 提示 + 跳登录
- 其他业务错误 → `ElMessage.error` + 抛 `ApiError`
- 网络错误按 status 分流提示（401/403/404/5xx/超时/断网）

### 便捷方法

`http.get / post / put / delete / upload / download`，均支持泛型 `http.get<T>()` 与 `RequestOptions`。

## 七、Mock 体系（MSW v2）

- **原理**：Service Worker 在网络层拦截请求，axios 无感知，可平滑切换后端
- **启用**：`.env.development` 的 `VITE_USE_MOCK=true`，main.ts 条件启动 worker
- **结构**：
  - `src/mocks/db.ts`：集中管理所有 Mock 数据（users/menus/teachers/students/courses/schedules/dicts/dashboard）
  - handlers：按模块组织请求处理，返回 `ok(data)` / `fail(msg)` 统一响应
- **生成 worker**：`npm run msw:init` 输出到 `public/mockServiceWorker.js`
