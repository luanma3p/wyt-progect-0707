# 权限设计

> 本文档描述系统的权限模型、实现机制、通配符规则与扩展流程。

## 一、权限模型

系统采用 **JWT + RBAC（基于角色的访问控制）** 三级权限模型：

| 层级   | 控制对象        | 实现方式                                                                            |
| ------ | --------------- | ----------------------------------------------------------------------------------- |
| 路由级 | 页面/菜单可见性 | 动态路由（`buildRoutesFromMenus` 按权限过滤）+ 路由守卫                             |
| 按钮级 | 操作按钮可见性  | `v-permission` 指令 + `usePermission().hasPerm()` + `BaseTable` actions `perm` 字段 |
| 数据级 | 数据范围        | `dataScopes`（all/self），`hasDataScope()` 校验，接口侧过滤                         |

### 权限标识

- **权限码**：`模块:操作` 格式，如 `teacher:list`、`teacher:audit`、`course:schedule`
- **角色**：如 `admin`、`teacher`
- **数据范围**：`all`（全量）/ `self`（仅本人）

## 二、登录与权限初始化流程

```
用户输入账号密码
    │
    ▼
userStore.login() → POST /auth/login → 返回 token
    │
    ▼
存储 token（持久化）
    │
    ▼
路由守卫检测：有 token 无 userInfo
    │
    ▼
userStore.fetchUserInfo() → GET /user/info
    │  返回 { roles, permissions, dataScopes, ...userInfo }
    ▼
permissionStore.generateRoutes(roles, permissions)
    │  调用 buildRoutesFromMenus(menus, { roles, permissions })
    │  按权限过滤菜单树 → 生成 AppRouteRecord[]
    ▼
router.addRoute(dynamicRoutes) + addRoute(notFoundRoute)
    │
    ▼
next({ ...to, replace: true })  ← 确保新路由命中
```

## 三、路由级权限

### 动态路由生成（`src/router/dynamic.ts`）

- `buildRoutesFromMenus(menus, { permissions, roles })` 递归构建路由树
- 每个菜单节点经 `hasMenuAccess()` 校验：
  - 菜单 `permissions` 非空 → 必须用户 `hasPermission(menu.permissions, permissions)`
  - 菜单 `roles` 非空 → 必须 `hasRole(menu.roles, roles)`
  - 不满足则该节点（含子树）不生成路由
- 顶层菜单以 `Layout` 包裹，叶子节点经 `component-map` 解析为懒加载组件
- `type === 'button'` 的节点不生成路由，仅作为权限标识

### 路由守卫（`src/router/guards.ts`）

- 白名单（`/login`、`/403`、`/404`）直接放行
- 无 token → 重定向 `/login?redirect=...`
- 有 token 无 userInfo → 触发 `fetchUserInfo` + `generateRoutes`
- 动态路由未注入时，标记 `replace: true` 重新导航
- `NProgress` 进度条

## 四、按钮级权限

### `v-permission` 指令

```vue
<el-button v-permission="'teacher:audit'">审核</el-button>
<el-button v-permission="['teacher:disable', 'teacher:enable']">停用/启用</el-button>
```

无权限时元素从 DOM 移除。

### `usePermission()` composable

```ts
const { hasPerm, hasRole, hasDataScope } = usePermission()
if (hasPerm('teacher:audit')) { ... }
```

### BaseTable actions 自动过滤

`BaseTable` 操作列的 `actions` 支持 `perm` 字段，自动按权限 + `show` 条件过滤：

```ts
{
  label: '审核',
  perm: 'teacher:audit',           // ← 无此权限则按钮不显示
  show: (row) => row.status === 'pending',  // ← 状态非待审核也不显示
  onClick: (row) => openAudit(row),
}
```

## 五、数据级权限

- `dataScopes`：`['all']`（全量）/ `['self']`（仅本人）
- 校验：`hasDataScope('self', userStore.dataScopes)`，若拥有 `all` 则始终通过
- 当前为预留机制，接口侧过滤待接入真实后端时落地

## 六、通配符规则（核心）

