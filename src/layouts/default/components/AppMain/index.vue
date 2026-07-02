<script setup lang="ts">
import { useTagsViewStore } from '@/stores/modules/tagsView'

const tagsViewStore = useTagsViewStore()
const cachedViews = computed(() => tagsViewStore.cachedViews)
</script>

<template>
  <main class="app-main">
    <router-view v-slot="{ Component }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="cachedViews">
          <component :is="Component" />
        </keep-alive>
      </transition>
    </router-view>
  </main>
</template>

<style scoped lang="scss">
.app-main {
  flex: 1;
  overflow: auto;
  background-color: $bg-page;
}
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}
.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
