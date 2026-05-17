// Composites the grid canvas over a white background before exporting.
// Empty cells are transparent in the live canvas (intentional for the dark UI),
// but white makes more sense in a saved pattern reference.
export function downloadGridAsPng(
  canvas: HTMLCanvasElement,
  filename = 'pattern.png',
): void {
  const offscreen = document.createElement('canvas')
  offscreen.width = canvas.width
  offscreen.height = canvas.height

  const ctx = offscreen.getContext('2d')!
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, offscreen.width, offscreen.height)
  ctx.drawImage(canvas, 0, 0)

  const link = document.createElement('a')
  link.href = offscreen.toDataURL('image/png')
  link.download = filename
  link.click()
}
