import type { Directive, DirectiveBinding } from 'vue'
import { ElMessage } from 'element-plus'

/** v-copy: 点击复制文本。用法 v-copy="text" */
export const copy: Directive = {
  mounted(el: HTMLElement & { _copyText?: string }, binding: DirectiveBinding<string>) {
    el._copyText = binding.value
    el.style.cursor = 'pointer'
    el.addEventListener('click', async () => {
      const text = el._copyText
      if (!text) return
      try {
        await navigator.clipboard.writeText(text)
        ElMessage.success('已复制到剪贴板')
      } catch {
        ElMessage.error('复制失败')
      }
    })
  },
  updated(el: HTMLElement & { _copyText?: string }, binding: DirectiveBinding<string>) {
    el._copyText = binding.value
  },
}
