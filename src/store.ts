import { create } from 'zustand'
import { createGrid } from './lib/grid'

const DEFAULT_ROWS = 29
const DEFAULT_COLS = 29

interface GridStore {
  grid: string[]
  rows: number
  cols: number
  activeColor: string
  tool: 'paint' | 'erase'
  setActiveColor: (color: string) => void
  setTool: (tool: 'paint' | 'erase') => void
  paintCell: (index: number) => void
  eraseCell: (index: number) => void
  clearGrid: () => void
}

export const useGridStore = create<GridStore>((set, get) => ({
  grid: createGrid(DEFAULT_ROWS, DEFAULT_COLS),
  rows: DEFAULT_ROWS,
  cols: DEFAULT_COLS,
  activeColor: '#ff0000',
  tool: 'paint',

  setActiveColor: (color) => set({ activeColor: color }),
  setTool: (tool) => set({ tool }),

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
    const { rows, cols } = get()
    set({ grid: createGrid(rows, cols) })
  },
}))
