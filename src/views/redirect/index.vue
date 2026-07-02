<script setup lang="ts">
defineOptions({ name: 'Redirect' })

const route = useRoute()
const router = useRouter()

onBeforeMount(() => {
  const { params, query } = route
  const path = params.path as string | string[]
  router.replace({
    path: '/' + (Array.isArray(path) ? path.join('/') : path),
    query,
  })
})
</script>

<template>
  <div />
</template>
