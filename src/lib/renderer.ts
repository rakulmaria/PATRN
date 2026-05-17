export interface RenderState {
  grid: string[]
  rows: number
  cols: number
}

const GRID_LINE_COLOR = '#374151'

export function renderGrid(canvas: HTMLCanvasElement, state: RenderState): void {
  const { grid, rows, cols } = state
  const dpr = window.devicePixelRatio || 1
  const logicalW = canvas.clientWidth
  const logicalH = canvas.clientHeight

  // Resize the backing store only when dimensions change to avoid clearing a
  // frame that doesn't need it.
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

  const cellW = logicalW / cols
  const cellH = logicalH / rows

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const color = grid[row * cols + col]
      if (color) {
        ctx.fillStyle = color
        ctx.fillRect(col * cellW, row * cellH, cellW, cellH)
      }
    }
  }

  // Draw grid lines after fills so they're always visible
  ctx.strokeStyle = GRID_LINE_COLOR
  ctx.lineWidth = 0.5
  ctx.beginPath()
  for (let col = 0; col <= cols; col++) {
    const x = col * cellW
    ctx.moveTo(x, 0)
    ctx.lineTo(x, logicalH)
  }
  for (let row = 0; row <= rows; row++) {
    const y = row * cellH
    ctx.moveTo(0, y)
    ctx.lineTo(logicalW, y)
  }
  ctx.stroke()

  ctx.restore()
}
