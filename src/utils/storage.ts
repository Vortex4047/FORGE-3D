import { DEFAULT_OLLAMA_MODEL, OLLAMA_BASE_URL } from '../parser'

export function loadHistory(): string[] {
  try {
    const raw = window.localStorage.getItem('forge3d.prompt.history')
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x): x is string => typeof x === 'string')
  } catch { return [] }
}

export function saveHistory(h: string[]): void {
  window.localStorage.setItem('forge3d.prompt.history', JSON.stringify(h))
}

export function loadOllamaModel(): string {
  return (
    window.localStorage.getItem('forge3d.ollama.model') ||
    (import.meta.env.VITE_OLLAMA_MODEL as string | undefined) ||
    DEFAULT_OLLAMA_MODEL
  ).trim()
}

export function loadOllamaBaseUrl(): string {
  return (
    (import.meta.env.VITE_OLLAMA_BASE_URL as string | undefined) ||
    OLLAMA_BASE_URL
  ).trim()
}
