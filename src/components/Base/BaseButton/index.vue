<script setup lang="ts">
import { ElButton } from 'element-plus'
import { usePermission } from '@/composables/usePermission'

const props = withDefaults(
  defineProps<{
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
    size?: 'large' | 'default' | 'small'
    icon?: string
    disabled?: boolean
    loading?: boolean
    /** 权限码，无权则不渲染 */
    perm?: string | string[]
  }>(),
  {
    type: 'primary',
    disabled: false,
    loading: false,
  },
)

const { hasPerm } = usePermission()
const hasPermission = computed(() => !props.perm || hasPerm(props.perm))
</script>

<template>
  <ElButton
    v-if="hasPermission"
    :type="type"
    :size="size"
    :icon="icon"
    :disabled="disabled"
    :loading="loading"
  >
    <slot />
  </ElButton>
</template>
