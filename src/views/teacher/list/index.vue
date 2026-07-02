<script setup lang="ts">
import { ElMessage } from 'element-plus'
import BaseForm from '@/components/Base/BaseForm/index.vue'
import type { FormField } from '@/components/Base/BaseForm/types'
import type { TableColumn } from '@/components/Base/BaseTable/types'
import { useTable } from '@/composables/useTable'
import { teacherService } from '@/service/teacher.service'
import type { TeacherListItem, TeacherListReq, AuditTeacherReq } from '@/service/teacher.service'
import { TeacherStatus } from '@/enums/business'

defineOptions({ name: 'TeacherList' })

const router = useRouter()

const searchFields: FormField[] = [
  { prop: 'keyword', label: '关键词', type: 'input', placeholder: '姓名 / 手机', clearable: true },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    clearable: true,
    options: [
      { label: '待审核', value: TeacherStatus.PENDING },
      { label: '已通过', value: TeacherStatus.APPROVED },
      { label: '已驳回', value: TeacherStatus.REJECTED },
      { label: '已停用', value: TeacherStatus.DISABLED },
    ],
  },
]

const statusMapping: Record<string, { text: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' }> = {
  pending: { text: '待审核', type: 'warning' },
  approved: { text: '已通过', type: 'success' },
  rejected: { text: '已驳回', type: 'danger' },
  disabled: { text: '已停用', type: 'info' },
}

const columns: TableColumn<TeacherListItem>[] = [
  {
    prop: 'name',
    label: '教师',
    slot: 'name',
    minWidth: 160,
    actions: [
      { label: '详情', onClick: (row) => router.push(`/teacher/detail/${row.id}`) },
      {
        label: '审核',
        perm: 'teacher:audit',
        show: (row) => row.status === TeacherStatus.PENDING,
        onClick: (row) => openAudit(row),
      },
      {
        label: '停用',
        perm: 'teacher:disable',
        danger: true,
        show: (row) => row.status === TeacherStatus.APPROVED,
        onClick: (row) => handleToggle(row, TeacherStatus.DISABLED),
      },
      {
        label: '启用',
        perm: 'teacher:disable',
        show: (row) => row.status === TeacherStatus.DISABLED,
        onClick: (row) => handleToggle(row, TeacherStatus.APPROVED),
      },
    ],
  },
  { prop: 'phone', label: '手机', width: 130 },
  {
    prop: 'gender',
    label: '性别',
    width: 80,
    formatter: (_r, _c, v) => (v === 'male' ? '男' : v === 'female' ? '女' : '-'),
  },
  { prop: 'subject', label: '学科', width: 100 },
  { prop: 'status', label: '状态', slot: 'status', width: 100 },
  { prop: 'rating', label: '评分', width: 80 },
  { prop: 'studentCount', label: '学员数', width: 90 },
  { prop: 'createdAt', label: '入驻时间', width: 120 },
]

const { loading, list, total, page, query, search, reset, reload, onPageChange, onSizeChange } =
  useTable<TeacherListItem, TeacherListReq>(teacherService.fetchList, { defaultPageSize: 10 })

// 审核弹窗
const auditFields: FormField[] = [
  {
    prop: 'action',
    label: '审核结果',
    type: 'radio',
    required: true,
    options: [
      { label: '通过', value: 'approve' },
      { label: '驳回', value: 'reject' },
    ],
  },
  { prop: 'remark', label: '备注', type: 'textarea', placeholder: '驳回原因等' },
]

const formRef = ref<InstanceType<typeof BaseForm>>()
const dialogVisible = ref(false)
const dialogLoading = ref(false)
const form = reactive<AuditTeacherReq>({ id: '', action: 'approve', remark: '' })

function openAudit(row: TeacherListItem) {
  form.id = row.id
  form.action = 'approve'
  form.remark = ''
  dialogVisible.value = true
}

async function handleAuditSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  dialogLoading.value = true
  try {
    await teacherService.audit({ id: form.id, action: form.action, remark: form.remark })
    ElMessage.success('审核已提交')
    dialogVisible.value = false
    reload()
  } finally {
    dialogLoading.value = false
  }
}

async function handleToggle(row: TeacherListItem, status: TeacherStatus) {
  await teacherService.toggleStatus(row.id, status)
  ElMessage.success('操作成功')
  reload()
}
</script>

<template>
  <BasePage title="教师管理">
    <BaseSearch
      :fields="searchFields"
      :model-value="query"
      @update:model-value="(v) => Object.assign(query, v)"
      @search="search"
      @reset="reset"
    />

    <BaseTable :columns="columns" :data="list" :loading="loading" row-key="id">
      <template #name="{ row }">
        <div class="teacher-cell">
          <el-avatar :size="32" :src="row.avatar">{{ row.name?.charAt(0) }}</el-avatar>
          <span>{{ row.name }}</span>
        </div>
      </template>
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
      title="教师审核"
      :loading="dialogLoading"
      width="480px"
      @confirm="handleAuditSubmit"
    >
      <BaseForm
        ref="formRef"
        :fields="auditFields"
        :model-value="form"
        label-width="90px"
        @update:model-value="(v) => Object.assign(form, v)"
      />
    </BaseDialog>
  </BasePage>
</template>

<style scoped lang="scss">
.teacher-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
