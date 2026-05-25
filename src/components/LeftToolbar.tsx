import { Download, LayoutGrid, Moon, Pencil, Sun, Trash2, Redo2, Undo2 } from 'lucide-react'
import { useGridStore } from '../store'

interface LeftToolbarProps {
  onExport: () => void
  onResize: () => void
}

export function LeftToolbar({ onExport, onResize }: LeftToolbarProps) {
  const activeColor   = useGridStore(s => s.activeColor)
  const tool          = useGridStore(s => s.tool)
  const pencilOnly    = useGridStore(s => s.pencilOnly)
  const theme         = useGridStore(s => s.theme)
  const canUndo       = useGridStore(s => s.past.length > 0)
  const canRedo       = useGridStore(s => s.future.length > 0)
  const setPencilOnly = useGridStore(s => s.setPencilOnly)
  const setTheme      = useGridStore(s => s.setTheme)
  const clearGrid     = useGridStore(s => s.clearGrid)
  const undo          = useGridStore(s => s.undo)
  const redo          = useGridStore(s => s.redo)

  const btn = 'w-11 h-11 flex items-center justify-center rounded-lg border-2 border-gray-300 bg-gray-100 text-gray-600 text-sm font-medium transition-colors active:bg-gray-200 disabled:opacity-30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:active:bg-gray-700'
  const activeBtn = 'w-11 h-11 flex items-center justify-center rounded-lg border-2 border-gray-700 bg-gray-800 text-gray-100 text-sm font-bold transition-colors dark:border-white dark:bg-white dark:text-gray-900'
  const divider = <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

  return (
    <div className="flex shrink-0 flex-col justify-center border-r border-gray-200 px-2 py-3 dark:border-gray-800">
      {/* Group 1: active color · undo · redo */}
      <div className="grid grid-cols-3 gap-2">
        <div
          className="w-11 h-11 rounded-lg border-2 border-gray-400 dark:border-gray-500"
          style={{ backgroundColor: tool === 'erase' ? 'transparent' : activeColor }}
          aria-label="Active color"
        />
        <button className={btn} onClick={undo} disabled={!canUndo} aria-label="Undo"><Undo2 className="w-5 h-5" /></button>
        <button className={btn} onClick={redo} disabled={!canRedo} aria-label="Redo"><Redo2 className="w-5 h-5" /></button>
      </div>

      {divider}

      {/* Group 2: pencil-only · theme · size */}
      <div className="grid grid-cols-3 gap-2">
        <button
          className={pencilOnly ? activeBtn : btn}
          onClick={() => setPencilOnly(!pencilOnly)}
          aria-label="Pencil only mode"
          aria-pressed={pencilOnly}
        ><Pencil className="w-5 h-5" /></button>
        <button
          className={btn}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >{theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
        <button className={btn} onClick={onResize} aria-label="Resize grid"><LayoutGrid className="w-5 h-5" /></button>
      </div>

      {divider}

      {/* Group 3: clear · png */}
      <div className="grid grid-cols-3 gap-2">
        <button className={btn} onClick={clearGrid} aria-label="Clear grid"><Trash2 className="w-5 h-5" /></button>
        <button className={btn} onClick={onExport}  aria-label="Export as PNG"><Download className="w-5 h-5" /></button>
      </div>
    </div>
  )
}
