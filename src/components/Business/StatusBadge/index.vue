<script setup lang="ts">
type TagType = 'success' | 'warning' | 'danger' | 'info' | 'primary'

interface StatusOption {
  text: string
  type: TagType
}

interface Props {
  /** 状态值 */
  status: string | number
  /** 状态映射表 */
  mapping?: Record<string, StatusOption>
}
const props = withDefaults(defineProps<Props>(), {
  mapping: () => ({}),
})
const info = computed<StatusOption>(
  () => props.mapping[String(props.status)] ?? { text: String(props.status), type: 'info' },
)
</script>

<template>
  <el-tag :type="info.type === 'primary' ? undefined : info.type" size="small" effect="light">
    {{ info.text }}
  </el-tag>
</template>
