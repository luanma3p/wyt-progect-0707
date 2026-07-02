/** 权限类型枚举 */
export enum PermType {
  /** 菜单 */
  MENU = 'menu',
  /** 按钮 */
  BUTTON = 'button',
  /** 接口 */
  API = 'api',
}

/** 数据范围 */
export enum DataScope {
  /** 全部 */
  ALL = 'all',
  /** 本部门 */
  DEPT = 'dept',
  /** 本部门及下级 */
  DEPT_AND_CHILD = 'dept_and_child',
  /** 仅本人 */
  SELF = 'self',
  /** 自定义 */
  CUSTOM = 'custom',
}
