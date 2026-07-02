<script setup lang="ts">
import { ref } from 'vue'
import { teacherApi } from '@/api/teacher'
import type { TeacherListItem } from '@/api/types'

interface Props {
  modelValue?: string | number | undefined
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
}
withDefaults(defineProps<Props>(), {
  placeholder: '请选择教师',
  clearable: true,
})
const emit = defineEmits<{
  'update:modelValue': [value: string | number | undefined]
  change: [teacher: TeacherListItem | undefined]
}>()
const options = ref<TeacherListItem[]>([])
const loading = ref(false)

async function remoteSearch(query: string) {
  loading.value = true
  try {
    const res = await teacherApi.getList({ pageNum: 1, pageSize: 50, keyword: query })
    options.value = res.list
  } finally {
    loading.value = false
  }
}

function handleChange(val: string | number | undefined) {
  emit('update:modelValue', val)
  emit(
    'change',
    options.value.find((t) => t.id === val),
  )
}
</script>

<template>
  <el-select
    :model-value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :loading="loading"
    filterable
    remote
    :remote-method="remoteSearch"
    @change="handleChange"
  >
    <el-option v-for="item in options" :key="item.id" :label="item.name" :value="item.id" />
  </el-select>
</template>
