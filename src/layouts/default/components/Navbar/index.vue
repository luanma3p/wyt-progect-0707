<script setup lang="ts">
import { Fold, Expand, Sunny, Moon, CaretBottom } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/modules/app'
import { useUserStore } from '@/stores/modules/user'
import Breadcrumb from '../Breadcrumb/index.vue'

const appStore = useAppStore()
const userStore = useUserStore()
const router = useRouter()

function toggleSidebar() {
  appStore.toggleSidebar()
}

function toggleTheme() {
  appStore.toggleTheme()
}

async function handleCommand(command: string) {
  if (command === 'logout') {
    await userStore.logout()
    router.push('/login')
  } else if (command === 'profile') {
    router.push('/profile')
  }
}
</script>

<template>
  <header class="navbar">
    <div class="navbar__left">
      <el-icon class="navbar__toggle" @click="toggleSidebar">
        <Fold v-if="!appStore.sidebarCollapsed" />
        <Expand v-else />
      </el-icon>
      <Breadcrumb />
    </div>
    <div class="navbar__right">
      <el-tooltip :content="appStore.isDark ? '切换浅色' : '切换深色'" placement="bottom">
        <el-icon class="navbar__action" @click="toggleTheme">
          <Sunny v-if="appStore.isDark" />
          <Moon v-else />
        </el-icon>
      </el-tooltip>
      <el-dropdown @command="handleCommand">
        <span class="navbar__user">
          <el-avatar :size="28" :src="userStore.userInfo?.avatar" />
          <span class="navbar__username">{{ userStore.userInfo?.nickname ?? '用户' }}</span>
          <el-icon><CaretBottom /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人中心</el-dropdown-item>
            <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<style scoped lang="scss">
.navbar {
  height: $header-height;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-md;
  background-color: $bg-card;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: $z-header;
  &__left {
    display: flex;
    align-items: center;
  }
  &__toggle {
    font-size: 20px;
    cursor: pointer;
    margin-right: $spacing-sm;
  }
  &__right {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }
  &__action {
    font-size: 18px;
    cursor: pointer;
  }
  &__user {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    cursor: pointer;
  }
  &__username {
    font-size: 14px;
    color: $text-regular;
  }
}
</style>