`src/utils/permission.ts` 的 `hasPermission()` 支持三种匹配模式：

| 模式     | 拥有的权限     | 匹配规则             | 示例                                                       |
| -------- | -------------- | -------------------- | ---------------------------------------------------------- |
| 超管通配 | `*` 或 `*:*:*` | 全量放行             | 拥有 `*:*:*` → 任何权限码都通过                            |
| 段通配   | `模块:*`       | 匹配该模块下所有操作 | 拥有 `teacher:*` → `teacher:audit` / `teacher:list` 均通过 |
| 精确匹配 | `模块:操作`    | 严格相等             | 拥有 `teacher:list` → 仅 `teacher:list` 通过               |

### 实现要点

```ts
const SUPER_WILDCARDS = new Set(['*', '*:*:*'])
function isSuperAdmin(owned: string[]): boolean {
  return owned.some((p) => SUPER_WILDCARDS.has(p))
}
function codeMatches(code: string, owned: string[]): boolean {
  return owned.some((p) => {
    if (p === code) return true // 精确
    if (p.endsWith(':*')) {
      // 段通配
      return code.startsWith(p.slice(0, -1)) // 'teacher:*' → startsWith('teacher:')
    }
    return false
  })
}
export function hasPermission(required, owned): boolean {
  if (!owned.length) return false
  if (isSuperAdmin(owned)) return true // 超管短路
  const list = Array.isArray(required) ? required : [required]
  return list.some((code) => codeMatches(code, owned)) // 任一匹配即通过
}
```

> **设计考量**：支持 `*:*:*` 是为了兼容 RuoYi 风格后端的超管标识；段通配 `teacher:*` 用于「模块管理员」角色。

## 七、新增权限流程

新增一个「教师导出」功能为例：

1. **后端**：在角色权限表配置权限码 `teacher:export`，并将其挂到对应菜单/按钮节点
2. **菜单**：若需新菜单项，在菜单树（mock 的 `menus` / 后端菜单接口）增加节点并设 `permissions: ['teacher:export']`
3. **前端按钮**：
   ```vue
   <el-button v-permission="'teacher:export'" @click="handleExport">导出</el-button>
   ```
4. **BaseTable action**（若在表格操作列）：
   ```ts
   { label: '导出', perm: 'teacher:export', onClick: (row) => exportTeacher(row) }
   ```
5. **数据级**（若涉及数据范围）：在接口请求时携带 dataScopes，后端按范围过滤

无需修改前端权限核心逻辑——`hasPermission` 会自动识别新权限码。

## 八、账号权限差异

系统内置两个 Mock 账号（`src/mocks/db.ts`），用于演示权限分级：

### admin（超级管理员）

- 角色：`['admin']`
- 权限：`['*:*:*']`（超管通配，全量放行）
- 数据范围：`['all']`
- 可见：全部菜单 + 全部按钮

### teacher（教师）

- 角色：`['teacher']`
- 权限：`['teacher:list', 'teacher:detail', 'student:list', 'course:list', 'course:schedule', 'dashboard:view']`
- 数据范围：`['self']`
- 可见：仅授权的菜单（教师列表/详情、学员列表、课程列表、排课管理、数据看板），无审核/停用等管理按钮

### 权限码清单

| 权限码            | 说明          | admin | teacher |
| ----------------- | ------------- | :---: | :-----: |
| `dashboard:view`  | 数据看板      |  ✅   |   ✅    |
| `teacher:list`    | 教师列表      |  ✅   |   ✅    |
| `teacher:detail`  | 教师详情      |  ✅   |   ✅    |
| `teacher:audit`   | 教师审核      |  ✅   |   ❌    |
| `teacher:disable` | 停用/启用教师 |  ✅   |   ❌    |
| `student:list`    | 学员列表      |  ✅   |   ✅    |
| `course:list`     | 课程列表      |  ✅   |   ✅    |
| `course:schedule` | 排课管理      |  ✅   |   ✅    |

> 用两个账号分别登录，可直观对比菜单与按钮的权限差异。
