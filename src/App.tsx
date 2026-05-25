import { useRef, useCallback, useEffect } from 'react'
import { GridCanvas } from './components/GridCanvas'
import { ColorPalette } from './components/ColorPalette'
import { LeftToolbar } from './components/LeftToolbar'
import { downloadGridAsPng } from './lib/export'
import { useGridStore } from './store'

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const theme = useGridStore(s => s.theme)
  const rows  = useGridStore(s => s.rows)
  const cols  = useGridStore(s => s.cols)

  const handleExport = useCallback((filename: string) => {
    if (canvasRef.current) downloadGridAsPng(canvasRef.current, filename)
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
      <div className="flex flex-1 min-h-0 flex-row">
        <LeftToolbar onExport={handleExport} />

        <div
          className="flex flex-1 min-w-0 items-center justify-center p-4"
          style={{ containerType: 'size' }}
        >
          {/* Width formula: largest width where aspect ratio fits in container.
              Derived from: height = width*(rows/cols) ≤ 100cqb → width ≤ 100cqb*(cols/rows) */}
          <div style={{
            width: `min(100cqi, calc(100cqb * ${cols} / ${rows}))`,
            aspectRatio: `${cols} / ${rows}`,
          }}>
            <GridCanvas ref={canvasRef} />
          </div>
        </div>

        <ColorPalette />
      </div>

      <footer className="shrink-0 border-t border-gray-200 py-2 text-center text-xs text-gray-400 dark:border-gray-800 dark:text-gray-600">
        © {new Date().getFullYear()} created by{' '}
        <a
          href="https://www.rakulmaria.com/about"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600 dark:hover:text-gray-400"
        >
          rakulmaria
        </a>
      </footer>

    </div>
  )
}
