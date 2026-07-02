<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
}
defineProps<Props>()
</script>

<template>
  <div class="page-header">
    <div class="page-header__left">
      <h2 class="page-header__title">{{ title }}</h2>
      <span v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</span>
    </div>
    <div v-if="$slots.actions" class="page-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-md;
  &__title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: $text-primary;
  }
  &__subtitle {
    margin-left: $spacing-sm;
    font-size: 13px;
    color: $text-secondary;
  }
}
</style>
