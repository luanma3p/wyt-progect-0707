/** Storage / Event / 全局键集中管理，避免魔法字符串 */
export const STORAGE_KEYS = {
  TOKEN: 'BANXUE_TOKEN',
  USER_INFO: 'BANXUE_USER_INFO',
  APP_SETTINGS: 'BANXUE_APP_SETTINGS',
  PERMISSIONS: 'BANXUE_PERMISSIONS',
} as const

export const EVENT_KEYS = {
  TOKEN_EXPIRED: 'token-expired',
  THEME_CHANGE: 'theme-change',
  SIDEBAR_TOGGLE: 'sidebar-toggle',
} as const
