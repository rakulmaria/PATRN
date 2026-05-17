import { useGridStore } from '../store'
import { HAMA_COLORS } from '../lib/colors'

interface ColorPaletteProps {
  onExport: () => void
}

export function ColorPalette({ onExport }: ColorPaletteProps) {
  const activeColor  = useGridStore(s => s.activeColor)
  const tool         = useGridStore(s => s.tool)
  const pencilOnly   = useGridStore(s => s.pencilOnly)
  const canUndo      = useGridStore(s => s.past.length > 0)
  const canRedo      = useGridStore(s => s.future.length > 0)
  const setActiveColor  = useGridStore(s => s.setActiveColor)
  const setTool         = useGridStore(s => s.setTool)
  const setPencilOnly   = useGridStore(s => s.setPencilOnly)
  const clearGrid       = useGridStore(s => s.clearGrid)
  const undo            = useGridStore(s => s.undo)
  const redo            = useGridStore(s => s.redo)

  const toolBtn = 'w-11 h-11 rounded-lg border-2 border-gray-600 bg-gray-800 text-gray-400 text-sm font-medium transition-colors active:bg-gray-700 disabled:opacity-30'
  const activeToolBtn = 'w-11 h-11 rounded-lg border-2 border-white bg-white text-gray-900 text-sm font-bold transition-colors'

  return (
    <div className="flex items-center">
      {/* Fixed controls — always visible, never scrolls */}
      <div className="shrink-0 flex items-center gap-2 py-2 pl-1 pr-2">
        <div
          className="w-11 h-11 rounded-lg border-2 border-gray-500"
          style={{ backgroundColor: tool === 'erase' ? 'transparent' : activeColor }}
          aria-label="Active color"
        />

        <div className="w-px h-8 bg-gray-700" />

        <button className={toolBtn} onClick={undo} disabled={!canUndo} aria-label="Undo">↩</button>
        <button className={toolBtn} onClick={redo} disabled={!canRedo} aria-label="Redo">↪</button>

        <div className="w-px h-8 bg-gray-700" />

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

        <button className={toolBtn} onClick={clearGrid} aria-label="Clear grid">Clr</button>
        <button className={toolBtn} onClick={onExport}  aria-label="Export as PNG">PNG</button>

        <div className="w-px h-8 bg-gray-700" />
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
                  ? 'border-white ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110'
                  : 'border-gray-600',
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
