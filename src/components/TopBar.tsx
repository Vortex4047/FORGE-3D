import { Layers, Plus } from 'lucide-react'
import { useStore, DEFAULT_MODEL, DEFAULT_MATERIAL } from '../store/useStore'

export function TopBar() {
  const { ollamaModel, setModel, setMaterial, setOllamaModelDraft, setShowApiModal } = useStore()

  return (
    <header className="top-bar">
      <div className="brand-block">
        <div className="forge-logo">
          <Layers size={16} />
        </div>
        <h1>Forge3D</h1>
      </div>

      <nav className="top-nav">
        {['Projects', 'Library', 'Community'].map(item => (
          <button key={item} className="nav-link">{item}</button>
        ))}
      </nav>

      <div className="user-actions">
        <button
          className="api-status-badge connected"
          onClick={() => { setOllamaModelDraft?.(ollamaModel); setShowApiModal(true) }}
          title={`Ollama: ${ollamaModel}`}
        >
          <span className="api-dot" />
          <span>Ollama: {ollamaModel}</span>
        </button>
        <button className="new-project" onClick={() => {
          setModel(DEFAULT_MODEL); setMaterial(DEFAULT_MATERIAL)
        }}>
          <Plus size={12} style={{ marginRight: 2 }} /> New
        </button>
        <button className="avatar" aria-label="User">KS</button>
      </div>
    </header>
  )
}
