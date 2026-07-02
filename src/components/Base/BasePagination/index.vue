<script setup lang="ts">
import { ElPagination } from 'element-plus'

withDefaults(
  defineProps<{
    page: number
    pageSize: number
    total: number
    pageSizes?: number[]
    layout?: string
    background?: boolean
  }>(),
  {
    pageSizes: () => [10, 20, 50, 100],
    layout: 'total, sizes, prev, pager, next, jumper',
    background: true,
  },
)

const emit = defineEmits<{
  (e: 'update:page', value: number): void
  (e: 'update:pageSize', value: number): void
  (e: 'change'): void
}>()

function handleCurrentChange(p: number) {
  emit('update:page', p)
  emit('change')
}

function handleSizeChange(s: number) {
  emit('update:pageSize', s)
  emit('change')
}
</script>

<template>
  <div class="base-pagination">
    <ElPagination
      :current-page="page"
      :page-size="pageSize"
      :page-sizes="pageSizes"
      :total="total"
      :layout="layout"
      :background="background"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<style scoped lang="scss">
.base-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
