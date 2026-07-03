# 编码规范

> 本文档定义项目的命名、组织、TypeScript、组件与视图开发范式约定，确保代码风格统一、长期可维护。

## 一、命名规范

| 对象                    | 规范                                 | 示例                                          |
| ----------------------- | ------------------------------------ | --------------------------------------------- |
| 文件/目录               | kebab-case                           | `teacher.service.ts`、`course/management/`    |
| Vue 组件文件            | index.vue（目录式）或 PascalCase.vue | `BaseTable/index.vue`、`StatusBadge.vue`      |
| 组件名（defineOptions） | PascalCase，多词                     | `defineOptions({ name: 'CourseManagement' })` |
| Composable              | `useXxx`                             | `useTable`、`usePermission`                   |
| Store                   | `useXxxStore`                        | `useUserStore`、`usePermissionStore`          |
| API 模块                | `xxxApi`                             | `courseApi`、`teacherApi`                     |
| Service 模块            | `xxxService`                         | `courseService`                               |
| 类型/接口               | PascalCase，Req/Resp 后缀            | `CourseListReq`、`TeacherDetailResp`          |
| 枚举                    | PascalCase                           | `TeacherStatus`、`CourseStatus`               |
| 常量                    | UPPER_SNAKE_CASE                     | `SUPER_WILDCARDS`、`API_PREFIX`               |
| 事件名                  | kebab-case                           | `update:visible`、`selection-change`          |

## 二、目录组织

### feature-based 业务模块

业务视图按功能模块组织在 `src/views/` 下，每个模块自包含：

```
src/views/teacher/
├── list/index.vue        # 教师列表
└── detail/index.vue      # 教师详情
```

### 共享代码分层

- **跨 feature 复用的组件** → `src/components/Base/`（无业务）或 `Business/`（有业务）
- **跨 feature 复用的逻辑** → `src/composables/`
- **纯工具函数** → `src/utils/`
- **类型定义** → `src/api/types/`（接口类型）或 `src/types/`（全局声明）

## 三、TypeScript 约定

### strict 模式

项目启用 `strict: true`，禁止隐式 any、严格 null 检查。

### type-first（类型优先）

所有 API 请求/响应先在 `src/api/types/` 定义接口，API 层与 Service 层消费：

```ts
// api/types/course.ts
export interface CourseListReq extends PageQuery {
  keyword?: string
  status?: CourseStatus
}
export interface CourseListItem { id: string; name: string; ... }

// api/course.ts
export const courseApi = {
  getList: (params: CourseListReq) => http.get<CourseListResp>('/course/list', params),
}
```

### 类型导入

- 使用 `import type { ... }` 导入纯类型，符合 `@typescript-eslint/consistent-type-imports` 规则（inline-style）
- 避免任何 `any`，必要时用 `unknown` + 类型守卫；`@typescript-eslint/no-explicit-any` 为 warn

## 四、AutoImport 边界（关键约定）

项目通过 `unplugin-auto-import` 自动导入部分 API，但**边界明确**，避免过度隐式导入降低可读性：

### ✅ 自动导入（无需手写 import）

- **vue**：`ref` / `reactive` / `computed` / `watch` / `onMounted` / `nextTick` / `defineOptions` ...
- **vue-router**：`useRoute` / `useRouter` / `onBeforeRouteLeave` ...
- **pinia**：`defineStore` / `storeToRefs`
- **@vueuse/core**：`useStorage` / `useEventListener` ...

### ✋ 必须显式 import

- **Element Plus 函数**：`ElMessage` / `ElMessageBox` / `ElNotification` / `ElLoading`
- **Element Plus 图标**：`import { User, Lock } from '@element-plus/icons-vue'`
- **Pinia stores**：`import { useUserStore } from '@/stores/modules/user'`
- **自定义 composables**：`import { useTable } from '@/composables/useTable'`
- **API / Service**：`import { courseService } from '@/service/course.service'`
- **类型**：`import type { CourseListItem } from '@/api/types/course'`
- **Base 组件（需 expose 类型时）**：`import BaseForm from '@/components/Base/BaseForm/index.vue'`

> 判断原则：若自动导入会让代码「凭空出现」一个不直观的符号，则改为显式 import。

## 五、组件开发范式

### Base 组件

