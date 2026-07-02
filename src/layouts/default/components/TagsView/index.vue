<script setup lang="ts">
import { Close } from '@element-plus/icons-vue'
import { useTagsViewStore } from '@/stores/modules/tagsView'
import type { ViewTag } from '@/types/common'

const tagsViewStore = useTagsViewStore()
const route = useRoute()
const router = useRouter()

const visitedViews = computed(() => tagsViewStore.visitedViews)

const contextMenu = reactive({
  visible: false,
  top: 0,
  left: 0,
  tag: null as ViewTag | null,
})

function isActive(tag: ViewTag): boolean {
  return tag.path === route.path
}

function clickTag(tag: ViewTag) {
  if (!isActive(tag)) router.push(tag.path)
}

function closeTag(tag: ViewTag) {
  if (tag.affix) return
  const views = tagsViewStore.removeView(tag)
  if (isActive(tag)) {
    const latest = views[views.length - 1]
    router.push(latest ? latest.path : '/')
  }
}

function openContextMenu(e: MouseEvent, tag: ViewTag) {
  contextMenu.tag = tag
  contextMenu.left = e.clientX
  contextMenu.top = e.clientY
  contextMenu.visible = true
  document.addEventListener('click', closeContextMenu)
}

function closeContextMenu() {
  contextMenu.visible = false
  document.removeEventListener('click', closeContextMenu)
}

function refreshSelected() {
  if (!contextMenu.tag) return
  router.replace({ path: `/redirect${contextMenu.tag.path}` })
  closeContextMenu()
}

function closeOthers() {
  if (!contextMenu.tag) return
  tagsViewStore.removeOtherViews(contextMenu.tag)
  router.push(contextMenu.tag.path)
  closeContextMenu()
}

function closeAll() {
  tagsViewStore.removeAllViews()
  router.push('/')
  closeContextMenu()
}

onBeforeUnmount(() => {
  document.removeEventListener('click', closeContextMenu)
})
</script>

<template>
  <div class="tags-view">
    <el-scrollbar>
      <div class="tags-view__list">
        <div
          v-for="tag in visitedViews"
          :key="tag.path"
          class="tags-view__item"
          :class="{ 'is-active': isActive(tag) }"
          @click="clickTag(tag)"
          @contextmenu.prevent="openContextMenu($event, tag)"
        >
          <span class="tags-view__dot" />
          <span class="tags-view__title">{{ tag.title }}</span>
          <el-icon
            v-if="!tag.affix"
            class="tags-view__close"
            @click.stop="closeTag(tag)"
          >
            <Close />
          </el-icon>
        </div>
      </div>
    </el-scrollbar>

    <ul
      v-show="contextMenu.visible"
      class="context-menu"
      :style="{ top: contextMenu.top + 'px', left: contextMenu.left + 'px' }"
    >
      <li @click="refreshSelected">刷新</li>
      <li v-if="contextMenu.tag && !contextMenu.tag.affix" @click="closeTag(contextMenu.tag!); closeContextMenu()">
        关闭
      </li>
      <li @click="closeOthers">关闭其他</li>
      <li @click="closeAll">关闭所有</li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.tags-view {
  height: $tagsview-height;
  background-color: $bg-card;
  border-bottom: 1px solid $border-lighter;
  display: flex;
  align-items: center;
  padding: 0 $spacing-sm;
  z-index: $z-tagsview;
  &__list {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    white-space: nowrap;
  }
  &__item {
    display: inline-flex;
    align-items: center;
    height: 26px;
    padding: 0 $spacing-sm;
    border: 1px solid $border-light;
    border-radius: $radius-sm;
    font-size: 12px;
    color: $text-regular;
    cursor: pointer;
    user-select: none;
    &:hover {
      color: $color-primary;
    }
    &.is-active {
      background-color: $color-primary;
      border-color: $color-primary;
      color: #fff;
      .tags-view__dot {
        background: #fff;
      }
    }
  }
  &__dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: $radius-circle;
    background-color: $color-primary;
    margin-right: $spacing-xs;
  }
  &__close {
    margin-left: $spacing-xs;
    border-radius: $radius-circle;
    &:hover {
      background-color: rgba(0, 0, 0, 0.2);
    }
  }
}
.context-menu {
  position: fixed;
  list-style: none;
  margin: 0;
  padding: $spacing-xs 0;
  background: $bg-card;
  border: 1px solid $border-lighter;
  border-radius: $radius-md;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: $z-dropdown;
  li {
    padding: $spacing-xs $spacing-md;
    font-size: 13px;
    cursor: pointer;
    &:hover {
      background-color: $border-extra-light;
    }
  }
}
</style>
