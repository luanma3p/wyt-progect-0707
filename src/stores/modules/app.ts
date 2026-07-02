import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { defaultSettings } from '@/config'

export type Theme = 'light' | 'dark'
export type Size = 'large' | 'default' | 'small'
export type Language = 'zh-cn' | 'en'
export type Device = 'desktop' | 'mobile'

export const useAppStore = defineStore(
  'app',
  () => {
    const sidebarCollapsed = ref(false)
    const theme = ref<Theme>(defaultSettings.defaultTheme)
    const size = ref<Size>(defaultSettings.defaultSize)
    const language = ref<Language>(defaultSettings.defaultLanguage)
    const device = ref<Device>('desktop')

    const isDark = computed(() => theme.value === 'dark')

    function toggleSidebar() {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }
    function setSidebar(collapsed: boolean) {
      sidebarCollapsed.value = collapsed
    }
    function setTheme(value: Theme) {
      theme.value = value
    }
    function toggleTheme() {
      theme.value = theme.value === 'light' ? 'dark' : 'light'
    }
    function setSize(value: Size) {
      size.value = value
    }
    function setLanguage(value: Language) {
      language.value = value
    }
    function setDevice(value: Device) {
      device.value = value
    }

    // 同步 html 的 dark class
    watch(
      theme,
      (val) => {
        const html = document.documentElement
        if (val === 'dark') html.classList.add('dark')
        else html.classList.remove('dark')
      },
      { immediate: true },
    )

    return {
      sidebarCollapsed,
      theme,
      size,
      language,
      device,
      isDark,
      toggleSidebar,
      setSidebar,
      setTheme,
      toggleTheme,
      setSize,
      setLanguage,
      setDevice,
    }
  },
  {
    persist: {
      key: 'BANXUE_APP',
      paths: ['sidebarCollapsed', 'theme', 'size', 'language'],
    },
  },
)
