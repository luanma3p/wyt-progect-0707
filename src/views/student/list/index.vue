<script setup lang="ts">
import { ElMessage } from 'element-plus'
import BaseForm from '@/components/Base/BaseForm/index.vue'
import type { FormField } from '@/components/Base/BaseForm/types'
import type { TableColumn } from '@/components/Base/BaseTable/types'
import { useTable } from '@/composables/useTable'
import { studentService } from '@/service/student.service'
import { teacherService } from '@/service/teacher.service'
import type {
  StudentListItem,
  StudentListReq,
  StudentForm,
  StudentFollowRecord,
} from '@/service/student.service'

defineOptions({ name: 'StudentList' })

// ==================== 搜索 ====================
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

const statusMapping: Record<
  string,
  { text: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' }
> = {
  active: { text: '在读', type: 'success' },
  paused: { text: '暂停', type: 'warning' },
  stopped: { text: '停课', type: 'danger' },
}

const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
]

const statusOptions = [
  { label: '在读', value: 'active' },
  { label: '暂停', value: 'paused' },
  { label: '停课', value: 'stopped' },
]

// ==================== 表格 ====================
const columns: TableColumn<StudentListItem>[] = [
  {
    prop: 'name',
    label: '学员',
    slot: 'name',
    minWidth: 140,
    actions: [
      { label: '编辑', onClick: (row) => openDialog('edit', row) },
      { label: '跟进', onClick: (row) => openFollow(row) },
      {
        label: '删除',
        danger: true,
        confirm: '确认删除该学员？删除后不可恢复。',
        onClick: (row) => handleDelete(row),
      },
    ],
  },
  { prop: 'grade', label: '年级', width: 90 },
  { prop: 'phone', label: '手机', width: 130 },
  { prop: 'teacherName', label: '授课教师', width: 110 },
  { prop: 'courseCount', label: '课程数', width: 90 },
  { prop: 'totalHours', label: '总课时', width: 90 },
  { prop: 'lastFollowAt', label: '最近跟进', width: 160 },
  { prop: 'status', label: '状态', slot: 'status', width: 90 },
]

const { loading, list, total, page, query, search, reset, reload, onPageChange, onSizeChange } =
  useTable<StudentListItem, StudentListReq>(studentService.fetchList, { defaultPageSize: 10 })

// ==================== 新增/编辑弹窗 ====================
const teacherOptions = ref<{ label: string; value: string }[]>([])

const formFields = computed<FormField[]>(() => [
  { prop: 'name', label: '学员姓名', type: 'input', required: true },
  { prop: 'phone', label: '手机号', type: 'input', required: true },
  {
    prop: 'gender',
    label: '性别',
    type: 'radio',
    options: genderOptions,
  },
  {
    prop: 'grade',
    label: '年级',
    type: 'select',
    required: true,
    options: gradeOptions,
  },
  {
    prop: 'teacherId',
    label: '授课教师',
    type: 'select',
    required: true,
    options: teacherOptions.value,
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    options: statusOptions,
  },
  { prop: 'parentName', label: '家长姓名', type: 'input' },
  { prop: 'parentPhone', label: '家长电话', type: 'input' },
  { prop: 'address', label: '地址', type: 'input', span: 24 },
  { prop: 'remark', label: '备注', type: 'textarea', span: 24 },
])

const formRef = ref<InstanceType<typeof BaseForm>>()
const dialogVisible = ref(false)
const dialogLoading = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const form = reactive<StudentForm>({
  name: '',
  phone: '',
  grade: '',
  teacherId: '',
  gender: 'male',
  parentName: '',
  parentPhone: '',
  address: '',
  remark: '',
})

function openDialog(mode: 'create' | 'edit', row?: StudentListItem) {
  dialogMode.value = mode
  Object.assign(form, {
    id: row?.id,
    name: row?.name ?? '',
    phone: row?.phone ?? '',
    grade: row?.grade ?? '',
    teacherId: row?.teacherId ?? '',
    gender: (row as any)?.gender ?? 'male',
    parentName: (row as any)?.parentName ?? '',
    parentPhone: (row as any)?.parentPhone ?? '',
    address: (row as any)?.address ?? '',
    remark: (row as any)?.remark ?? '',
    status: row?.status ?? 'active',
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
    await studentService.save({ ...form })
    ElMessage.success(dialogMode.value === 'create' ? '新增成功' : '更新成功')
    dialogVisible.value = false
    reload()
  } finally {
    dialogLoading.value = false
  }
}

async function handleDelete(row: StudentListItem) {
  await studentService.remove(row.id)
  ElMessage.success('删除成功')
  reload()
}

// ==================== 跟进弹窗 ====================
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

const followFormRef = ref<InstanceType<typeof BaseForm>>()
const followDialogVisible = ref(false)
const followDialogLoading = ref(false)
const follows = ref<StudentFollowRecord[]>([])
const followsLoading = ref(false)
const followForm = reactive({ studentId: '', type: 'phone', content: '' })

async function openFollow(row: StudentListItem) {
  followForm.studentId = row.id
  followForm.type = 'phone'
  followForm.content = ''
  followDialogVisible.value = true
  followsLoading.value = true
  try {
    follows.value = await studentService.fetchFollows(row.id)
  } finally {
    followsLoading.value = false
  }
}

async function handleFollowSubmit() {
  try {
    await followFormRef.value?.validate()
  } catch {
    return
  }
  followDialogLoading.value = true
  try {
    await studentService.addFollow({
      studentId: followForm.studentId,
      type: followForm.type,
      content: followForm.content,
    })
    ElMessage.success('跟进已记录')
    follows.value = await studentService.fetchFollows(followForm.studentId)
    followFormRef.value?.resetFields()
    followForm.content = ''
  } finally {
    followDialogLoading.value = false
  }
}

// ==================== 初始化 ====================
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
  <BasePage title="学员管理">
    <template #toolbar>
      <el-button type="primary" @click="openDialog('create')">新增学员</el-button>
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
        <div class="student-cell">
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
      :title="dialogMode === 'create' ? '新增学员' : '编辑学员'"
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

    <!-- 跟进弹窗 -->
    <BaseDialog
      v-model:visible="followDialogVisible"
      title="学员跟进"
      :loading="followDialogLoading"
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
        ref="followFormRef"
        :fields="followFields"
        :model-value="followForm"
        label-width="90px"
        @update:model-value="(v) => Object.assign(followForm, v)"
      />
    </BaseDialog>
  </BasePage>
</template>

<style scoped lang="scss">
.student-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

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
