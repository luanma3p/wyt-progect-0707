<script setup lang="ts">
import { useAppStore } from '@/stores/modules/app'
import Sidebar from './components/Sidebar/index.vue'
import Navbar from './components/Navbar/index.vue'
import TagsView from './components/TagsView/index.vue'
import AppMain from './components/AppMain/index.vue'

const appStore = useAppStore()
const collapsed = computed(() => appStore.sidebarCollapsed)

// 响应式设备检测
function handleResize() {
  const width = document.documentElement.clientWidth
  if (width < 768) {
    appStore.setDevice('mobile')
    appStore.setSidebar(true)
  } else {
    appStore.setDevice('desktop')
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="layout-wrapper" :class="{ 'is-collapsed': collapsed }">
    <Sidebar />
    <div class="layout-main">
      <Navbar />
      <TagsView />
      <AppMain />
    </div>
  </div>
</template>

<style scoped lang="scss">
.layout-wrapper {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}
</style>
