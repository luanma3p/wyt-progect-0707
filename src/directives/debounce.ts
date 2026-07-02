import type { Directive, DirectiveBinding } from 'vue'

interface DebounceEl extends HTMLElement {
  _debounceTimer?: ReturnType<typeof setTimeout>
}

/** v-debounce: 点击防抖，默认 300ms。用法：v-debounce:click="handler" 或 v-debounce="handler" */
export const debounce: Directive = {
  mounted(el: DebounceEl, binding: DirectiveBinding) {
    const event = binding.arg || 'click'
    const handler = binding.value
    const delay = 300
    if (typeof handler !== 'function') return
    el.addEventListener(event, () => {
      if (el._debounceTimer) clearTimeout(el._debounceTimer)
      el._debounceTimer = setTimeout(() => handler(), delay)
    })
  },
  unmounted(el: DebounceEl) {
    if (el._debounceTimer) clearTimeout(el._debounceTimer)
  },
}
