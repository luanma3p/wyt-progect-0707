/** 系统全局设置（可在运行时通过 app store 覆盖） */
export interface AppSettings {
  /** 站点标题 */
  title: string
  /** Logo 文本首字母等 */
  logoText: string
  /** 是否启用 tagsView 多页签 */
  enableTagsView: boolean
  /** 是否启用面包屑 */
  enableBreadcrumb: boolean
  /** 是否启用侧边栏折叠记忆 */
  enableSidebarCollapse: boolean
  /** 默认主题 */
  defaultTheme: 'light' | 'dark'
  /** Element Plus 默认尺寸 */
  defaultSize: 'large' | 'default' | 'small'
  /** 默认语言 */
  defaultLanguage: 'zh-cn' | 'en'
}

export const defaultSettings: AppSettings = {
  title: import.meta.env.VITE_APP_TITLE || '伴学老师后台管理系统',
  logoText: '伴学',
  enableTagsView: true,
  enableBreadcrumb: true,
  enableSidebarCollapse: true,
  defaultTheme: 'light',
  defaultSize: 'default',
  defaultLanguage: 'zh-cn',
}
