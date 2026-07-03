<script setup lang="ts" generic="T extends Record<string, any>">
import { computed } from 'vue'
import { ElTable, ElTableColumn, ElButton } from 'element-plus'
import { ElMessageBox } from 'element-plus'
import type { TableColumn, TableAction } from './types'
import { useDict } from '@/composables/useDict'
import { usePermission } from '@/composables/usePermission'

const props = withDefaults(
  defineProps<{
    columns: TableColumn<T>[]
    data: T[]
    loading?: boolean
    stripe?: boolean
    border?: boolean
    rowKey?: string | ((row: T) => string)
    selectable?: boolean
    emptyText?: string
  }>(),
  {
    loading: false,
    stripe: false,
    border: true,
    selectable: false,
    emptyText: '暂无数据',
  },
)

const emit = defineEmits<{
  (e: 'selection-change', rows: T[]): void
  (e: 'sort-change', payload: { prop: string; order: string }): void
}>()

// 收集字典编码，统一加载一次
const dictCodes = computed(() => props.columns.map((c) => c.dict).filter((d): d is string => !!d))
const uniqueDictCodes = computed(() => [...new Set(dictCodes.value)])
const { getLabel, getTagType } = useDict(...uniqueDictCodes.value)

const { hasPerm } = usePermission()

function visibleActions(row: T): TableAction<T>[] {
  return (props.columns.flatMap((c) => c.actions ?? []) as TableAction<T>[]).filter(
    (a) => (!a.perm || hasPerm(a.perm)) && (!a.show || a.show(row)),
  )
}

async function handleAction(action: TableAction<T>, row: T) {
  if (action.disabled?.(row)) return
  if (action.confirm) {
    try {
      await ElMessageBox.confirm(action.confirm, '提示', { type: 'warning' })
    } catch {
      return
    }
  }
  action.onClick(row)
}

function onSelectionChange(rows: T[]) {
  emit('selection-change', rows)
}
</script>

<template>
  <ElTable
    v-loading="loading"
    :data="data"
    :stripe="stripe"
    :border="border"
    :row-key="rowKey as any"
    :empty-text="emptyText"
    style="width: 100%"
    @selection-change="onSelectionChange"
  >
    <ElTableColumn v-if="selectable" type="selection" width="48" fixed="left" />

    <template v-for="col in columns" :key="col.prop">
      <ElTableColumn
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
        :min-width="col.minWidth"
        :fixed="col.fixed"
        :align="col.align || 'left'"
        :header-align="col.headerAlign"
        :sortable="col.sortable"
        :show-overflow-tooltip="col.showOverflowTooltip ?? true"
        :type="col.type"
      >
        <template #default="{ row, $index }">
          <!-- 自定义插槽 -->
          <slot v-if="col.slot" :name="col.slot" :row="row" :index="$index" />
          <!-- 字典渲染 -->
          <el-tag
            v-else-if="col.dict"
            :type="(getTagType(col.dict, (row as any)[col.prop]) as any) || 'info'"
            size="small"
          >
            {{ getLabel(col.dict, (row as any)[col.prop]) }}
          </el-tag>
          <!-- 格式化 -->
          <span v-else-if="col.formatter">
            {{ col.formatter(row, col, (row as any)[col.prop], $index) }}
          </span>
          <span v-else>{{ (row as any)[col.prop] ?? '-' }}</span>
        </template>
      </ElTableColumn>
    </template>

    <!-- 操作列 -->
    <ElTableColumn
      v-if="columns.some((c) => c.actions?.length)"
      label="操作"
      fixed="right"
      :width="160"
    >
      <template #default="{ row }">
        <template v-for="action in visibleActions(row)" :key="action.label">
          <ElButton
            :type="action.danger ? 'danger' : 'primary'"
            :disabled="action.disabled?.(row)"
            link
            size="small"
            @click="handleAction(action as TableAction<T>, row)"
          >
            {{ action.label }}
          </ElButton>
        </template>
      </template>
    </ElTableColumn>

    <template #empty>
      <slot name="empty">
        <span>{{ emptyText }}</span>
      </slot>
    </template>
  </ElTable>
</template>
