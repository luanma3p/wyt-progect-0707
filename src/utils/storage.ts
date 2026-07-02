import type { StorageLike } from './types'

/** 类型化的 localStorage / sessionStorage 封装 */
class TypedStorage {
  constructor(private storage: StorageLike) {}

  get<T>(key: string): T | null {
    const raw = this.storage.getItem(key)
    if (raw === null) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return raw as unknown as T
    }
  }

  set<T>(key: string, value: T): void {
    const raw = typeof value === 'string' ? value : JSON.stringify(value)
    this.storage.setItem(key, raw)
  }

  remove(key: string): void {
    this.storage.removeItem(key)
  }

  clear(): void {
    this.storage.clear()
  }

  has(key: string): boolean {
    return this.storage.getItem(key) !== null
  }
}

export const localStore = new TypedStorage(localStorage)
export const sessionStore = new TypedStorage(sessionStorage)

export default localStore
