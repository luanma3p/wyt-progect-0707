import { defaultSettings } from './settings'

export const appSettings = { ...defaultSettings }

export function updateSettings(partial: Partial<typeof defaultSettings>) {
  Object.assign(appSettings, partial)
}

export * from './settings'
