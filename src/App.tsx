import { useState, useLayoutEffect } from 'react'
import { TopBar } from './components/TopBar'
import { LeftSidebar } from './components/LeftSidebar'
import { RightSidebar } from './components/RightSidebar'
import { BottomBar } from './components/BottomBar'
import { Viewport } from './components/Viewport'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useStore } from './store/useStore'
import { loadOllamaModel } from './utils/storage'
import './App.css'

export default function App() {
  const { isGenerating, setShowApiModal, fps, polyCount } = useStore()
  const [mounted, setMounted] = useState(false)

  // Initialization
  useLayoutEffect(() => {
    // avoid synchronous setState in effect
    setTimeout(() => {
        setMounted(true)
        if (!loadOllamaModel()) setShowApiModal(true)
    }, 0)
  }, [setShowApiModal])

  if (!mounted) return null

  return (
    <div className="forge-app">
      <TopBar />

      <div className="workspace-grid">
        <LeftSidebar />

        <main className="viewport-shell" id="viewer-container">
          <div className="viewport-stats">
            <div className="stat-chip"><span>FPS</span><strong>{fps}</strong></div>
            <div className="stat-chip"><span>Poly</span><strong>{polyCount.toLocaleString()}</strong></div>
          </div>

          <ErrorBoundary>
            <Viewport />
          </ErrorBoundary>

          {isGenerating && (
            <div className="loading-overlay">
              <div className="spinner" />
              <p>Generating mesh…</p>
            </div>
          )}

          <BottomBar />
        </main>

        <RightSidebar />
      </div>
    </div>
  )
}
