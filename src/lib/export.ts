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

  const dataURL = offscreen.toDataURL('image/png')

  // Path 1 — Web Share API (iOS on HTTPS, e.g. Netlify/Vercel deployment).
  // navigator.share() requires a secure context; over HTTP (local dev server)
  // canShare is absent or returns false, so we fall through.
  // navigator.share() MUST be called synchronously within the gesture handler —
  // any await before it loses the gesture context and iOS rejects the call.
  // We therefore convert the canvas to a Blob synchronously via atob.
  if (navigator.canShare) {
    const blob = dataURLToBlob(dataURL)
    const file = new File([blob], filename, { type: 'image/png' })
    if (navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: filename }).catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        console.error('Share failed:', err)
      })
      return
    }
  }

  // Path 2 — touch device without share API (iOS over HTTP / local dev).
  // Opening the data URL in a new tab shows the image in Safari; the user can
  // long-press → "Save to Photos" or "Share" from there.
  if (navigator.maxTouchPoints > 0) {
    window.open(dataURL, '_blank')
    return
  }

  // Path 3 — desktop (Chrome, Firefox, Safari desktop).
  // Anchor-click triggers a real file download here.
  const link = document.createElement('a')
  link.href = dataURL
  link.download = filename
  link.click()
}

function dataURLToBlob(dataURL: string): Blob {
  const [header, data] = dataURL.split(',')
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png'
  const bytes = atob(data)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new Blob([arr], { type: mime })
}
