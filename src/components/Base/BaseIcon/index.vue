<script setup lang="ts">
interface Props {
  /** 图标名称（对应 src/assets/icons 下的 svg 文件名） */
  name: string
  /** 尺寸，数字按 px，字符串原样 */
  size?: number | string
  /** 颜色，默认 currentColor */
  color?: string
}
const props = withDefaults(defineProps<Props>(), {
  size: '1em',
})
const sizeStyle = computed(() => ({
  width: typeof props.size === 'number' ? `${props.size}px` : props.size,
  height: typeof props.size === 'number' ? `${props.size}px` : props.size,
  color: props.color,
}))
</script>

<template>
  <svg aria-hidden="true" class="base-icon" :style="sizeStyle">
    <use :xlink:href="`#icon-${name}`" />
  </svg>
</template>

<style scoped>
.base-icon {
  display: inline-block;
  vertical-align: middle;
  fill: currentColor;
}
</style>
