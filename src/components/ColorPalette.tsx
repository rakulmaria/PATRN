import { useGridStore } from '../store'
import { HAMA_COLORS } from '../lib/colors'

interface ColorPaletteProps {
  onExport: () => void
}

export function ColorPalette({ onExport }: ColorPaletteProps) {
  const activeColor  = useGridStore(s => s.activeColor)
  const tool         = useGridStore(s => s.tool)
  const pencilOnly   = useGridStore(s => s.pencilOnly)
  const theme        = useGridStore(s => s.theme)
  const canUndo      = useGridStore(s => s.past.length > 0)
  const canRedo      = useGridStore(s => s.future.length > 0)
  const setActiveColor  = useGridStore(s => s.setActiveColor)
  const setTool         = useGridStore(s => s.setTool)
  const setPencilOnly   = useGridStore(s => s.setPencilOnly)
  const setTheme        = useGridStore(s => s.setTheme)
  const clearGrid       = useGridStore(s => s.clearGrid)
  const undo            = useGridStore(s => s.undo)
  const redo            = useGridStore(s => s.redo)

  const toolBtn = 'w-11 h-11 rounded-lg border-2 border-gray-300 bg-gray-100 text-gray-600 text-sm font-medium transition-colors active:bg-gray-200 disabled:opacity-30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:active:bg-gray-700'
  const activeToolBtn = 'w-11 h-11 rounded-lg border-2 border-gray-700 bg-gray-800 text-gray-100 text-sm font-bold transition-colors dark:border-white dark:bg-white dark:text-gray-900'

  return (
    <div className="flex items-center">
      {/* Fixed controls — always visible, never scrolls */}
      <div className="shrink-0 flex items-center gap-2 py-2 pl-1 pr-2">
        <div
          className="w-11 h-11 rounded-lg border-2 border-gray-400 dark:border-gray-500"
          style={{ backgroundColor: tool === 'erase' ? 'transparent' : activeColor }}
          aria-label="Active color"
        />

        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />

        <button className={toolBtn} onClick={undo} disabled={!canUndo} aria-label="Undo">↩</button>
        <button className={toolBtn} onClick={redo} disabled={!canRedo} aria-label="Redo">↪</button>

        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />

        <button
          className={tool === 'erase' ? activeToolBtn : toolBtn}
          onClick={() => setTool(tool === 'erase' ? 'paint' : 'erase')}
          aria-label="Eraser"
          aria-pressed={tool === 'erase'}
        >
          ✕
        </button>

        <button
          className={pencilOnly ? activeToolBtn : toolBtn}
          onClick={() => setPencilOnly(!pencilOnly)}
          aria-label="Pencil only mode"
          aria-pressed={pencilOnly}
        >
          ✏
        </button>

        <button
          className={toolBtn}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? '☀' : '☽'}
        </button>

        <button className={toolBtn} onClick={clearGrid} aria-label="Clear grid">Clr</button>
        <button className={toolBtn} onClick={onExport}  aria-label="Export as PNG">PNG</button>

        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Scrollable color swatches */}
      <div className="flex items-center gap-2 overflow-x-auto py-2 pr-2">
        {HAMA_COLORS.map(({ name, hex }) => {
          const isActive = tool === 'paint' && activeColor === hex
          return (
            <button
              key={hex}
              className={[
                'shrink-0 w-11 h-11 rounded-lg border transition-transform active:scale-95',
                isActive
                  ? 'border-gray-800 ring-2 ring-gray-800 ring-offset-2 ring-offset-gray-50 scale-110 dark:border-white dark:ring-white dark:ring-offset-gray-900'
                  : 'border-gray-400 dark:border-gray-600',
              ].join(' ')}
              style={{ backgroundColor: hex }}
              onClick={() => { setActiveColor(hex); setTool('paint') }}
              aria-label={name}
              aria-pressed={isActive}
            />
          )
        })}
      </div>
    </div>
  )
}
