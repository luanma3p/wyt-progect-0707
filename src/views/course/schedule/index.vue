<script setup lang="ts">
import dayjs from 'dayjs'
import { courseService } from '@/service/course.service'
import type { ScheduleItem } from '@/service/course.service'
import type { TableColumn } from '@/components/Base/BaseTable/types'

defineOptions({ name: 'CourseSchedule' })

const statusMapping: Record<
  string,
  { text: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' }
> = {
  scheduled: { text: '已排课', type: 'success' },
  finished: { text: '已完成', type: 'info' },
  cancelled: { text: '已取消', type: 'danger' },
}

const columns: TableColumn<ScheduleItem>[] = [
  { prop: 'date', label: '日期', width: 120 },
  {
    prop: 'startTime',
    label: '时间',
    width: 160,
    formatter: (row) => `${row.startTime} ~ ${row.endTime}`,
  },
  { prop: 'courseName', label: '课程', minWidth: 180 },
  { prop: 'teacherName', label: '教师', width: 110 },
  { prop: 'studentName', label: '学员', width: 110 },
  { prop: 'classroom', label: '教室', width: 100 },
  { prop: 'status', label: '状态', slot: 'status', width: 100 },
]

/** 计算本周一到本周日的日期范围（YYYY-MM-DD） */
function getWeekRange(): [string, string] {
  return [dayjs().day(1).format('YYYY-MM-DD'), dayjs().day(7).format('YYYY-MM-DD')]
}

const loading = ref(false)
const list = ref<ScheduleItem[]>([])
const dateRange = ref<[string, string]>(getWeekRange())

async function fetchSchedule() {
  if (!dateRange.value || dateRange.value.length < 2) return
  loading.value = true
  try {
    list.value = await courseService.fetchSchedule({
      startDate: dateRange.value[0],
      endDate: dateRange.value[1],
    })
  } finally {
    loading.value = false
  }
}

function onDateChange() {
  fetchSchedule()
}

onMounted(fetchSchedule)
</script>

<template>
  <BasePage title="排课管理">
    <template #toolbar>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        value-format="YYYY-MM-DD"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :clearable="false"
        @change="onDateChange"
      />
    </template>

    <BaseTable :columns="columns" :data="list" :loading="loading" row-key="id">
      <template #status="{ row }">
        <StatusBadge :status="row.status" :mapping="statusMapping" />
      </template>
    </BaseTable>
  </BasePage>
</template>
