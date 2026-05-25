import { forwardRef, useEffect, useImperativeHandle, useRef, useCallback } from 'react'
import { useGridStore } from '../store'
import { renderGrid, AXIS_LABEL_SIZE } from '../lib/renderer'
import { coordsToIndex } from '../lib/grid'

export const GridCanvas = forwardRef<HTMLCanvasElement>(function GridCanvas(_, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)

  const { grid, rows, cols, theme } = useGridStore()

  useImperativeHandle(ref, () => canvasRef.current!, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    renderGrid(canvas, { grid, rows, cols, theme })
  }, [grid, rows, cols, theme])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(() => {
      renderGrid(canvas, useGridStore.getState())
    })
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  const applyTool = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const { tool, rows, cols, paintCell, eraseCell } = useGridStore.getState()
    const index = coordsToIndex(clientX, clientY, canvas.getBoundingClientRect(), rows, cols, AXIS_LABEL_SIZE)
    if (index === null) return
    tool === 'erase' ? eraseCell(index) : paintCell(index)
  }, [])

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const { pencilOnly, beginStroke } = useGridStore.getState()
    // In pencil-only mode, ignore finger input but still allow pen and mouse
    // (mouse keeps desktop dev working).
    if (pencilOnly && e.pointerType === 'touch') return
    e.currentTarget.setPointerCapture(e.pointerId)
    isDrawingRef.current = true
    beginStroke()
    applyTool(e.clientX, e.clientY)
  }, [applyTool])

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return
    if (useGridStore.getState().pencilOnly && e.pointerType === 'touch') return
    applyTool(e.clientX, e.clientY)
  }, [applyTool])

  const stopDrawing = useCallback(() => { isDrawingRef.current = false }, [])

  // touch-none tells the browser not to handle touch gestures (scroll/zoom)
  // on this element, which lets pointer events fire without preventDefault.
  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full touch-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopDrawing}
      onPointerCancel={stopDrawing}
    />
  )
})
