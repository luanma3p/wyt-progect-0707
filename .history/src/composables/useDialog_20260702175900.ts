import { computed, ref } from 'vue'

export type DialogMode = 'create' | 'edit' | 'view'

/** 弹窗状态机：visible / title / mode / data，配合 BaseDialog 使用 */
export function useDialog<T = unknown>() {
  const visible = ref(false)
  const title = ref('')
  const mode = ref<DialogMode>('create')
  const data = ref<T>()

  const isView = computed(() => mode.value === 'view')
  const isEdit = computed(() => mode.value === 'edit')

  function open(opts?: { title?: string; mode?: DialogMode; data?: T }) {
    if (opts?.title) title.value = opts.title
    if (opts?.mode) mode.value = opts.mode
    if (opts?.data !== undefined) data.value = opts.data
    visible.value = true
  }

  function close() {
    visible.value = false
  }

  return {
    visible,
    title,
    mode,
    data,
    isView,
    isEdit,
    open,
    close,
  }
}
