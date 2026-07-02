import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'
import type { ViewTag } from '@/types/common'

function tagFromRoute(route: RouteLocationNormalized): ViewTag {
  return {
    name: String(route.name ?? route.path),
    path: route.path,
    title: (route.meta?.title as string) || route.path,
    affix: route.meta?.affix as boolean | undefined,
    cache: route.meta?.cache as boolean | undefined,
    noCache: route.meta?.noTagsView as boolean | undefined,
    query: route.query,
    params: route.params,
  }
}

export const useTagsViewStore = defineStore('tagsView', () => {
  const visitedViews = ref<ViewTag[]>([])
  const cachedViews = ref<string[]>([])

  function addView(route: RouteLocationNormalized): void {
    if (route.meta?.noTagsView) return
    const tag = tagFromRoute(route)
    if (visitedViews.value.some((v) => v.path === tag.path)) {
      // 更新 query/params
      const idx = visitedViews.value.findIndex((v) => v.path === tag.path)
      visitedViews.value[idx] = { ...visitedViews.value[idx], ...tag }
    } else {
      visitedViews.value.push(tag)
    }
    if (tag.cache !== false && tag.noCache !== true && route.name) {
      const name = String(route.name)
      if (!cachedViews.value.includes(name)) cachedViews.value.push(name)
    }
  }

  function removeView(tag: ViewTag): ViewTag[] {
    const idx = visitedViews.value.findIndex((v) => v.path === tag.path)
    if (idx > -1) visitedViews.value.splice(idx, 1)
    if (tag.name && cachedViews.value.includes(tag.name)) {
      cachedViews.value = cachedViews.value.filter((n) => n !== tag.name)
    }
    return visitedViews.value
  }

  function removeOtherViews(tag: ViewTag): void {
    visitedViews.value = visitedViews.value.filter((v) => v.affix || v.path === tag.path)
    cachedViews.value = cachedViews.value.filter((n) => n === tag.name)
  }

  function removeAllViews(): void {
    visitedViews.value = visitedViews.value.filter((v) => v.affix)
    cachedViews.value = []
  }

  function removeLeftViews(tag: ViewTag): void {
    const idx = visitedViews.value.findIndex((v) => v.path === tag.path)
    if (idx <= 0) return
    visitedViews.value = visitedViews.value.filter(
      (v, i) => v.affix || i >= idx,
    )
  }

  function removeRightViews(tag: ViewTag): void {
    const idx = visitedViews.value.findIndex((v) => v.path === tag.path)
    if (idx === -1) return
    visitedViews.value = visitedViews.value.filter(
      (v, i) => v.affix || i <= idx,
    )
  }

  function updateVisitedView(tag: ViewTag, patch: Partial<ViewTag>): void {
    const idx = visitedViews.value.findIndex((v) => v.path === tag.path)
    if (idx > -1) visitedViews.value[idx] = { ...visitedViews.value[idx], ...patch }
  }

  return {
    visitedViews,
    cachedViews,
    addView,
    removeView,
    removeOtherViews,
    removeAllViews,
    removeLeftViews,
    removeRightViews,
    updateVisitedView,
  }
})
