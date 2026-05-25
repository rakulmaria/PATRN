import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createGrid } from './lib/grid'

const DEFAULT_ROWS = 29
const DEFAULT_COLS = 29
const MAX_HISTORY = 100

interface GridStore {
  grid: string[]
  rows: number
  cols: number
  activeColor: string
  tool: 'paint' | 'erase'
  past: string[][]
  future: string[][]
  pencilOnly: boolean
  theme: 'light' | 'dark'
  setActiveColor: (color: string) => void
  setTool: (tool: 'paint' | 'erase') => void
  setPencilOnly: (v: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
  // Call once at the start of each paint/erase gesture — snapshots the current
  // grid into history so the whole stroke is one undo step.
  beginStroke: () => void
  paintCell: (index: number) => void
  eraseCell: (index: number) => void
  clearGrid: () => void
  resizeGrid: (rows: number, cols: number) => void
  undo: () => void
  redo: () => void
}

export const useGridStore = create<GridStore>()(
  persist(
    (set, get) => ({
      grid: createGrid(DEFAULT_ROWS, DEFAULT_COLS),
      rows: DEFAULT_ROWS,
      cols: DEFAULT_COLS,
      activeColor: '#ff0000',
      tool: 'paint' as const,
      past: [],
      future: [],
      pencilOnly: false,
      theme: 'dark' as const,

      setActiveColor: (color) => set({ activeColor: color }),
      setTool: (tool) => set({ tool }),
      setPencilOnly: (pencilOnly) => set({ pencilOnly }),
      setTheme: (theme) => set({ theme }),

      beginStroke: () => {
        const { grid, past } = get()
        const trimmed = past.length >= MAX_HISTORY ? past.slice(1) : past
        set({ past: [...trimmed, grid], future: [] })
      },

      paintCell: (index) => {
        const { grid, activeColor } = get()
        const next = grid.slice()
        next[index] = activeColor
        set({ grid: next })
      },

      eraseCell: (index) => {
        const { grid } = get()
        const next = grid.slice()
        next[index] = ''
        set({ grid: next })
      },

      clearGrid: () => {
        const { grid, rows, cols, past } = get()
        const trimmed = past.length >= MAX_HISTORY ? past.slice(1) : past
        set({ grid: createGrid(rows, cols), past: [...trimmed, grid], future: [] })
      },

      // Undo history is cleared on resize — restoring a differently-sized grid
      // array across dimension changes isn't supported.
      resizeGrid: (newRows, newCols) => {
        set({ grid: createGrid(newRows, newCols), rows: newRows, cols: newCols, past: [], future: [] })
      },

      undo: () => {
        const { grid, past, future } = get()
        if (past.length === 0) return
        const prev = past[past.length - 1]
        set({
          grid: prev,
          past: past.slice(0, -1),
          future: [grid, ...future].slice(0, MAX_HISTORY),
        })
      },

      redo: () => {
        const { grid, past, future } = get()
        if (future.length === 0) return
        const next = future[0]
        set({
          grid: next,
          past: [...past, grid].slice(-MAX_HISTORY),
          future: future.slice(1),
        })
      },
    }),
    {
      name: 'patrn-grid',
      // History is session-only. tool resets to paint on reload.
      partialize: (state) => ({
        grid: state.grid,
        rows: state.rows,
        cols: state.cols,
        activeColor: state.activeColor,
        pencilOnly: state.pencilOnly,
        theme: state.theme,
      }),
    },
  ),
)
