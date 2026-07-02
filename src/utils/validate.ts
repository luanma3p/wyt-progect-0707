/** 常用校验工具 */
export function isExternal(path: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(path)
}

export function isPhone(value: string): boolean {
  return /^1[3-9]\d{9}$/.test(value)
}

export function isEmail(value: string): boolean {
  return /^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(value)
}

export function isIdCard(value: string): boolean {
  return /^\d{17}[\dXx]$/.test(value)
}

export function isUrl(value: string): boolean {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value)
}

export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value as object).length === 0
  return false
}
