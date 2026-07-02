import Cookies from 'js-cookie'
import { STORAGE_KEYS } from '@/constants/keys'

const TOKEN_KEY = STORAGE_KEYS.TOKEN

/** Token 存取：默认使用 Cookie（可跨子域），降级到 localStorage */
export function getToken(): string {
  return Cookies.get(TOKEN_KEY) || ''
}

export function setToken(token: string, expires = 7): void {
  Cookies.set(TOKEN_KEY, token, { expires, sameSite: 'lax' })
}

export function removeToken(): void {
  Cookies.remove(TOKEN_KEY)
}

/** 从 Bearer 头中提取 token */
export function parseBearer(header: string): string {
  return header.startsWith('Bearer ') ? header.slice(7) : header
}
