<script setup lang="ts">
import { ElDialog } from 'element-plus'

const props = withDefaults(
  defineProps<{
    visible: boolean
    title?: string
    width?: string | number
    loading?: boolean
    footer?: boolean
    closeOnClickModal?: boolean
    destroyOnClose?: boolean
  }>(),
  {
    title: '',
    width: '500px',
    loading: false,
    footer: true,
    closeOnClickModal: false,
    destroyOnClose: false,
  },
)

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

function handleClose() {
  emit('update:visible', false)
  emit('cancel')
}

function handleConfirm() {
  emit('confirm')
}
</script>

<template>
  <ElDialog
    :model-value="visible"
    :title="title"
    :width="width"
    :close-on-click-modal="closeOnClickModal"
    :destroy-on-close="destroyOnClose"
    @update:model-value="(v: boolean) => emit('update:visible', v)"
    @close="handleClose"
  >
    <div v-loading="loading">
      <slot />
    </div>

    <template v-if="footer" #footer>
      <slot name="footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleConfirm">确认</el-button>
      </slot>
    </template>
  </ElDialog>
</template>
