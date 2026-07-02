<script setup lang="ts">
import { ElForm, ElFormItem, ElButton, ElIcon } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import BaseForm from '@/components/Base/BaseForm/index.vue'
import type { FormField } from '@/components/Base/BaseForm/types'

withDefaults(
  defineProps<{
    fields: FormField[]
    modelValue: Record<string, unknown>
    inline?: boolean
  }>(),
  {
    inline: true,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, unknown>): void
  (e: 'search'): void
  (e: 'reset'): void
}>()

function handleSearch() {
  emit('search')
}

function handleReset() {
  emit('reset')
}

function updateValue(val: Record<string, unknown>) {
  emit('update:modelValue', val)
}
</script>

<template>
  <div class="base-search">
    <ElForm :inline="inline" :model="modelValue">
      <BaseForm
        :fields="fields"
        :model-value="modelValue"
        :inline="inline"
        label-width="90px"
        @update:model-value="updateValue"
      />
      <ElFormItem>
        <ElButton type="primary" @click="handleSearch">
          <ElIcon class="el-icon--left"><Search /></ElIcon>
          搜索
        </ElButton>
        <ElButton @click="handleReset">
          <ElIcon class="el-icon--left"><Refresh /></ElIcon>
          重置
        </ElButton>
        <slot name="extra" />
      </ElFormItem>
    </ElForm>
  </div>
</template>
