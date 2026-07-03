<script setup lang="ts">
import type { AppRouteRecord } from '@/router/types'

interface Props {
  item: AppRouteRecord
  basePath?: string
}
const props = withDefaults(defineProps<Props>(), {
  basePath: '',
})

const visibleChildren = computed(() => (props.item.children ?? []).filter((c) => !c.meta?.hidden))

/** 单可见子菜单且非 alwaysShow：直接渲染该子菜单为叶子节点（减少层级） */
const showingChild = computed(() => {
  if (visibleChildren.value.length === 1 && !props.item.meta?.alwaysShow) {
    return visibleChildren.value[0]
  }
  return null
})

function resolvePath(routePath: string): string {
  return resolvePathWithBase(routePath, props.basePath)
}

function resolvePathWithBase(routePath: string, basePath: string): string {
  if (!routePath) return ''
  if (routePath.startsWith('http')) return routePath
  if (routePath.startsWith('/')) return routePath
  return `${basePath}/${routePath}`.replace(/\/+/g, '/')
}
</script>

<template>
  <!-- 单子菜单：直接渲染为 menu-item -->
  <el-menu-item
    v-if="showingChild && !showingChild.children?.length"
    :index="resolvePathWithBase(showingChild.path, resolvePath(item.path))"
  >
    <el-icon v-if="showingChild.meta?.icon">
      <BaseIcon :name="String(showingChild.meta.icon)" />
    </el-icon>
    <template #title>{{ showingChild.meta?.title }}</template>
  </el-menu-item>

  <!-- 多子菜单：el-sub-menu 递归 -->
  <el-sub-menu v-else-if="visibleChildren.length > 0" :index="resolvePath(item.path)">
    <template #title>
      <el-icon v-if="item.meta?.icon">
        <BaseIcon :name="String(item.meta.icon)" />
      </el-icon>
      <span>{{ item.meta?.title }}</span>
    </template>
    <SidebarItem
      v-for="child in visibleChildren"
      :key="child.path"
      :item="child"
      :base-path="resolvePath(item.path)"
    />
  </el-sub-menu>

  <!-- 叶子菜单 -->
  <el-menu-item v-else :index="resolvePath(item.path)">
    <el-icon v-if="item.meta?.icon">
      <BaseIcon :name="String(item.meta.icon)" />
    </el-icon>
    <template #title>{{ item.meta?.title }}</template>
  </el-menu-item>
</template>
