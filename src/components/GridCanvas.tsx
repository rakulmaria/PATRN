import { forwardRef, useEffect, useImperativeHandle, useRef, useCallback } from 'react'
import { useGridStore } from '../store'
import { renderGrid, AXIS_LABEL_SIZE } from '../lib/renderer'
import { coordsToIndex } from '../lib/grid'

export const GridCanvas = forwardRef<HTMLCanvasElement>(function GridCanvas(_, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)

  const { grid, rows, cols } = useGridStore()

  // Expose the raw canvas element to the parent (used for PNG export).
  useImperativeHandle(ref, () => canvasRef.current!, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    renderGrid(canvas, { grid, rows, cols })
  }, [grid, rows, cols])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(() => {
      renderGrid(canvas, useGridStore.getState())
    })
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  // Reads fresh state from the store so touch/mouse callbacks are stable
  // references and don't need to be re-registered on every color/tool change.
  const applyTool = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const { tool, rows, cols, paintCell, eraseCell } = useGridStore.getState()
    const index = coordsToIndex(clientX, clientY, canvas.getBoundingClientRect(), rows, cols, AXIS_LABEL_SIZE)
    if (index === null) return
    tool === 'erase' ? eraseCell(index) : paintCell(index)
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true
    useGridStore.getState().beginStroke()
    applyTool(e.clientX, e.clientY)
  }, [applyTool])

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return
    applyTool(e.clientX, e.clientY)
  }, [applyTool])

  const stopDrawing = useCallback(() => { isDrawingRef.current = false }, [])

  const onTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault()
    isDrawingRef.current = true
    useGridStore.getState().beginStroke()
    applyTool(e.touches[0].clientX, e.touches[0].clientY)
  }, [applyTool])

  const onTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault()
    applyTool(e.touches[0].clientX, e.touches[0].clientY)
  }, [applyTool])

  // Touch events need { passive: false } to allow preventDefault — React's
  // synthetic events don't support this, so we attach them imperatively.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', stopDrawing)
    return () => {
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', stopDrawing)
    }
  }, [onTouchStart, onTouchMove, stopDrawing])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
    />
  )
})
