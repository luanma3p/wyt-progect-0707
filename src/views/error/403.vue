<script setup lang="ts">
defineOptions({ name: 'Forbidden' })

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="error-page">
    <el-result icon="error" title="403" sub-title="抱歉，您没有权限访问该页面">
      <template #extra>
        <el-button type="primary" @click="goHome">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped lang="scss">
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}
</style>
