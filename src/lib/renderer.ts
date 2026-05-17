export interface RenderState {
  grid: string[]
  rows: number
  cols: number
}

// Margin reserved for axis labels on the left and top of the canvas.
// Exported so coordsToIndex can subtract it before mapping to cell indices.
export const AXIS_LABEL_SIZE = 20

const GRID_LINE_COLOR = '#374151'
const LABEL_COLOR = '#6b7280'
const LABEL_FONT = '9px system-ui'

export function renderGrid(canvas: HTMLCanvasElement, state: RenderState): void {
  const { grid, rows, cols } = state
  const dpr = window.devicePixelRatio || 1
  const logicalW = canvas.clientWidth
  const logicalH = canvas.clientHeight

  // Resize backing store only when dimensions actually change.
  const physW = Math.round(logicalW * dpr)
  const physH = Math.round(logicalH * dpr)
  if (canvas.width !== physW || canvas.height !== physH) {
    canvas.width = physW
    canvas.height = physH
  }

  const ctx = canvas.getContext('2d')!
  ctx.save()
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, logicalW, logicalH)

  const ox = AXIS_LABEL_SIZE  // grid origin x (left margin)
  const oy = AXIS_LABEL_SIZE  // grid origin y (top margin)
  const gridW = logicalW - ox
  const gridH = logicalH - oy
  const cellW = gridW / cols
  const cellH = gridH / rows

  // --- Cell fills ---
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const color = grid[row * cols + col]
      if (color) {
        ctx.fillStyle = color
        ctx.fillRect(ox + col * cellW, oy + row * cellH, cellW, cellH)
      }
    }
  }

  // --- Grid lines (drawn after fills so they're always visible) ---
  ctx.strokeStyle = GRID_LINE_COLOR
  ctx.lineWidth = 0.5
  ctx.beginPath()
  for (let col = 0; col <= cols; col++) {
    const x = ox + col * cellW
    ctx.moveTo(x, oy)
    ctx.lineTo(x, oy + gridH)
  }
  for (let row = 0; row <= rows; row++) {
    const y = oy + row * cellH
    ctx.moveTo(ox, y)
    ctx.lineTo(ox + gridW, y)
  }
  ctx.stroke()

  // --- Axis labels ---
  ctx.fillStyle = LABEL_COLOR
  ctx.font = LABEL_FONT
  ctx.textBaseline = 'middle'

  // Column numbers across the top — skip labels that would overlap neighbours.
  // "29" at 9px ≈ 13px wide; safe to show all when cellW >= 14.
  const colStep = cellW < 14 ? 5 : 1
  ctx.textAlign = 'center'
  for (let col = 0; col < cols; col++) {
    if (col !== 0 && col !== cols - 1 && col % colStep !== 0) continue
    ctx.fillText(String(col + 1), ox + col * cellW + cellW / 2, oy / 2)
  }

  // Row numbers down the left side.
  const rowStep = cellH < 14 ? 5 : 1
  ctx.textAlign = 'right'
  for (let row = 0; row < rows; row++) {
    if (row !== 0 && row !== rows - 1 && row % rowStep !== 0) continue
    ctx.fillText(String(row + 1), ox - 3, oy + row * cellH + cellH / 2)
  }

  ctx.restore()
}
