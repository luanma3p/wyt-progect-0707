import dayjs from 'dayjs'

/** 日期格式化 */
export function formatDate(
  date: string | number | Date | undefined,
  pattern = 'YYYY-MM-DD HH:mm:ss',
): string {
  if (!date) return '-'
  return dayjs(date).format(pattern)
}

/** 金额格式化（分 → 元） */
export function formatMoney(cents: number, withSymbol = true): string {
  const yuan = (cents / 100).toFixed(2)
  return withSymbol ? `¥${yuan}` : yuan
}

/** 文件大小格式化 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`
}

/** 数字千分位 */
export function formatThousand(num: number | string): string {
  return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
