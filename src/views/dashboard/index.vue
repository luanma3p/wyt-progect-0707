<script setup lang="ts">
import * as echarts from 'echarts/core'
import { LineChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { dashboardApi } from '@/api/dashboard'
import type { DashboardOverviewResp } from '@/api/types/dashboard'
import { useECharts } from '@/composables/useECharts'

echarts.use([
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer,
])

defineOptions({ name: 'Dashboard' })

const overview = ref<DashboardOverviewResp | null>(null)
const loading = ref(false)

const lineEl = ref<HTMLElement>()
const pieEl = ref<HTMLElement>()

const lineOption = ref<Record<string, unknown>>({})
const pieOption = ref<Record<string, unknown>>({})

useECharts(lineEl, lineOption)
useECharts(pieEl, pieOption)

const auditStatusMapping: Record<
  string,
  { text: string; type: 'success' | 'danger' | 'info' | 'warning' | 'primary' }
> = {
  approved: { text: '通过', type: 'success' },
  rejected: { text: '驳回', type: 'danger' },
  pending: { text: '待审核', type: 'warning' },
}

const statCards = computed(() => {
  const stat = overview.value?.stat
  return [
    { label: '教师总数', value: stat?.totalTeachers ?? 0, color: '#409eff' },
    { label: '学员总数', value: stat?.totalStudents ?? 0, color: '#67c23a' },
    { label: '课程总数', value: stat?.totalCourses ?? 0, color: '#e6a23c' },
    { label: '待审核', value: stat?.pendingAudits ?? 0, color: '#f56c6c' },
  ]
})

onMounted(async () => {
  loading.value = true
  try {
    const data = await dashboardApi.getOverview()
    overview.value = data

    lineOption.value = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['新增教师', '活跃教师'] },
      grid: { left: 40, right: 20, top: 40, bottom: 30 },
      xAxis: {
        type: 'category',
        data: data.teacherTrend.map((t) => t.date),
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: '新增教师',
          type: 'line',
          smooth: true,
          data: data.teacherTrend.map((t) => t.newTeachers),
        },
        {
          name: '活跃教师',
          type: 'line',
          smooth: true,
          data: data.teacherTrend.map((t) => t.activeTeachers),
        },
      ],
    }

    pieOption.value = {
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [
        {
          name: '课程分布',
          type: 'pie',
          radius: ['40%', '70%'],
          data: data.courseDist.map((c) => ({ name: c.subject, value: c.count })),
        },
      ],
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <BasePage v-loading="loading" title="数据看板">
    <el-row :gutter="16" class="stat-row">
      <el-col v-for="card in statCards" :key="card.label" :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card__value" :style="{ color: card.color }">{{ card.value }}</div>
          <div class="stat-card__label">{{ card.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="chart-row">
      <el-col :span="14">
        <el-card shadow="never">
          <template #header>教师增长趋势</template>
          <div ref="lineEl" class="chart-box" />
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card shadow="never">
          <template #header>课程分布</template>
          <div ref="pieEl" class="chart-box" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="audit-card">
      <template #header>最近审核</template>
      <el-table :data="overview?.recentAudits ?? []" stripe>
        <el-table-column prop="teacherName" label="教师" />
        <el-table-column label="审核状态" width="120">
          <template #default="{ row }">
            <StatusBadge :status="row.status" :mapping="auditStatusMapping" />
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="审核人" />
        <el-table-column prop="auditedAt" label="审核时间" />
      </el-table>
    </el-card>
  </BasePage>
</template>

<style scoped lang="scss">
.stat-row {
  margin-bottom: 0;
}

.stat-card {
  text-align: center;

  &__value {
    font-size: 32px;
    font-weight: 700;
    line-height: 1.2;
  }

  &__label {
    margin-top: 4px;
    font-size: 14px;
    color: $text-secondary;
  }
}

.chart-row {
  margin-top: $spacing-md;
}

.chart-box {
  height: 320px;
}

.audit-card {
  margin-top: $spacing-md;
}
</style>
