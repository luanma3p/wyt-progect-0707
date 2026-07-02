/** 存储接口（localStorage / sessionStorage 的抽象，便于测试 mock） */
export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  clear(): void
  key(index: number): string | null
  readonly length: number
}
