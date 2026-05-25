import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Download, LayoutGrid, Link, Moon, Move, Pencil, Redo2, Sun, Trash2, Undo2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useGridStore } from '../store'

interface LeftToolbarProps {
  onExport: (filename: string) => void
}

const FILENAME_SUGGESTIONS = [
  'coolest-pattern-ever', 'my-best-pattern', 'six-seven', 'pixel-dreams',
  'bead-masterpiece', 'rainbow-chaos', 'hama-heaven', 'perler-perfection',
  'colorful-mess', 'saturday-beads', 'retro-pixels', 'pastel-madness',
  'neon-adventure', 'sunday-project', 'little-mosaic', 'pegboard-dreams',
  'beady-mcbeadface', 'pixel-wizard', 'the-one-and-only', 'magic-carpet',
  'color-explosion', 'bead-chaos', 'tiny-rainbow', 'pretty-pixels',
]

const SIZE_MIN = 2
const SIZE_MAX = 200

export function LeftToolbar({ onExport }: LeftToolbarProps) {
  const activeColor   = useGridStore(s => s.activeColor)
  const tool          = useGridStore(s => s.tool)
  const pencilOnly    = useGridStore(s => s.pencilOnly)
  const theme         = useGridStore(s => s.theme)
  const canUndo       = useGridStore(s => s.past.length > 0)
  const canRedo       = useGridStore(s => s.future.length > 0)
  const setPencilOnly = useGridStore(s => s.setPencilOnly)
  const setTheme      = useGridStore(s => s.setTheme)
  const grid          = useGridStore(s => s.grid)
  const rows          = useGridStore(s => s.rows)
  const cols          = useGridStore(s => s.cols)
  const clearGrid     = useGridStore(s => s.clearGrid)
  const resizeGrid    = useGridStore(s => s.resizeGrid)
  const nudgeGrid     = useGridStore(s => s.nudgeGrid)
  const undo          = useGridStore(s => s.undo)
  const redo          = useGridStore(s => s.redo)

  // Nudge boundary checks
  const topFilled    = Array.from({ length: cols }, (_, c) => grid[c]).some(Boolean)
  const bottomFilled = Array.from({ length: cols }, (_, c) => grid[(rows - 1) * cols + c]).some(Boolean)
  const leftFilled   = Array.from({ length: rows }, (_, r) => grid[r * cols]).some(Boolean)
  const rightFilled  = Array.from({ length: rows }, (_, r) => grid[r * cols + cols - 1]).some(Boolean)

  // Move panel
  const [moveOpen, setMoveOpen] = useState(false)

  // Export panel
  const [exportOpen, setExportOpen] = useState(false)
  const [filename, setFilename]     = useState('')
  const [placeholder, setPlaceholder] = useState('')

  useEffect(() => {
    if (!exportOpen) return
    const shuffled = [...FILENAME_SUGGESTIONS].sort(() => Math.random() - 0.5)
    setPlaceholder(shuffled[0])
    setFilename('')
  }, [exportOpen])

  const handleExportClick = () => {
    const name = (filename.trim() || placeholder || 'pattern').toLowerCase().replace(/\s+/g, '-')
    onExport(`${name}.png`)
    setExportOpen(false)
  }

  // Size panel
  const [sizeOpen, setSizeOpen]       = useState(false)
  const [rowInput, setRowInput]       = useState(String(rows))
  const [colInput, setColInput]       = useState(String(cols))
  const [locked, setLocked]           = useState(rows === cols)
  const [confirming, setConfirming]   = useState(false)

  // Reset inputs to current grid dimensions each time the panel opens.
  useEffect(() => {
    if (!sizeOpen) return
    const s = useGridStore.getState()
    setRowInput(String(s.rows))
    setColInput(String(s.cols))
    setLocked(s.rows === s.cols)
    setConfirming(false)
  }, [sizeOpen])

  const parse = (v: string) => Math.max(SIZE_MIN, Math.min(SIZE_MAX, parseInt(v) || SIZE_MIN))
  const parsedRows = parse(rowInput)
  const parsedCols = parse(colInput)
  const isUnchanged = parsedRows === rows && parsedCols === cols
  const isNonEmpty  = grid.some(c => c !== '')

  const handleRowChange = (v: string) => { setRowInput(v); if (locked) setColInput(v) }
  const handleColChange = (v: string) => { setColInput(v); if (locked) setRowInput(v) }
  const toggleLock = () => { if (!locked) setColInput(rowInput); setLocked(l => !l) }
  const doResize   = () => { resizeGrid(parsedRows, parsedCols); setSizeOpen(false) }
  const handleApply = () => {
    if (isUnchanged) return
    if (isNonEmpty) { setConfirming(true); return }
    doResize()
  }

  const btn = 'w-11 h-11 flex items-center justify-center rounded-lg border-2 border-gray-300 bg-gray-100 text-gray-600 text-sm font-medium transition-colors active:bg-gray-200 disabled:opacity-30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:active:bg-gray-700'
  const activeBtn = 'w-11 h-11 flex items-center justify-center rounded-lg border-2 border-gray-700 bg-gray-800 text-gray-100 text-sm font-bold transition-colors dark:border-white dark:bg-white dark:text-gray-900'
  const divider = <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

  const inputCls = 'min-w-0 flex-1 h-11 rounded-lg border-2 text-center text-sm font-medium border-gray-300 bg-gray-100 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'
  const panelBtn = 'flex-1 h-11 flex items-center justify-center rounded-lg text-sm font-medium transition-colors'

  return (
    <div className="flex shrink-0 flex-col justify-center border-r border-gray-200 px-2 py-3 dark:border-gray-800 w-[164px]">
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

      {/* Group 2: pencil-only · theme · size toggle */}
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
        <button
          className={sizeOpen ? activeBtn : btn}
          onClick={() => setSizeOpen(o => !o)}
          aria-label="Resize grid"
          aria-pressed={sizeOpen}
        ><LayoutGrid className="w-5 h-5" /></button>
      </div>

      {/* Collapsible size panel */}
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-in-out"
        style={{ gridTemplateRows: sizeOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          {divider}
          {!confirming ? (
            <>
              <div className="flex items-center gap-1.5">
                <input
                  type="number" min={SIZE_MIN} max={SIZE_MAX}
                  value={rowInput} onChange={e => handleRowChange(e.target.value)}
                  className={inputCls} aria-label="Rows"
                />
                <button
                  onClick={toggleLock}
                  aria-label={locked ? 'Unlock aspect ratio' : 'Lock to square'}
                  aria-pressed={locked}
                  className={locked ? activeBtn : btn}
                ><Link className="w-4 h-4" /></button>
                <input
                  type="number" min={SIZE_MIN} max={SIZE_MAX}
                  value={colInput} onChange={e => handleColChange(e.target.value)}
                  className={inputCls} aria-label="Cols"
                />
              </div>
              <button
                className={`${panelBtn} mt-1.5 w-full bg-gray-900 text-white disabled:opacity-40 dark:bg-white dark:text-gray-900`}
                onClick={handleApply}
                disabled={isUnchanged}
              >apply</button>
            </>
          ) : (
            <>
              <p className="mb-1.5 text-xs text-gray-500 dark:text-gray-400">
                clear your pattern?
              </p>
              <div className="flex gap-1.5">
                <button
                  className={`${panelBtn} bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300`}
                  onClick={() => setConfirming(false)}
                >back</button>
                <button
                  className={`${panelBtn} bg-red-600 text-white`}
                  onClick={doResize}
                >clear</button>
              </div>
            </>
          )}
        </div>
      </div>

      {divider}

      {/* Group 3: move toggle · clear · export toggle */}
      <div className="grid grid-cols-3 gap-2">
        <button
          className={moveOpen ? activeBtn : btn}
          onClick={() => setMoveOpen(o => !o)}
          aria-label="Move pattern"
          aria-pressed={moveOpen}
        ><Move className="w-5 h-5" /></button>
        <button className={btn} onClick={clearGrid} aria-label="Clear grid"><Trash2 className="w-5 h-5" /></button>
        <button
          className={exportOpen ? activeBtn : btn}
          onClick={() => setExportOpen(o => !o)}
          aria-label="Export as PNG"
          aria-pressed={exportOpen}
        ><Download className="w-5 h-5" /></button>
      </div>

      {/* Collapsible export panel */}
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-in-out"
        style={{ gridTemplateRows: exportOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          {divider}
          <input
            type="text"
            value={filename}
            onChange={e => setFilename(e.target.value)}
            placeholder={placeholder}
            className="w-full h-11 rounded-lg border-2 px-2 text-sm font-medium border-gray-300 bg-gray-100 text-gray-900 placeholder:text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 mb-1.5"
            aria-label="Pattern filename"
          />
          <button
            className={`${panelBtn} w-full bg-gray-900 text-white dark:bg-white dark:text-gray-900`}
            onClick={handleExportClick}
          >export</button>
        </div>
      </div>

      {/* Collapsible d-pad */}
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-in-out"
        style={{ gridTemplateRows: moveOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          {divider}
          <div className="grid grid-cols-3 gap-2">
            <div />
            <button className={btn} onClick={() => nudgeGrid(0, -1)}  disabled={topFilled}    aria-label="Nudge up"><ArrowUp    className="w-5 h-5" /></button>
            <div />
            <button className={btn} onClick={() => nudgeGrid(-1, 0)}  disabled={leftFilled}   aria-label="Nudge left"><ArrowLeft  className="w-5 h-5" /></button>
            <div />
            <button className={btn} onClick={() => nudgeGrid(1, 0)}   disabled={rightFilled}  aria-label="Nudge right"><ArrowRight className="w-5 h-5" /></button>
            <div />
            <button className={btn} onClick={() => nudgeGrid(0, 1)}   disabled={bottomFilled} aria-label="Nudge down"><ArrowDown  className="w-5 h-5" /></button>
            <div />
          </div>
        </div>
      </div>
    </div>
  )
}
