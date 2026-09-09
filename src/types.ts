export type ObjectType = 'keychain' | 'box' | 'cylinder' | 'sphere' | 'ring' | 'plate'

export interface ModelConfig {
  type: ObjectType
  text: string
  width: number
  height: number
  thickness: number
  holeSize: number
  edgeRadius: number
  holePosition: 'center' | 'top-left' | 'top-right' | 'bottom-center'
  scale: number
}

export interface MaterialConfig {
  roughness: number
  metallic: number
  baseColor: string
}

export interface ParseResult {
  model: Partial<ModelConfig>
  material: Partial<MaterialConfig>
}

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning'
}

export type ViewMode = 'wireframe' | 'solid' | 'material'
export type ExportFormat = 'stl' | 'obj' | 'gltf' | 'glb'
export type Units = 'mm' | 'cm' | 'inch'
export type SidebarTab = 'generate' | 'history' | 'import'
