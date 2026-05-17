export function createGrid(rows: number, cols: number): string[] {
  return new Array(rows * cols).fill('')
}

export function cellIndex(row: number, col: number, cols: number): number {
  return row * cols + col
}

export function coordsToIndex(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  rows: number,
  cols: number,
): number | null {
  const col = Math.floor(((clientX - rect.left) / rect.width) * cols)
  const row = Math.floor(((clientY - rect.top) / rect.height) * rows)
  if (row < 0 || row >= rows || col < 0 || col >= cols) return null
  return cellIndex(row, col, cols)
}
