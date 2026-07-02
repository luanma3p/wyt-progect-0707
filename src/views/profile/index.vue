<script setup lang="ts">
import { ElMessage } from 'element-plus'
import type { FormInstance, FormItemRule } from 'element-plus'
import { useUserStore } from '@/stores/modules/user'

defineOptions({ name: 'Profile' })

const userStore = useUserStore()
const info = computed(() => userStore.userInfo)

const pwdFormRef = ref<FormInstance>()
const pwdLoading = ref(false)
const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const validateConfirm = (_rule: unknown, value: string, callback: (err?: Error) => void) => {
  if (value !== pwdForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const pwdRules: Record<string, FormItemRule[]> = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码不少于 6 位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' },
  ],
}

async function handleChangePwd() {
  try {
    await pwdFormRef.value?.validate()
  } catch {
    return
  }
  pwdLoading.value = true
  // Mock：无真实接口，模拟提交
  setTimeout(() => {
    pwdLoading.value = false
    ElMessage.success('密码修改成功（演示）')
    pwdFormRef.value?.resetFields()
  }, 500)
}
</script>

<template>
  <BasePage title="个人中心">
    <el-row :gutter="16">
      <el-col :span="14">
        <el-card shadow="never">
          <template #header>基本信息</template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="昵称">{{ info?.nickname ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="用户名">{{ info?.username ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ info?.email ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="手机">{{ info?.phone ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="部门">{{ info?.deptName ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="角色">
              <el-tag v-for="r in info?.roles ?? []" :key="r" size="small" class="role-tag">
                {{ r }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <el-col :span="10">
        <el-card shadow="never">
          <template #header>修改密码</template>
          <el-form
            ref="pwdFormRef"
            :model="pwdForm"
            :rules="pwdRules"
            label-width="90px"
          >
            <el-form-item label="原密码" prop="oldPassword">
              <el-input v-model="pwdForm.oldPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="pwdForm.newPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="pwdForm.confirmPassword" type="password" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="pwdLoading" @click="handleChangePwd">
                确认修改
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </BasePage>
</template>

<style scoped lang="scss">
.role-tag {
  margin-right: 4px;
}
</style>
