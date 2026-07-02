import { saveAs } from 'file-saver'

/** Blob 下载 */
export function downloadBlob(blob: Blob, filename: string): void {
  saveAs(blob, filename)
}

/** 字符串流下载（如 CSV） */
export function downloadText(text: string, filename: string, mime = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([text], { type: mime })
  saveAs(blob, filename)
}

/** 从响应头解析文件名 */
export function parseFilenameFromHeader(contentDisposition: string): string {
  const match = contentDisposition?.match(/filename\*?=(?:UTF-8'')?["']?([^"';\n]+)/i)
  return match ? decodeURIComponent(match[1]) : `download_${Date.now()}`
}
