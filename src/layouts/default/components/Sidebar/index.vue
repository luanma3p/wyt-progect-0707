<script setup lang="ts">
import { useAppStore } from '@/stores/modules/app'
import { usePermissionStore } from '@/stores/modules/permission'
import { appSettings } from '@/config'
import SidebarItem from './SidebarItem.vue'

const appStore = useAppStore()
const permissionStore = usePermissionStore()
const route = useRoute()
const collapsed = computed(() => appStore.sidebarCollapsed)
const menus = computed(() => permissionStore.menus)
const activeMenu = computed(() => (route.meta?.activeMenu as string) || route.path)
</script>

<template>
  <aside class="sidebar" :class="{ 'is-collapsed': collapsed }">
    <div class="sidebar__logo">
      <span v-if="!collapsed" class="sidebar__title">{{ appSettings.title }}</span>
      <span v-else class="sidebar__title-mini">{{ appSettings.logoText }}</span>
    </div>
    <el-scrollbar class="sidebar__menu-wrap">
      <el-menu
        :default-active="activeMenu"
        :collapse="collapsed"
        :collapse-transition="false"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
        router
      >
        <SidebarItem
          v-for="route in menus"
          :key="route.path"
          :item="route"
          base-path=""
        />
      </el-menu>
    </el-scrollbar>
  </aside>
</template>

<style scoped lang="scss">
.sidebar {
  width: $sidebar-width;
  height: 100%;
  background-color: #304156;
  transition: width 0.28s;
  overflow: hidden;
  flex-shrink: 0;
  &.is-collapsed {
    width: $sidebar-collapsed-width;
  }
  &__logo {
    height: $header-height;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    overflow: hidden;
    white-space: nowrap;
  }
  &__title {
    font-size: 16px;
    font-weight: 700;
  }
  &__title-mini {
    font-size: 18px;
    font-weight: 700;
  }
  &__menu-wrap {
    height: calc(100% - #{$header-height});
  }
}
:deep(.el-menu) {
  border-right: none;
}
</style>
