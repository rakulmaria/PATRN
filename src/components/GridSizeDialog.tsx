import { Link } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useGridStore } from '../store'

interface GridSizeDialogProps {
  onClose: () => void
}

const MIN = 2
const MAX = 200

export function GridSizeDialog({ onClose }: GridSizeDialogProps) {
  const currentRows = useGridStore(s => s.rows)
  const currentCols = useGridStore(s => s.cols)
  const isNonEmpty   = useGridStore(s => s.grid.some(cell => cell !== ''))
  const resizeGrid   = useGridStore(s => s.resizeGrid)

  const [rowInput, setRowInput] = useState(String(currentRows))
  const [colInput, setColInput] = useState(String(currentCols))
  const [locked, setLocked]     = useState(currentRows === currentCols)
  const [confirming, setConfirming] = useState(false)

  const handleRowChange = (v: string) => { setRowInput(v); if (locked) setColInput(v) }
  const handleColChange = (v: string) => { setColInput(v); if (locked) setRowInput(v) }
  const toggleLock = () => {
    if (!locked) setColInput(rowInput) // snap cols to rows when locking
    setLocked(l => !l)
  }

  const parse = (v: string) => Math.max(MIN, Math.min(MAX, parseInt(v) || MIN))
  const parsedRows = parse(rowInput)
  const parsedCols = parse(colInput)
  const isUnchanged = parsedRows === currentRows && parsedCols === currentCols

  const doResize = () => { resizeGrid(parsedRows, parsedCols); onClose() }

  const handleApply = () => {
    if (isUnchanged) return
    if (isNonEmpty) { setConfirming(true); return }
    doResize()
  }

  // Ref always points at the latest action so the effect only registers once.
  const onEnterRef = useRef<() => void>(() => {})
  onEnterRef.current = () => { confirming ? doResize() : handleApply() }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Enter') onEnterRef.current() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const inputCls = [
    'w-20 h-11 rounded-lg border-2 text-center text-base font-medium',
    'border-gray-300 bg-gray-100 text-gray-900',
    'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
  ].join(' ')

  const btnBase = 'h-11 flex-1 rounded-lg px-4 text-sm font-medium transition-colors'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-80 rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900"
        onClick={e => e.stopPropagation()}
      >
        {!confirming ? (
          <>
            <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">
              Grid Size
            </h2>

            <div className="mb-2 flex items-end gap-2">
              <div className="flex flex-col items-center gap-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">Rows</label>
                <input
                  type="number"
                  min={MIN}
                  max={MAX}
                  value={rowInput}
                  onChange={e => handleRowChange(e.target.value)}
                  className={inputCls}
                />
              </div>

              <button
                onClick={toggleLock}
                aria-label={locked ? 'Unlock aspect ratio' : 'Lock to square'}
                aria-pressed={locked}
                className={[
                  'mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 text-lg transition-colors',
                  locked
                    ? 'border-gray-700 bg-gray-800 text-gray-100 dark:border-white dark:bg-white dark:text-gray-900'
                    : 'border-gray-300 bg-gray-100 text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400',
                ].join(' ')}
              >
                {<Link className="w-5 h-5" />}
              </button>

              <div className="flex flex-col items-center gap-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">Cols</label>
                <input
                  type="number"
                  min={MIN}
                  max={MAX}
                  value={colInput}
                  onChange={e => handleColChange(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <p className="mb-5 text-xs text-gray-400 dark:text-gray-500">
              {MIN}–{MAX} per dimension
            </p>

            <div className="flex gap-2">
              <button
                className={`${btnBase} bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300`}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className={`${btnBase} bg-gray-900 text-white disabled:opacity-40 dark:bg-white dark:text-gray-900`}
                onClick={handleApply}
                disabled={isUnchanged}
              >
                Apply
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-100">
              Clear current pattern?
            </h2>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Resizing to {parsedRows}×{parsedCols} will clear your pattern and reset undo history.
            </p>
            <div className="flex gap-2">
              <button
                className={`${btnBase} bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300`}
                onClick={() => setConfirming(false)}
              >
                Back
              </button>
              <button
                className={`${btnBase} bg-red-600 text-white`}
                onClick={doResize}
              >
                Clear & Resize
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
