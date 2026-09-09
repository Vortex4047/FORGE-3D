import { Layers, Maximize2, MoreHorizontal, Settings, Zap } from 'lucide-react'
import { useStore } from '../store/useStore'

export function RightSidebar() {
  const { model, material, setMaterial, showGrid, setShowGrid, showAxes, setShowAxes } = useStore()

  return (
    <aside className="right-sidebar">
      <div className="panel-head">
        <h3>Properties</h3>
        <button className="panel-head-btn"><MoreHorizontal size={14} /></button>
      </div>
      <div className="panel-content">
        <div className="panel-section">
          <div className="section-title"><Layers size={11} /> Hierarchy</div>
          <div className="hierarchy-item">
            <Layers size={12} />
            <span className="hierarchy-name">{model.text || model.type}</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{model.type}</span>
          </div>
        </div>

        <div className="panel-section">
          <div className="section-title"><Maximize2 size={11} /> Transform</div>
          <div className="transform-grid">
            <span className="transform-row-label">Pos</span>
            {(['x', 'y', 'z'] as const).map(a => (
              <div key={a}>
                <div className="transform-label" style={{
                  color: a === 'x' ? '#F87171' : a === 'y' ? '#4ADE80' : '#60A5FA',
                  fontSize: 9, fontWeight: 700, textAlign: 'center', marginBottom: 2
                }}>{a.toUpperCase()}</div>
                <input className="transform-input" type="number" defaultValue={0} step={0.1} />
              </div>
            ))}
            <span className="transform-row-label">Rot</span>
            {['rx', 'ry', 'rz'].map(a => (
              <input key={a} className="transform-input" type="number" defaultValue={0} step={1} />
            ))}
            <span className="transform-row-label">Scl</span>
            {['1', '1', '1'].map((v, i) => (
              <input key={i} className="transform-input" type="number" defaultValue={v} step={0.1} min={0.01} />
            ))}
          </div>
        </div>

        <div className="panel-section">
          <div className="section-title"><Zap size={11} /> Material</div>
          <div className="param-group">
            <div className="param-label-row">
              <span className="param-label">Roughness</span>
              <span className="param-value">{material.roughness.toFixed(2)}</span>
            </div>
            <input type="range" className="param-slider"
              min={0} max={1} step={0.01} value={material.roughness}
              onChange={e => setMaterial(prev => ({ ...prev, roughness: +e.target.value }))}
            />
          </div>

          <div className="param-group">
            <div className="param-label-row">
              <span className="param-label">Metallic</span>
              <span className="param-value">{material.metallic.toFixed(2)}</span>
            </div>
            <input type="range" className="param-slider"
              min={0} max={1} step={0.01} value={material.metallic}
              onChange={e => setMaterial(prev => ({ ...prev, metallic: +e.target.value }))}
            />
          </div>

          <div className="color-picker-row">
            <label className="param-label">Base Color</label>
            <div className="color-picker-wrap">
              <code>{material.baseColor}</code>
              <label className="color-swatch">
                <input type="color" value={material.baseColor}
                  onChange={e => setMaterial(prev => ({ ...prev, baseColor: e.target.value }))}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="panel-section">
          <div className="section-title"><Settings size={11} /> Viewport</div>
          <div className="toggle-row">
            <span className="toggle-label">Grid</span>
            <label className="toggle">
              <input type="checkbox" checked={showGrid}
                onChange={e => setShowGrid(e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>
          <div className="toggle-row">
            <span className="toggle-label">Axes</span>
            <label className="toggle">
              <input type="checkbox" checked={showAxes}
                onChange={e => setShowAxes(e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>
          <div className="toggle-row">
            <span className="toggle-label">Bounds</span>
            <label className="toggle">
              <input type="checkbox" />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>
      </div>
    </aside>
  )
}