- 用 `<script setup lang="ts" generic="T extends ...">` 支持泛型
- props 用 `defineProps<{ ... }>()` + `withDefaults`
- emits 用 `defineEmits<{ (e: 'xxx', ...): void }>()`
- 需外部调用的方法用 `defineExpose({ ... })`
- 不含任何业务字段/接口

### Business 组件

- 组合 Base 组件 + 业务语义
- props 接收业务数据，内部处理展示逻辑
- 如 `StatusBadge` 接收 `status` + `mapping`，输出 `el-tag`

## 六、视图开发范式

### 列表页标准结构

```vue
<script setup lang="ts">
import { ElMessage } from 'element-plus'
import BaseForm from '@/components/Base/BaseForm/index.vue'
import type { FormField } from '@/components/Base/BaseForm/types'
import type { TableColumn } from '@/components/Base/BaseTable/types'
import { useTable } from '@/composables/useTable'
import { xxxService } from '@/service/xxx.service'

defineOptions({ name: 'XxxList' })

// 1. 搜索字段配置
const searchFields: FormField[] = [...]
// 2. 列配置（含 actions）
const columns: TableColumn<XxxItem>[] = [...]
// 3. useTable 编排分页
const { loading, list, total, page, query, search, reset, reload, onPageChange, onSizeChange } =
  useTable<XxxItem, XxxReq>(xxxService.fetchList)
// 4. 弹窗手动管理（推荐，类型安全）
const formRef = ref<InstanceType<typeof BaseForm>>()
const dialogVisible = ref(false)
const form = reactive<XxxForm>({...})
</script>

<template>
  <BasePage title="...">
    <template #toolbar>...</template>
    <BaseSearch :fields="searchFields" :model-value="query" @search="search" @reset="reset" />
    <BaseTable :columns="columns" :data="list" :loading="loading">...</BaseTable>
    <BasePagination :page="page.pageNum" :page-size="page.pageSize" :total="total" ... />
    <BaseDialog v-model:visible="dialogVisible" @confirm="handleSubmit">
      <BaseForm ref="formRef" :fields="formFields" :model-value="form" />
    </BaseDialog>
  </BasePage>
</template>
```

### 弹窗管理：手动 vs useForm

- **推荐手动管理**：`formRef = ref<InstanceType<typeof BaseForm>>()`，直接调 `formRef.value?.validate()`
- 原因：全局组件 stub 类型不含 expose，显式 import 获得真实类型 + 控制力更强（见 [决策记录](decision-log.md#4-为何手动弹窗管理vs-useform-composable)）
- `useForm` composable 仍保留，供简单场景选用

### 非分页列表

- 数据为数组而非分页结构时，不用 `useTable` / `BasePagination`
- 直接 `ref<T[]>([])` + 手动 loading，如排课视图（`course/schedule`）

## 七、权限编码

- 路由级：菜单 `permissions` 字段，动态路由自动过滤
- 按钮级：`v-permission="'xxx:yyy'"` 指令，或 `BaseTable` 列 `actions` 的 `perm` 字段自动过滤
- 数据级：`dataScopes`（all/self），`usePermission().hasDataScope()`
- 详见 [权限设计](permission.md)

## 八、提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)，由 commitlint 校验：

| type       | 说明                   |
| ---------- | ---------------------- |
| `feat`     | 新功能                 |
| `fix`      | Bug 修复               |
| `docs`     | 文档变更               |
| `style`    | 代码格式（不影响功能） |
| `refactor` | 重构（非 feat/fix）    |
| `perf`     | 性能优化               |
| `test`     | 测试相关               |
| `chore`    | 构建/工具/依赖         |

示例：`feat(teacher): 新增教师审核弹窗`、`fix(permission): 修复超管通配符未识别 *:*:*`

## 九、代码检查

提交前必须通过以下检查（husky + lint-staged 自动触发）：

1. **ESLint**：`npm run lint:check`（CI）/ `npm run lint`（自动修复）
2. **Prettier**：`npm run format`
3. **TypeScript**：`npm run type-check`（`vue-tsc --noEmit`）
4. **构建**：`npm run build`（type-check + vite build）

`.eslintrc.cjs` 关键规则：

- `vue/component-name-in-template-casing: PascalCase`（模板中组件名用 PascalCase）
- `@typescript-eslint/no-explicit-any: warn`
- `@typescript-eslint/consistent-type-imports: warn`（prefer type-imports, inline）
- 生产环境 `no-console: warn` / `no-debugger: error`
