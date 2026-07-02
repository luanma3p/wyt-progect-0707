<script setup lang="ts">
interface Props {
  description?: string
  imageSize?: number
}
withDefaults(defineProps<Props>(), {
  description: '暂无数据',
  imageSize: 80,
})
</script>

<template>
  <div class="base-empty">
    <el-empty :description="description" :image-size="imageSize">
      <template v-if="$slots.image" #image>
        <slot name="image" />
      </template>
      <template v-if="$slots.action" #default>
        <slot name="action" />
      </template>
    </el-empty>
  </div>
</template>

<style scoped lang="scss">
.base-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-lg 0;
}
</style>
