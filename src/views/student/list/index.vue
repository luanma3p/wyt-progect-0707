<script setup lang="ts">
import { ElMessage } from 'element-plus'
import BaseForm from '@/components/Base/BaseForm/index.vue'
import type { FormField } from '@/components/Base/BaseForm/types'
import type { TableColumn } from '@/components/Base/BaseTable/types'
import { useTable } from '@/composables/useTable'
import { studentService } from '@/service/student.service'
import type { StudentListItem, StudentListReq, StudentFollowRecord } from '@/service/student.service'

defineOptions({ name: 'StudentList' })

const gradeOptions = [
  { label: '初一', value: '初一' },
  { label: '初二', value: '初二' },
  { label: '初三', value: '初三' },
  { label: '高一', value: '高一' },
  { label: '高二', value: '高二' },
  { label: '高三', value: '高三' },
]

const searchFields: FormField[] = [
  { prop: 'keyword', label: '关键词', type: 'input', placeholder: '姓名 / 手机', clearable: true },
  { prop: 'grade', label: '年级', type: 'select', clearable: true, options: gradeOptions },
]

const statusMapping: Record<string, { text: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' }> = {
  active: { text: '在读', type: 'success' },
  paused: { text: '暂停', type: 'warning' },
  stopped: { text: '停课', type: 'danger' },
}

const columns: TableColumn<StudentListItem>[] = [
  { prop: 'name', label: '学员', width: 120, actions: [
    { label: '跟进', onClick: (row) => openFollow(row) },
  ] },
  { prop: 'grade', label: '年级', width: 90 },
  { prop: 'phone', label: '手机', width: 130 },
  { prop: 'teacherName', label: '授课教师', width: 110 },
  { prop: 'courseCount', label: '课程数', width: 90 },
  { prop: 'totalHours', label: '总课时', width: 90 },
  { prop: 'lastFollowAt', label: '最近跟进', width: 160 },
  { prop: 'status', label: '状态', slot: 'status', width: 90 },
]

const { loading, list, total, page, query, search, reset, onPageChange, onSizeChange } =
  useTable<StudentListItem, StudentListReq>(studentService.fetchList, { defaultPageSize: 10 })

// 跟进弹窗
const followFields: FormField[] = [
  {
    prop: 'type',
    label: '跟进类型',
    type: 'select',
    required: true,
    options: [
      { label: '电话', value: 'phone' },
      { label: '微信', value: 'wechat' },
      { label: '面谈', value: 'meeting' },
      { label: '其他', value: 'other' },
    ],
  },
  { prop: 'content', label: '跟进内容', type: 'textarea', required: true },
]

const formRef = ref<InstanceType<typeof BaseForm>>()
const dialogVisible = ref(false)
const dialogLoading = ref(false)
const follows = ref<StudentFollowRecord[]>([])
const followsLoading = ref(false)
const form = reactive({ studentId: '', type: 'phone', content: '' })

async function openFollow(row: StudentListItem) {
  form.studentId = row.id
  form.type = 'phone'
  form.content = ''
  dialogVisible.value = true
  followsLoading.value = true
  try {
    follows.value = await studentService.fetchFollows(row.id)
  } finally {
    followsLoading.value = false
  }
}

async function handleFollowSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  dialogLoading.value = true
  try {
    await studentService.addFollow({
      studentId: form.studentId,
      type: form.type,
      content: form.content,
    })
    ElMessage.success('跟进已记录')
    follows.value = await studentService.fetchFollows(form.studentId)
    formRef.value?.resetFields()
    form.content = ''
  } finally {
    dialogLoading.value = false
  }
}
</script>

<template>
  <BasePage title="学员管理">
    <BaseSearch
      :fields="searchFields"
      :model-value="query"
      @update:model-value="(v) => Object.assign(query, v)"
      @search="search"
      @reset="reset"
    />

    <BaseTable :columns="columns" :data="list" :loading="loading" row-key="id">
      <template #status="{ row }">
        <StatusBadge :status="row.status" :mapping="statusMapping" />
      </template>
    </BaseTable>

    <BasePagination
      :page="page.pageNum"
      :page-size="page.pageSize"
      :total="total"
      @update:page="onPageChange"
      @update:page-size="onSizeChange"
    />

    <BaseDialog
      v-model:visible="dialogVisible"
      title="学员跟进"
      :loading="dialogLoading"
      width="560px"
      @confirm="handleFollowSubmit"
    >
      <div v-loading="followsLoading" class="follow-section">
        <h4 class="follow-section__title">历史跟进</h4>
        <el-timeline v-if="follows.length">
          <el-timeline-item
            v-for="record in follows"
            :key="record.id"
            :timestamp="record.createdAt"
          >
            <div>{{ record.content }}</div>
            <div class="follow-meta">{{ record.type }} · {{ record.operator }}</div>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无跟进记录" :image-size="60" />
      </div>

      <el-divider content-position="left">新增跟进</el-divider>

      <BaseForm
        ref="formRef"
        :fields="followFields"
        :model-value="form"
        label-width="90px"
        @update:model-value="(v) => Object.assign(form, v)"
      />
    </BaseDialog>
  </BasePage>
</template>

<style scoped lang="scss">
.follow-section {
  &__title {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 600;
    color: $text-primary;
  }
}

.follow-meta {
  margin-top: 2px;
  font-size: 12px;
  color: $text-secondary;
}
</style>
