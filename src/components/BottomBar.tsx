import { useStore } from '../store/useStore'
import { Box as BoxIcon, Camera, Download, Grid3X3, Play, RotateCcw, Zap } from 'lucide-react'

export function BottomBar() {
  const {
    viewMode, setViewMode,
    ortho, setOrtho,
    animate, setAnimate,
    units, setUnits,
    setShowExportModal,
    addToast
  } = useStore()

  return (
    <div className="bottom-bar">
      {/* View modes */}
      <button className={`bar-btn ${viewMode === 'solid' ? 'active' : ''}`}
        onClick={() => setViewMode('solid')} title="Solid">
        <BoxIcon size={13} /> Solid
      </button>
      <button className={`bar-btn ${viewMode === 'wireframe' ? 'active' : ''}`}
        onClick={() => setViewMode('wireframe')} title="Wireframe">
        <Grid3X3 size={13} /> Wire
      </button>
      <button className={`bar-btn ${viewMode === 'material' ? 'active' : ''}`}
        onClick={() => setViewMode('material')} title="Material preview">
        <Zap size={13} /> Material
      </button>

      <div className="bar-separator" />

      {/* Camera controls */}
      <button className={`bar-btn ${ortho ? 'active' : ''}`}
        onClick={() => setOrtho(p => !p)} title="Orthographic">
        <Camera size={13} /> {ortho ? 'Ortho' : 'Persp'}
      </button>
      <button className="bar-btn" title="Reset camera"
        onClick={() => {
          // trigger orbit reset later
          addToast('Camera reset', 'success')
        }}>
        <RotateCcw size={13} /> Reset
      </button>

      <div className="bar-separator" />

      {/* Animate toggle */}
      <button className={`bar-btn ${animate ? 'active' : ''}`}
        onClick={() => setAnimate(p => !p)}>
        <Play size={13} /> {animate ? 'Stop' : 'Preview'}
      </button>

      <div className="bar-spacer" />

      {/* Units */}
      <select className="units-select" value={units}
        onChange={e => setUnits(e.target.value as "mm" | "cm" | "inch")}>
        <option value="mm">mm</option>
        <option value="cm">cm</option>
        <option value="inch">inch</option>
      </select>

      {/* Export */}
      <button className="export-bar-btn" onClick={() => setShowExportModal(true)}>
        <Download size={13} /> Export
      </button>
    </div>
  )
}
