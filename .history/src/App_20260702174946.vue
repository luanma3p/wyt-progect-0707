<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useAppStore } from '@/stores/modules/app'

const appStore = useAppStore()
const size = computed(() => appStore.size)
</script>

<template>
  <ElConfigProvider :locale="zhCn" :size="size">
    <RouterView />
  </ElConfigProvider>
</template>
