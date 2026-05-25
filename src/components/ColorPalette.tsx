import { useGridStore } from '../store'
import { HAMA_COLORS } from '../lib/colors'

export function ColorPalette() {
  const activeColor    = useGridStore(s => s.activeColor)
  const tool           = useGridStore(s => s.tool)
  const setActiveColor = useGridStore(s => s.setActiveColor)
  const setTool        = useGridStore(s => s.setTool)

  const btn = 'w-11 h-11 rounded-lg border-2 border-gray-300 bg-gray-100 text-gray-600 text-sm font-medium transition-colors active:bg-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:active:bg-gray-700'
  const activeBtn = 'w-11 h-11 rounded-lg border-2 border-gray-700 bg-gray-800 text-gray-100 text-sm font-bold transition-colors dark:border-white dark:bg-white dark:text-gray-900'

  return (
    <div className="flex shrink-0 flex-col justify-center overflow-y-auto border-l border-gray-200 px-2 py-3 dark:border-gray-800">
      <div className="grid grid-cols-4 gap-2">
        {/* Erase occupies the first cell; colors flow after it */}
        <button
          className={tool === 'erase' ? activeBtn : btn}
          onClick={() => setTool(tool === 'erase' ? 'paint' : 'erase')}
          aria-label="Eraser"
          aria-pressed={tool === 'erase'}
        >✕</button>

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
