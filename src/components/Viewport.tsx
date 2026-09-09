import { useEffect, useRef } from 'react'
import * as OV from 'online-3d-viewer'
import { useStore } from '../store/useStore'

export function Viewport() {
  const containerRef = useRef<HTMLDivElement>(null)
  // We use "any" here because the @types/online-3d-viewer package is incomplete
  // and missing methods like SetBackgroundColor, GetEdgeSettings, etc on EmbeddedViewer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viewerRef = useRef<any>(null)
  const { modelUrl } = useStore()
  
  // Initialization
  useEffect(() => {
    const currentContainer = containerRef.current
    if (!currentContainer) return

    // Initialize the viewer
    const viewer = new OV.EmbeddedViewer(currentContainer, {
      camera: new OV.Camera(
        new OV.Coord3D(0, -100, 50),
        new OV.Coord3D(0, 0, 0),
        new OV.Coord3D(0, 0, 1),
        45.0
      ),
      backgroundColor: new OV.RGBAColor(255, 255, 255, 0),
      defaultColor: new OV.RGBColor(200, 200, 200),
      edgeSettings: new OV.EdgeSettings(false, new OV.RGBColor(0, 0, 0), 1)
    })

    viewerRef.current = viewer
    
    // Handle resizes so the webgl canvas updates its dimensions
    const resizeObserver = new ResizeObserver(() => {
      viewer.Resize()
    })
    resizeObserver.observe(currentContainer)
    
    return () => {
      resizeObserver.disconnect()
      // Need to clean up viewer if component unmounts
      viewerRef.current = null
      if (currentContainer) {
        currentContainer.innerHTML = ''
      }
    }
  }, [])

  // Load Model when modelUrl changes
  useEffect(() => {
    if (!modelUrl || !viewerRef.current) return
    viewerRef.current.LoadModelFromUrlList([modelUrl])
  }, [modelUrl])

  // State synchronization with the viewer will be added later
  // once the correct v0.18.0 API methods are determined.

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '100%', display: 'flex' }}
    />
  )
}
