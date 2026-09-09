import { create } from 'zustand'
import type { ModelConfig, MaterialConfig, ViewMode, Units, SidebarTab, Toast } from '../types'
import { loadHistory, saveHistory, loadOllamaModel } from '../utils/storage'

// ─── Constants ────────────────────────────────────────────────────────────────

export const DEFAULT_MODEL: ModelConfig = {
  type: 'keychain',
  text: 'FORGE3D',
  width: 80,
  height: 40,
  thickness: 8,
  holeSize: 6,
  edgeRadius: 3,
  holePosition: 'top-left',
  scale: 1,
}

export const DEFAULT_MATERIAL: MaterialConfig = {
  roughness: 0.35,
  metallic: 0.9,
  baseColor: '#E4E4E4',
}

interface AppState {
  // Core Data
  model: ModelConfig
  material: MaterialConfig
  modelUrl: string | null
  setModel: (updater: ModelConfig | ((prev: ModelConfig) => ModelConfig)) => void
  setMaterial: (updater: MaterialConfig | ((prev: MaterialConfig) => MaterialConfig)) => void
  setModelUrl: (url: string | null) => void

  // Viewport Settings
  viewMode: ViewMode
  setViewMode: (v: ViewMode) => void
  animate: boolean
  setAnimate: (v: boolean | ((p: boolean) => boolean)) => void
  ortho: boolean
  setOrtho: (v: boolean | ((p: boolean) => boolean)) => void
  bgColor: string
  setBgColor: (color: string) => void
  showGrid: boolean
  setShowGrid: (v: boolean) => void
  showAxes: boolean
  setShowAxes: (v: boolean) => void
  fps: number
  setFps: (fps: number) => void
  polyCount: number
  setPolyCount: (poly: number) => void

  // UI State
  units: Units
  setUnits: (u: Units) => void
  sidebarTab: SidebarTab
  setSidebarTab: (t: SidebarTab) => void
  prompt: string
  setPrompt: (p: string) => void
  isGenerating: boolean
  setIsGenerating: (v: boolean) => void
  promptHistory: string[]
  addToHistory: (prompt: string) => void
  clearHistory: () => void

  toasts: Toast[]
  addToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void

  // Modals / Dropdowns
  ollamaModel: string
  setOllamaModel: (m: string) => void
  setOllamaModelDraft?: (m: string) => void
  showApiModal: boolean
  setShowApiModal: (v: boolean) => void
  
  showExportModal: boolean
  setShowExportModal: (v: boolean) => void
  exportFormat: 'stl' | 'obj' | 'gltf'
  setExportFormat: (v: 'stl' | 'obj' | 'gltf') => void
  exportScale: number
  setExportScale: (v: number) => void
}

export const useStore = create<AppState>((set, get) => ({
  model: DEFAULT_MODEL,
  material: DEFAULT_MATERIAL,
  modelUrl: null,
  setModel: (updater) => set((state) => ({ model: typeof updater === 'function' ? updater(state.model) : updater })),
  setMaterial: (updater) => set((state) => ({ material: typeof updater === 'function' ? updater(state.material) : updater })),
  setModelUrl: (modelUrl) => set({ modelUrl }),

  viewMode: 'solid',
  setViewMode: (v) => set({ viewMode: v }),
  animate: true,
  setAnimate: (v) => set((state) => ({ animate: typeof v === 'function' ? v(state.animate) : v })),
  ortho: false,
  setOrtho: (v) => set((state) => ({ ortho: typeof v === 'function' ? v(state.ortho) : v })),
  bgColor: '#0F172A',
  setBgColor: (color) => set({ bgColor: color }),
  showGrid: true,
  setShowGrid: (v) => set({ showGrid: v }),
  showAxes: true,
  setShowAxes: (v) => set({ showAxes: v }),
  fps: 60,
  setFps: (fps) => set({ fps }),
  polyCount: 0,
  setPolyCount: (polyCount) => set({ polyCount }),

  units: 'mm',
  setUnits: (units) => set({ units }),
  sidebarTab: 'generate',
  setSidebarTab: (sidebarTab) => set({ sidebarTab }),
  prompt: '',
  setPrompt: (prompt) => set({ prompt }),
  isGenerating: false,
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  
  promptHistory: loadHistory(),
  addToHistory: (newPrompt) => set((state) => {
    const next = [newPrompt, ...state.promptHistory.filter(x => x !== newPrompt)].slice(0, 20)
    saveHistory(next)
    return { promptHistory: next }
  }),
  clearHistory: () => {
    saveHistory([])
    set({ promptHistory: [] })
  },

  toasts: [],
  addToast: (message, type = 'success') => {
    const id = Date.now().toString()
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
    setTimeout(() => get().removeToast(id), 4000)
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) })),

  ollamaModel: loadOllamaModel(),
  setOllamaModel: (ollamaModel) => set({ ollamaModel }),
  setOllamaModelDraft: () => {},// stub
  showApiModal: !loadOllamaModel(),
  setShowApiModal: (showApiModal) => set({ showApiModal }),
  
  showExportModal: false,
  setShowExportModal: (showExportModal) => set({ showExportModal }),
  exportFormat: 'stl',
  setExportFormat: (exportFormat) => set({ exportFormat }),
  exportScale: 1.0,
  setExportScale: (exportScale) => set({ exportScale }),
}))
