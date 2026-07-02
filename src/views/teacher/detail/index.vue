<script setup lang="ts">
import { teacherService } from '@/service/teacher.service'
import type { TeacherDetailResp } from '@/service/teacher.service'
import { TeacherStatus } from '@/enums/business'

defineOptions({ name: 'TeacherDetail' })

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const detail = ref<TeacherDetailResp | null>(null)

const statusMapping: Record<string, { text: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' }> = {
  pending: { text: '待审核', type: 'warning' },
  approved: { text: '已通过', type: 'success' },
  rejected: { text: '已驳回', type: 'danger' },
  disabled: { text: '已停用', type: 'info' },
}

async function loadDetail() {
  loading.value = true
  try {
    const id = String(route.params.id)
    detail.value = await teacherService.fetchDetail(id)
  } finally {
    loading.value = false
  }
}

onMounted(loadDetail)
</script>

<template>
  <BasePage title="教师详情">
    <div v-loading="loading">
      <el-button :icon="undefined" plain @click="router.back()" style="margin-bottom: 16px">
        返回
      </el-button>

      <el-card shadow="never" v-if="detail">
        <template #header>基本信息</template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="姓名">{{ detail.name }}</el-descriptions-item>
          <el-descriptions-item label="手机">{{ detail.phone }}</el-descriptions-item>
          <el-descriptions-item label="性别">
            {{ detail.gender === 'male' ? '男' : detail.gender === 'female' ? '女' : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="学科">{{ detail.subject }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ detail.email }}</el-descriptions-item>
          <el-descriptions-item label="身份证号">{{ detail.idCard }}</el-descriptions-item>
          <el-descriptions-item label="评分">{{ detail.rating }}</el-descriptions-item>
          <el-descriptions-item label="学员数">{{ detail.studentCount }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <StatusBadge :status="detail.status" :mapping="statusMapping" />
          </el-descriptions-item>
          <el-descriptions-item label="简介" :span="3">{{ detail.intro || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card shadow="never" class="section-card" v-if="detail">
        <template #header>资质信息</template>
        <el-table :data="detail.qualifications" stripe>
          <el-table-column prop="name" label="资质名称" />
          <el-table-column prop="type" label="类型" width="120" />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <StatusBadge :status="row.status" :mapping="statusMapping" />
            </template>
          </el-table-column>
          <el-table-column prop="auditor" label="审核人" width="120" />
          <el-table-column prop="auditedAt" label="审核时间" width="140" />
          <el-table-column prop="remark" label="备注" />
        </el-table>
      </el-card>

      <el-card shadow="never" class="section-card" v-if="detail">
        <template #header>跟进记录</template>
        <el-timeline v-if="detail.followRecords?.length">
          <el-timeline-item
            v-for="record in detail.followRecords"
            :key="record.id"
            :timestamp="record.createdAt"
          >
            <div class="follow-content">{{ record.content }}</div>
            <div class="follow-operator">操作人：{{ record.operator }}</div>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无跟进记录" />
      </el-card>
    </div>
  </BasePage>
</template>

<style scoped lang="scss">
.section-card {
  margin-top: $spacing-md;
}

.follow-content {
  font-size: 14px;
  color: $text-primary;
}

.follow-operator {
  margin-top: 4px;
  font-size: 12px;
  color: $text-secondary;
}
</style>
