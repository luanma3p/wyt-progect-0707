<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import BaseForm from '@/components/Base/BaseForm/index.vue'
import type { FormField } from '@/components/Base/BaseForm/types'
import type { TableColumn } from '@/components/Base/BaseTable/types'
import { useTable } from '@/composables/useTable'
import { courseService } from '@/service/course.service'
import type { CourseListItem, CourseListReq, CourseForm } from '@/service/course.service'
import { teacherService } from '@/service/teacher.service'
import { CourseStatus } from '@/enums/business'

defineOptions({ name: 'CourseManagement' })

const subjectOptions = [
  { label: '数学', value: '数学' },
  { label: '物理', value: '物理' },
  { label: '英语', value: '英语' },
  { label: '语文', value: '语文' },
  { label: '化学', value: '化学' },
]
const gradeOptions = [
  { label: '初一', value: '初一' },
  { label: '初二', value: '初二' },
  { label: '初三', value: '初三' },
  { label: '高一', value: '高一' },
  { label: '高二', value: '高二' },
  { label: '高三', value: '高三' },
]

const searchFields: FormField[] = [
  { prop: 'keyword', label: '关键词', type: 'input', placeholder: '课程名', clearable: true },
  { prop: 'subject', label: '学科', type: 'select', clearable: true, options: subjectOptions },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    clearable: true,
    options: [
      { label: '草稿', value: CourseStatus.DRAFT },
      { label: '已发布', value: CourseStatus.PUBLISHED },
      { label: '已下架', value: CourseStatus.OFFLINE },
    ],
  },
]

const statusMapping: Record<string, { text: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' }> = {
  draft: { text: '草稿', type: 'info' },
  published: { text: '已发布', type: 'success' },
  offline: { text: '已下架', type: 'warning' },
}

const columns: TableColumn<CourseListItem>[] = [
  { prop: 'name', label: '课程名称', minWidth: 180, actions: [
    { label: '编辑', onClick: (row) => openDialog('edit', row) },
    { label: '删除', danger: true, confirm: '确认删除该课程？', onClick: (row) => handleDelete(row) },
  ] },
  { prop: 'subject', label: '学科', width: 90 },
  { prop: 'grade', label: '年级', width: 90 },
  { prop: 'teacherName', label: '授课教师', width: 110 },
  { prop: 'totalHours', label: '课时', width: 80 },
  { prop: 'price', label: '价格', width: 100, formatter: (_r, _c, v) => `¥${v}` },
  { prop: 'studentCount', label: '学员数', width: 90 },
  { prop: 'status', label: '状态', slot: 'status', width: 100 },
]

const { loading, list, total, page, query, search, reset, reload, onPageChange, onSizeChange } =
  useTable<CourseListItem, CourseListReq>(courseService.fetchList, { defaultPageSize: 10 })

// 课程表单
const teacherOptions = ref<{ label: string; value: string }[]>([])

const formFields = computed<FormField[]>(() => [
  { prop: 'name', label: '课程名称', type: 'input', required: true },
  { prop: 'subject', label: '学科', type: 'select', required: true, options: subjectOptions },
  { prop: 'grade', label: '年级', type: 'select', required: true, options: gradeOptions },
  { prop: 'teacherId', label: '授课教师', type: 'select', required: true, options: teacherOptions.value },
  { prop: 'totalHours', label: '总课时', type: 'number', required: true },
  { prop: 'price', label: '价格', type: 'number', required: true },
  { prop: 'intro', label: '简介', type: 'textarea', span: 24 },
])

const formRef = ref<InstanceType<typeof BaseForm>>()
const dialogVisible = ref(false)
const dialogLoading = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const form = reactive<CourseForm>({
  name: '',
  subject: '',
  grade: '',
  teacherId: '',
  totalHours: 0,
  price: 0,
  intro: '',
})

function openDialog(mode: 'create' | 'edit', row?: CourseListItem) {
  dialogMode.value = mode
  Object.assign(form, {
    id: row?.id,
    name: row?.name ?? '',
    subject: row?.subject ?? '',
    grade: row?.grade ?? '',
    teacherId: row?.teacherId ?? '',
    totalHours: row?.totalHours ?? 0,
    price: row?.price ?? 0,
    intro: '',
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
    await courseService.save({ ...form })
    ElMessage.success(dialogMode.value === 'create' ? '新增成功' : '更新成功')
    dialogVisible.value = false
    reload()
  } finally {
    dialogLoading.value = false
  }
}

async function handleDelete(row: CourseListItem) {
  await courseService.remove(row.id)
  ElMessage.success('删除成功')
  reload()
}

async function loadTeacherOptions() {
  try {
    const res = await teacherService.fetchList({ pageNum: 1, pageSize: 100 })
    teacherOptions.value = res.list.map((t) => ({ label: t.name, value: t.id }))
  } catch {
    teacherOptions.value = []
  }
}

onMounted(loadTeacherOptions)
</script>

<template>
  <BasePage title="课程管理">
    <template #toolbar>
      <el-button type="primary" @click="openDialog('create')">新增课程</el-button>
    </template>

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
      :title="dialogMode === 'create' ? '新增课程' : '编辑课程'"
      :loading="dialogLoading"
      width="600px"
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
  </BasePage>
</template>
