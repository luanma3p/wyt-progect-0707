# 伴学老师后台管理系统

> 一个面向教培机构的教师后台管理系统，采用 Vue 3 + TypeScript 构建，强调**长期可维护性**：
> 分层清晰、类型优先、配置驱动、权限三级管控。

## 技术栈

| 分类     | 技术                                                           | 版本    |
| -------- | -------------------------------------------------------------- | ------- |
| 框架     | Vue 3（Composition API + `<script setup>`）                    | ^3.4.38 |
| 语言     | TypeScript（strict 模式）                                      | ^5.5.4  |
| 构建工具 | Vite 5                                                         | ^5.4.1  |
| 路由     | Vue Router 4                                                   | ^4.4.3  |
| 状态管理 | Pinia 2 + 持久化插件                                           | ^2.2.2  |
| UI 库    | Element Plus（全量注册）                                       | ^2.8.0  |
| 图表     | ECharts 5（按需注册）                                          | ^5.5.1  |
| HTTP     | Axios（二次封装）                                              | ^1.7.4  |
| 工具库   | @vueuse/core / dayjs / lodash-es / nprogress                   | —       |
| Mock     | MSW v2（Service Worker）                                       | ^2.3.5  |
| 代码规范 | ESLint + Prettier + vue-tsc + husky + lint-staged + commitlint | —       |
| 自动导入 | unplugin-auto-import + unplugin-vue-components                 | —       |

## 环境要求

- **Node.js** ≥ 18.0.0
- **包管理器**：npm（推荐）/ pnpm / yarn

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器（默认 http://localhost:5173）
npm run dev
```

### 登录账号

系统内置两个 Mock 账号，用于演示权限差异：

| 账号      | 密码     | 角色       | 权限范围                                        |
| --------- | -------- | ---------- | ----------------------------------------------- |
| `admin`   | `123456` | 超级管理员 | 全部菜单 + 全部按钮（`*:*:*`）                  |
| `teacher` | `123456` | 教师       | 仅授权的 6 个权限码（教师/学员/课程/排课/看板） |

登录后可观察：admin 看到全部菜单，teacher 仅看到被授权的菜单与按钮。

## npm scripts

| 命令                 | 说明                                                    |
| -------------------- | ------------------------------------------------------- |
| `npm run dev`        | 启动 Vite 开发服务器（含 MSW Mock）                     |
| `npm run build`      | 类型检查 + 生产构建（`vue-tsc --noEmit && vite build`） |
| `npm run preview`    | 预览构建产物                                            |
| `npm run type-check` | 仅执行类型检查（`vue-tsc --noEmit`）                    |
| `npm run lint`       | ESLint 检查并自动修复                                   |
| `npm run lint:check` | ESLint 检查（不修复，CI 用）                            |
| `npm run format`     | Prettier 格式化源码                                     |
| `npm run msw:init`   | 重新生成 MSW worker 脚本到 `public/`                    |

## 目录结构

```
banxue-teacher-admin/
├── public/                  # 静态资源 + MSW worker
├── src/
│   ├── api/                 # API 层：HTTP 请求 + 类型定义
│   │   ├── types/           #   请求/响应类型（type-first）
│   │   └── *.ts             #   各模块 API（auth/user/teacher/student/course/...）
│   ├── components/          # 三层组件模型
│   │   ├── Base/            #   基础组件（BaseTable/BaseForm/BaseDialog/...）
│   │   └── Business/        #   业务组件（StatusBadge/DictTag/TeacherSelector/...）
│   ├── composables/         # 组合式函数（useTable/useForm/useECharts/usePermission/...）
│   ├── enums/               # 枚举（business/permission/http）
│   ├── layouts/             # 布局（default 含 Navbar/Sidebar/TagsView，blank 空白）
│   ├── mocks/               # MSW Mock（db 数据 + handlers）
│   ├── router/              # 路由（constantRoutes + 动态路由 + 守卫 + 权限）
│   ├── service/             # Service 层：封装 API 调用，承载编排逻辑
│   ├── stores/              # Pinia 状态（user/permission/app/tagsView）
│   ├── styles/              # 全局样式 + 变量
│   ├── types/               # 全局类型声明（global-components.d.ts 等）
│   ├── utils/               # 工具（request 二次封装 / permission / format / ...）
│   └── views/               # 业务视图（feature-based：login/teacher/student/course/...）
├── docs/                    # 项目文档
├── .env / .env.development / .env.production
└── vite.config.ts / tsconfig.json / .eslintrc.cjs / .prettierrc
```

## Mock 说明

本项目使用 [MSW v2](https://mswjs.io/) 作为 Mock 方案。MSW 通过 Service Worker 在网络层拦截请求，**不污染 axios 实例**，可平滑切换到真实后端。

- 开关：`.env.development` 中 `VITE_USE_MOCK=true` 启用，设为 `false` 则走真实接口
- 代理：`VITE_PROXY_TARGET` 配置后端地址（Mock 关闭时生效）
- 数据：`src/mocks/db.ts` 集中管理 Mock 数据
- 重新生成 worker：`npm run msw:init`

## 文档导航

详细文档位于 `docs/` 目录：

| 文档                             | 说明                                                                          |
| -------------------------------- | ----------------------------------------------------------------------------- |
| [架构设计](docs/architecture.md) | 分层架构、目录职责、组件模型、状态管理、路由体系、请求链路、Mock 体系         |
| [编码规范](docs/conventions.md)  | 命名、目录组织、TypeScript 约定、AutoImport 边界、组件/视图开发范式、提交规范 |
| [权限设计](docs/permission.md)   | JWT + RBAC 三级权限模型、通配符规则、新增权限流程、账号权限差异               |
| [决策记录](docs/decision-log.md) | 关键架构决策的背景与理由（技术选型权衡）                                      |

## 浏览器兼容性

支持现代浏览器（Chrome / Edge / Firefox / Safari 最新两个稳定版本）。依赖 ES2021 + Service Worker（Mock 模式）。

## 后续演进方向

- 接入真实后端：关闭 `VITE_USE_MOCK`，配置 `VITE_PROXY_TARGET`
- 权限扩展：数据级权限（dataScopes）落地到接口过滤
- 主题切换：`useTheme` composable 已预留暗色主题
- 国际化：可接入 vue-i18n（当前为中文）
