import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 菜单标题 */
    title?: string
    /** 菜单图标 */
    icon?: string
    /** 是否在菜单隐藏 */
    hidden?: boolean
    /** 是否固定 tagsView */
    affix?: boolean
    /** 是否缓存（keep-alive） */
    cache?: boolean
    /** 路由所需权限码 */
    permissions?: string[]
    /** 路由所需角色 */
    roles?: string[]
    /** 高亮的菜单项（用于详情页等） */
    activeMenu?: string
    /** 是否不纳入 tagsView */
    noTagsView?: boolean
    /** 外链地址 */
    frameSrc?: string
    /** 始终显示父级菜单（即使只有一个子节点） */
    alwaysShow?: boolean
    /** 排序 */
    order?: number
  }
}

export {}
