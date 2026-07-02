<script setup lang="ts">
interface Props {
  title?: string
  /** 是否启用内边距，默认 true */
  padded?: boolean
}
withDefaults(defineProps<Props>(), {
  padded: true,
})
</script>

<template>
  <div class="base-page" :class="{ 'base-page--padded': padded }">
    <div v-if="title || $slots.toolbar" class="base-page__header">
      <h2 v-if="title" class="base-page__title">{{ title }}</h2>
      <div v-if="$slots.toolbar" class="base-page__toolbar">
        <slot name="toolbar" />
      </div>
    </div>
    <div class="base-page__body">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.base-page {
  &--padded {
    padding: $spacing-md;
  }
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-md;
  }
  &__title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: $text-primary;
  }
}
</style>
