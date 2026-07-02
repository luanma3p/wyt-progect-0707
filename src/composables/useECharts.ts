import { onBeforeUnmount, onMounted, ref, shallowRef, watch, type Ref } from 'vue'
import * as echarts from 'echarts/core'
import { useResizeObserver } from '@vueuse/core'

/**
 * ECharts 实例管理：创建 / resize / 销毁。
 * 按需引入图表组件请在调用处注册，这里只提供容器与生命周期。
 */
export function useECharts(
  el: Ref<HTMLElement | undefined>,
  option: Ref<Record<string, unknown>>,
  opts: { theme?: string } = {},
) {
  const chart = shallowRef<ReturnType<typeof echarts.init> | undefined>()
  const loading = ref(false)

  function render() {
    if (!el.value) return
    let instance = chart.value
    if (!instance) {
      instance = echarts.init(el.value, opts.theme)
      chart.value = instance
    }
    instance.setOption(option.value, true)
  }

  function resize() {
    chart.value?.resize()
  }

  watch(option, render, { deep: true })

  useResizeObserver(el, resize)

  onMounted(() => {
    render()
  })

  onBeforeUnmount(() => {
    chart.value?.dispose()
    chart.value = undefined
  })

  return { chart, loading, render, resize }
}
