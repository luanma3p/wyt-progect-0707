import type { Directive, DirectiveBinding } from 'vue'
import { usePermissionStore } from '@/stores/modules/permission'

/** v-permission: 按钮级权限指令，无权则移除元素 */
export const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    const { value } = binding
    if (!value) return
    const permissionStore = usePermissionStore()
    if (!permissionStore.checkPermission(value)) {
      el.parentNode?.removeChild(el)
    }
  },
}
