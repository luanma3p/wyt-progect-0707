<script setup lang="ts">
import { ElMessage } from 'element-plus'
import BaseForm from '@/components/Base/BaseForm/index.vue'
import type { FormField } from '@/components/Base/BaseForm/types'
import type { TableColumn } from '@/components/Base/BaseTable/types'
import { useTable } from '@/composables/useTable'
import { teacherService } from '@/service/teacher.service'
import type { TeacherListItem, TeacherListReq, TeacherForm } from '@/service/teacher.service'
import { TeacherStatus } from '@/enums/business'

defineOptions({ name: 'TeacherList' })

const router = useRouter()

// ==================== 搜索 ====================
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

const statusMapping: Record<
  string,
  { text: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' }
> = {
  pending: { text: '待审核', type: 'warning' },
  approved: { text: '已通过', type: 'success' },
  rejected: { text: '已驳回', type: 'danger' },
  disabled: { text: '已停用', type: 'info' },
}

const subjectOptions = [
  { label: '数学', value: '数学' },
  { label: '语文', value: '语文' },
  { label: '英语', value: '英语' },
  { label: '物理', value: '物理' },
  { label: '化学', value: '化学' },
  { label: '生物', value: '生物' },
  { label: '历史', value: '历史' },
  { label: '地理', value: '地理' },
]

const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
]

// ==================== 表格 ====================
const columns: TableColumn<TeacherListItem>[] = [
  {
    prop: 'name',
    label: '教师',
    slot: 'name',
    minWidth: 160,
    actions: [
      { label: '详情', onClick: (row) => router.push(`/teacher/detail/${row.id}`) },
      { label: '编辑', onClick: (row) => openDialog('edit', row) },
      {
        label: '审核',
        show: (row) => row.status === TeacherStatus.PENDING,
        onClick: (row) => openAudit(row),
      },
      {
        label: '停用',
        danger: true,
        show: (row) => row.status === TeacherStatus.APPROVED,
        confirm: '确认停用该教师？',
        onClick: (row) => handleToggle(row, TeacherStatus.DISABLED),
      },
      {
        label: '启用',
        show: (row) => row.status === TeacherStatus.DISABLED,
        onClick: (row) => handleToggle(row, TeacherStatus.APPROVED),
      },
      {
        label: '删除',
        danger: true,
        confirm: '确认删除该教师？删除后不可恢复。',
        onClick: (row) => handleDelete(row),
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
  { prop: 'createdAt', label: '入驻时间', width: 160 },
]

const { loading, list, total, page, query, search, reset, reload, onPageChange, onSizeChange } =
  useTable<TeacherListItem, TeacherListReq>(teacherService.fetchList, { defaultPageSize: 10 })

// ==================== 新增/编辑弹窗 ====================
const formFields: FormField[] = [
  { prop: 'name', label: '教师姓名', type: 'input', required: true },
  { prop: 'phone', label: '手机号', type: 'input', required: true },
  {
    prop: 'gender',
    label: '性别',
    type: 'radio',
    required: true,
    options: genderOptions,
  },
  {
    prop: 'subject',
    label: '学科',
    type: 'select',
    required: true,
    options: subjectOptions,
  },
  { prop: 'email', label: '邮箱', type: 'input' },
  { prop: 'intro', label: '简介', type: 'textarea', span: 24 },
]

const formRef = ref<InstanceType<typeof BaseForm>>()
const dialogVisible = ref(false)
const dialogLoading = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const form = reactive<TeacherForm>({
  name: '',
  phone: '',
  gender: 'male',
  subject: '',
  email: '',
  intro: '',
})

function openDialog(mode: 'create' | 'edit', row?: TeacherListItem) {
  dialogMode.value = mode
  Object.assign(form, {
    id: row?.id,
    name: row?.name ?? '',
    phone: row?.phone ?? '',
    gender: row?.gender ?? 'male',
    subject: row?.subject ?? '',
    email: (row as any)?.email ?? '',
    intro: (row as any)?.intro ?? '',
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  dialogLoading.value = true
  try {
    await teacherService.save({ ...form })
    ElMessage.success(dialogMode.value === 'create' ? '新增成功' : '更新成功')
    dialogVisible.value = false
    reload()
  } finally {
    dialogLoading.value = false
  }
}

async function handleDelete(row: TeacherListItem) {
  await teacherService.remove(row.id)
  ElMessage.success('删除成功')
  reload()
}

// ==================== 审核弹窗 ====================
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

const auditFormRef = ref<InstanceType<typeof BaseForm>>()
const auditDialogVisible = ref(false)
const auditDialogLoading = ref(false)
const auditForm = reactive({ id: '', action: 'approve' as 'approve' | 'reject', remark: '' })

function openAudit(row: TeacherListItem) {
  auditForm.id = row.id
  auditForm.action = 'approve'
  auditForm.remark = ''
  auditDialogVisible.value = true
}

async function handleAuditSubmit() {
  try {
    await auditFormRef.value?.validate()
  } catch {
    return
  }
  auditDialogLoading.value = true
  try {
    await teacherService.audit({
      id: auditForm.id,
      action: auditForm.action,
      remark: auditForm.remark,
    })
    ElMessage.success('审核已提交')
    auditDialogVisible.value = false
    reload()
  } finally {
    auditDialogLoading.value = false
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
    <template #toolbar>
      <el-button type="primary" @click="openDialog('create')">新增教师</el-button>
    </template>

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

    <!-- 新增/编辑弹窗 -->
    <BaseDialog
      v-model:visible="dialogVisible"
      :title="dialogMode === 'create' ? '新增教师' : '编辑教师'"
      :loading="dialogLoading"
      width="560px"
      @confirm="handleSubmit"
    >
      <BaseForm
        ref="formRef"
        :fields="formFields"
        :model-value="form"
        label-width="90px"
        @update:model-value="(v) => Object.assign(form, v)"
      />
    </BaseDialog>

    <!-- 审核弹窗 -->
    <BaseDialog
      v-model:visible="auditDialogVisible"
      title="教师审核"
      :loading="auditDialogLoading"
      width="480px"
      @confirm="handleAuditSubmit"
    >
      <BaseForm
        ref="auditFormRef"
        :fields="auditFields"
        :model-value="auditForm"
        label-width="90px"
        @update:model-value="(v) => Object.assign(auditForm, v)"
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
