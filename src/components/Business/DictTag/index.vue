<script setup lang="ts">
import { useDict } from '@/composables/useDict'

interface Props {
  /** 字典编码 */
  code: string
  /** 字典值 */
  value: string | number | undefined | null
}
const props = defineProps<Props>()
const { getLabel, getTagType } = useDict(props.code)
const label = computed(() => getLabel(props.code, props.value))
const tagType = computed(() => getTagType(props.code, props.value))
</script>

<template>
  <el-tag v-if="label" :type="tagType" size="small" effect="light">{{ label }}</el-tag>
  <span v-else class="dict-tag--empty">{{ value ?? '-' }}</span>
</template>

<style scoped>
.dict-tag--empty {
  color: var(--el-text-color-placeholder);
}
</style>
