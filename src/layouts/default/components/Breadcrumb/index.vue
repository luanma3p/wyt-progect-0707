<script setup lang="ts">
const route = useRoute()
const breadcrumbs = computed(() =>
  route.matched.filter((item) => item.meta?.title && !item.meta?.hidden),
)
</script>

<template>
  <el-breadcrumb class="breadcrumb" separator="/">
    <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path" :to="item.path">
      {{ item.meta?.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<style scoped>
.breadcrumb {
  margin-left: 8px;
  line-height: $header-height;
}
</style>
