<script setup lang="ts">
import { ElMessage } from 'element-plus'
import type { FormInstance, FormItemRule } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'
import type { LoginReq } from '@/api/types/auth'

defineOptions({ name: 'Login' })

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive<LoginReq>({
  username: 'admin',
  password: '123456',
  remember: true,
})

const rules: Record<string, FormItemRule[]> = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码不少于 6 位', trigger: 'blur' },
  ],
}

async function handleLogin() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  loading.value = true
  try {
    await userStore.login({
      username: form.username,
      password: form.password,
      remember: form.remember,
    })
    const redirect = (route.query.redirect as string) || '/'
    ElMessage.success('登录成功')
    router.replace(redirect)
  } catch (err) {
    ElMessage.error((err as Error)?.message || '登录失败，请检查用户名或密码')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <div class="login-brand__logo">伴</div>
        <h1 class="login-brand__title">伴学老师后台管理系统</h1>
        <p class="login-brand__subtitle">Banxue Teacher Admin</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        size="large"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>
        <div class="login-form__row">
          <el-checkbox v-model="form.remember">记住我</el-checkbox>
        </div>
        <el-button
          type="primary"
          :loading="loading"
          class="login-form__submit"
          @click="handleLogin"
        >
          登 录
        </el-button>
      </el-form>

      <p class="login-tip">演示账号：admin / 123456（超管）· teacher / 123456（教师）</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1f6feb 0%, #6a5acd 100%);
}

.login-card {
  width: 380px;
  padding: $spacing-xl $spacing-lg;
  background: $bg-card;
  border-radius: $radius-lg;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
}

.login-brand {
  margin-bottom: $spacing-lg;
  text-align: center;

  &__logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    margin-bottom: $spacing-sm;
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    background: $color-primary;
    border-radius: $radius-circle;
  }

  &__title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: $text-primary;
  }

  &__subtitle {
    margin: 4px 0 0;
    font-size: 12px;
    color: $text-secondary;
  }
}

.login-form {
  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-md;
  }

  &__submit {
    width: 100%;
  }
}

.login-tip {
  margin: $spacing-md 0 0;
  font-size: 12px;
  color: $text-secondary;
  text-align: center;
}
</style>
