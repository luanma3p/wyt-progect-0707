import { useAppStore } from '@/stores/modules/app'

/** 主题切换组合式（桥接 app store） */
export function useTheme() {
  const appStore = useAppStore()

  function toggle() {
    appStore.toggleTheme()
  }

  function setDark(dark: boolean) {
    appStore.setTheme(dark ? 'dark' : 'light')
  }

  return {
    theme: appStore.theme,
    isDark: appStore.isDark,
    toggle,
    setDark,
  }
}
