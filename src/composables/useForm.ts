import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

/** 表单组件暴露的最小接口（与 BaseForm 的 defineExpose 对齐） */
export interface FormExpose {
  validate: (cb?: (valid: boolean) => void) => Promise<boolean> | undefined
  resetFields: (fields?: unknown) => void
  clearValidate?: (fields?: unknown) => void
}

export interface UseFormOptions<T> {
  defaultForm?: Partial<T>
  successMsg?: string
  resetOnClose?: boolean
}

/**
 * 表单提交 + 校验 + 弹窗可见性编排。
 * mode: create / edit / view（view 时不提交）。
 */
export function useForm<T extends object>(
  apiFn: (data: T) => Promise<unknown>,
  options: UseFormOptions<T> = {},
) {
  const formRef = ref<FormExpose>()
  const form = reactive({ ...(options.defaultForm ?? {}) }) as T
  const loading = ref(false)
  const visible = ref(false)
  const mode = ref<'create' | 'edit' | 'view'>('create')
  const isView = computed(() => mode.value === 'view')

  function open(payload?: { mode?: typeof mode.value; data?: Partial<T> }) {
    mode.value = payload?.mode ?? 'create'
    Object.assign(form, options.defaultForm ?? {}, payload?.data ?? {})
    visible.value = true
  }

  function close() {
    visible.value = false
    if (options.resetOnClose !== false) {
      formRef.value?.resetFields()
    }
  }

  async function submit(): Promise<boolean> {
    if (isView.value) return false
    try {
      await formRef.value?.validate()
    } catch {
      return false
    }
    loading.value = true
    try {
      await apiFn(form)
      ElMessage.success(options.successMsg ?? '操作成功')
      close()
      return true
    } catch {
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    formRef,
    form,
    loading,
    visible,
    mode,
    isView,
    open,
    close,
    submit,
  }
}
