import { useRef, useCallback, useEffect } from 'react'
import { GridCanvas } from './components/GridCanvas'
import { ColorPalette } from './components/ColorPalette'
import { downloadGridAsPng } from './lib/export'
import { useGridStore } from './store'

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const theme = useGridStore(s => s.theme)

  const handleExport = useCallback(() => {
    if (canvasRef.current) downloadGridAsPng(canvasRef.current)
  }, [])

  // Keyboard shortcuts — reads from store directly so this effect never re-runs.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        useGridStore.getState().undo()
      } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault()
        useGridStore.getState().redo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className={`flex h-dvh w-screen flex-col bg-gray-50 dark:bg-gray-900 ${theme === 'dark' ? 'dark' : ''}`}>
      <div
        className="flex flex-1 min-h-0 items-center justify-center p-4"
        style={{ containerType: 'size' }}
      >
        <div className="aspect-square" style={{ width: 'min(100cqi, 100cqb)' }}>
          <GridCanvas ref={canvasRef} />
        </div>
      </div>

      <div className="shrink-0 border-t border-gray-200 dark:border-gray-800 px-2">
        <ColorPalette onExport={handleExport} />
      </div>
    </div>
  )
}
