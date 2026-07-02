import type { DefineComponent } from 'vue'

/**
 * 手动声明全局注册的 Base/Business 组件类型，
 * 供 vue-tsc 在模板中识别（运行时注册无法被静态分析）。
 * Element Plus 的 El* 组件由 unplugin-vue-components 的 components.d.ts 声明。
 */
declare module 'vue' {
  export interface GlobalComponents {
    BaseTable: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
    BaseForm: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
    BaseDialog: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
    BaseSearch: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
    BasePagination: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
    BaseButton: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
    BasePage: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
    BaseEmpty: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
    BaseIcon: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
    DictTag: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
    StatusBadge: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
    PageHeader: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
    TeacherSelector: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  }
}

export {}
