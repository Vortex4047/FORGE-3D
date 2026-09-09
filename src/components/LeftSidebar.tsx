import { useRef, useCallback } from 'react'
import { Box, Circle, FolderOpen, History, Send, Sparkles, Square, Upload } from 'lucide-react'
import { useStore } from '../store/useStore'
import type { ModelConfig, ObjectType } from '../types'

const TEMPLATES: Array<{ label: string; type: ObjectType; icon: typeof Box }> = [
  { label: 'Keychain', type: 'keychain', icon: Square },
  { label: 'Box', type: 'box', icon: Box },
  { label: 'Cylinder', type: 'cylinder', icon: Circle },
  { label: 'Sphere', type: 'sphere', icon: Circle },
  { label: 'Ring', type: 'ring', icon: Circle },
  { label: 'Plate', type: 'plate', icon: Square },
]

export function LeftSidebar() {
  const {
    sidebarTab, setSidebarTab,
    prompt, setPrompt,
    isGenerating, setIsGenerating,
    model, setModel,
    addToHistory, clearHistory, promptHistory,
    setModelUrl, addToast
  } = useStore()
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const submitPrompt = useCallback(async (raw: string) => {
    const p = raw.trim()
    if (!p) return
    setIsGenerating(true)
    try {
      // Import here to avoid circular dep, or pass via store
      const { loadOllamaModel, loadOllamaBaseUrl } = await import('../utils/storage')
      const model_name = loadOllamaModel()
      const baseUrl = loadOllamaBaseUrl()

      // Call Python Backend's dynamic generation endpoint
      const activePrompt = p
      const response = await fetch('/api/generate/dynamic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: activePrompt,
          model_name: model_name || 'llama3.2',
          base_url: baseUrl || 'http://localhost:11434'
        })
      })

      if (!response.ok) {
        throw new Error(`Backend generated an error: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.status === 'success' && data.modelUrl) {
        setModelUrl(`${data.modelUrl}?t=${Date.now()}`)
        addToHistory(activePrompt)
        setPrompt('')
        
        if (data.generatedCode) {
           console.log("Generated Python Code:\n", data.generatedCode)
           addToast(`✨ Generated 3D mesh using Ollama via Python`, 'success')
        }
      } else {
        console.warn("Backend response didn't contain modelUrl:", data)
      }
      
    } catch (err: unknown) {
      addToast('Generation failed: ' + (err instanceof Error ? err.message : String(err)), 'error')
    } finally {
      setIsGenerating(false)
    }
  }, [addToast, setIsGenerating, addToHistory, setModelUrl, setPrompt])

  const handleImport = useCallback((file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['stl', 'obj', 'gltf', 'glb'].includes(ext ?? '')) {
      addToast('Unsupported format. Use STL, OBJ, GLTF, or GLB.', 'error'); return
    }
    if (file.size > 50 * 1024 * 1024) {
      addToast('File too large (max 50MB)', 'error'); return
    }
    addToast(`${file.name} imported (preview only in MVP)`, 'success')
  }, [addToast])

  return (
    <aside className="left-sidebar">
      <div className="sidebar-tabs">
        {([
          { id: 'generate', label: 'Generate', icon: Sparkles },
          { id: 'history', label: 'History', icon: History },
          { id: 'import', label: 'Import', icon: Upload },
        ] as const).map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              className={`sidebar-tab ${sidebarTab === t.id ? 'active' : ''}`}
              onClick={() => setSidebarTab(t.id)}
            >
              <Icon size={11} style={{ marginRight: 3 }} />
              {t.label}
            </button>
          )
        })}
      </div>

      <div className="sidebar-content">
        {sidebarTab === 'generate' && (
          <>
            <div className="prompt-section">
              <span className="prompt-label">AI Prompt</span>
              <textarea
                className="prompt-textarea"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder={`Describe the model you want...\ne.g. "Create a keychain that says ALEX, 5mm thick, 6mm hole top-left"`}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    submitPrompt(prompt)
                  }
                }}
              />
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', flex: 1 }}>⌘+Enter to generate</span>
                <button
                  className="generate-btn"
                  disabled={isGenerating || prompt.trim().length === 0}
                  onClick={() => submitPrompt(prompt)}
                >
                  {isGenerating ? '⏳ Generating…' : <><Send size={11} /> Generate</>}
                </button>
              </div>
            </div>

            <div>
              <span className="prompt-label">Templates</span>
              <div style={{ height: 6 }} />
              <div className="template-grid">
                {TEMPLATES.map(t => {
                  const Icon = t.icon
                  return (
                    <button
                      key={t.type}
                      className={`template-btn ${model.type === t.type ? 'active' : ''}`}
                      onClick={() => setModel(prev => ({ ...prev, type: t.type }))}
                    >
                      <Icon size={11} />{t.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="section-divider" />

            <div className="param-section">
              <span className="prompt-label">Parameters</span>

              <div className="param-group">
                <span className="param-label">Text</span>
                <input
                  className="param-text-input"
                  value={model.text}
                  maxLength={12}
                  onChange={e => setModel(prev => ({ ...prev, text: e.target.value.toUpperCase() }))}
                />
              </div>

              <div className="param-group">
                <div className="param-label-row">
                  <span className="param-label">Thickness</span>
                  <span className="param-value">{model.thickness}mm</span>
                </div>
                <input type="range" className="param-slider"
                  min={2} max={50} step={1} value={model.thickness}
                  onChange={e => setModel(prev => ({ ...prev, thickness: +e.target.value }))}
                />
              </div>

              <div className="param-group">
                <div className="param-label-row">
                  <span className="param-label">Width</span>
                  <span className="param-value">{model.width}mm</span>
                </div>
                <input type="range" className="param-slider"
                  min={15} max={250} step={5} value={model.width}
                  onChange={e => {
                    const v = +e.target.value
                    setModel(prev => ({ ...prev, width: v, height: v }))
                  }}
                />
              </div>

              <div className="param-group">
                <div className="param-label-row">
                  <span className="param-label">Hole Diameter</span>
                  <span className="param-value">{model.holeSize}mm</span>
                </div>
                <input type="range" className="param-slider"
                  min={0} max={20} step={1} value={model.holeSize}
                  onChange={e => setModel(prev => ({ ...prev, holeSize: +e.target.value }))}
                />
              </div>

              <div className="param-group">
                <div className="param-label-row">
                  <span className="param-label">Edge Radius</span>
                  <span className="param-value">{model.edgeRadius}</span>
                </div>
                <input type="range" className="param-slider"
                  min={0} max={12} step={1} value={model.edgeRadius}
                  onChange={e => setModel(prev => ({ ...prev, edgeRadius: +e.target.value }))}
                />
              </div>

              <div className="param-group">
                <div className="param-label-row">
                  <span className="param-label">Scale</span>
                  <span className="param-value">×{model.scale.toFixed(2)}</span>
                </div>
                <input type="range" className="param-slider"
                  min={0.1} max={4} step={0.05} value={model.scale}
                  onChange={e => setModel(prev => ({ ...prev, scale: +e.target.value }))}
                />
              </div>

              <div className="param-group">
                <span className="param-label">Hole Position</span>
                <select className="param-select"
                  value={model.holePosition}
                  onChange={e => setModel(prev => ({ ...prev, holePosition: e.target.value as ModelConfig['holePosition'] }))}
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="center">Center</option>
                  <option value="bottom-center">Bottom Center</option>
                </select>
              </div>
            </div>
          </>
        )}

        {sidebarTab === 'history' && (
          <div>
            <span className="prompt-label">Recent Prompts</span>
            <div style={{ height: 8 }} />
            {promptHistory.length === 0
              ? <p className="history-empty">No prompts yet</p>
              : (
                <div className="history-list">
                  {promptHistory.map((h, i) => (
                    <button key={i} className="history-item"
                      onClick={() => { setPrompt(h); setSidebarTab('generate') }}
                      title={h}
                    >{h}</button>
                  ))}
                  <button className="history-item" style={{ color: 'var(--danger)', marginTop: 8 }}
                    onClick={() => { clearHistory() }}
                  >Clear history</button>
                </div>
              )
            }
          </div>
        )}

        {sidebarTab === 'import' && (
          <div>
            <span className="prompt-label">Import Model</span>
            <div style={{ height: 8 }} />
            <div
              className="import-drop-zone"
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault()
                const file = e.dataTransfer.files?.[0]
                if (file) handleImport(file)
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <FolderOpen size={24} style={{ color: 'var(--accent)', margin: '0 auto 8px' }} />
              <p><strong>Drop a file here</strong></p>
              <p>or click to browse</p>
              <p style={{ fontSize: 10, marginTop: 4 }}>STL · OBJ · GLTF · GLB · Max 50MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".stl,.obj,.gltf,.glb"
              style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleImport(file)
                e.target.value = ''
              }}
            />
          </div>
        )}

      </div>
    </aside>
  )
}
