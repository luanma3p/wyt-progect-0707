import { ref } from 'vue'
import { downloadBlob, parseFilenameFromHeader } from '@/utils/download'
import { http } from '@/utils/request'

/** 流式下载，防重复点击 */
export function useDownload() {
  const loading = ref(false)

  async function download(
    url: string,
    params: Record<string, unknown>,
    filename?: string,
  ): Promise<void> {
    if (loading.value) return
    loading.value = true
    try {
      const blob = await http.download(url, params, { showLoading: false })
      const name = filename ?? `download_${Date.now()}`
      downloadBlob(blob, name)
    } finally {
      loading.value = false
    }
  }

  return { loading, download }
}

export { parseFilenameFromHeader }
