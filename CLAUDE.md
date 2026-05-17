# Perler Bead Pattern App — Project Assistant

## Who I am
I'm a CS master's student finishing in January. This is a hobby project and portfolio piece — I want code that is clean, well-reasoned, and something I'd be proud to walk through in a job interview. I have a strong programming background; don't over-explain basics, but do explain architectural decisions and tradeoffs.

## What we're building
An iPad-first perler bead pattern drawing app. The core interaction is simple:
- A grid representing a bead pegboard (default 29x29, configurable)
- A color palette of standard Hama/Perler bead colors
- Tap a color to select it, tap or drag across cells to paint them
- The result is a pattern the user can reference while placing physical beads

Think: MS Paint meets a bead pegboard. Touch-first, no unnecessary complexity.

## Tech stack
- React + TypeScript, bundled with Vite
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin) for layout and UI
- Zustand for global state, with `persist` middleware for localStorage
- HTML Canvas for grid rendering — not DOM cells
- No backend; localStorage handles persistence

## Architecture rules — always follow these

### Grid state
- Flat `string[]`, length = `rows × cols`, indexed as `row * cols + col`. Empty cell = `""`.
- Lives in the Zustand store.

### Zustand store (`src/store.ts`)
Holds:
```
grid: string[]        activeColor: string
rows: number          tool: 'paint' | 'erase'
cols: number          past: string[][]   // undo history (max 100)
                      future: string[][]  // redo stack
```
Actions: `setActiveColor`, `setTool`, `beginStroke`, `paintCell`, `eraseCell`, `clearGrid`, `undo`, `redo`.

Persistence: `persist` middleware with `partialize` — only `grid`, `rows`, `cols`, `activeColor` are saved to localStorage. History and tool reset on reload.

### Undo/redo — the `beginStroke` pattern
`paintCell` and `eraseCell` do NOT push to history. Instead, call `beginStroke()` once at pointer-down; it snapshots the current grid. This makes an entire drag stroke one undo step. `clearGrid` pushes its own snapshot. Max history depth: 100.

### Canvas rendering (`src/lib/renderer.ts`)
- Single `<canvas>` element, rendered by `renderGrid(canvas, { grid, rows, cols })`.
- Retina-aware: backing store is set to `logicalSize × devicePixelRatio`, then `ctx.scale(dpr, dpr)` — all drawing uses logical pixel coordinates.
- `AXIS_LABEL_SIZE = 20` (exported constant) — the left/top margin reserved for axis labels. **Any code that maps canvas coordinates to cell indices must subtract this offset.**
- Grid lines drawn after cell fills so they're always visible.
- Axis labels: column numbers across the top, row numbers down the left. Labels fall back to every 5th when cells are narrower than 14px.

### Coordinate math (`src/lib/grid.ts`)
`coordsToIndex(clientX, clientY, rect, rows, cols, offset = 0)` — `offset` is `AXIS_LABEL_SIZE`. Clicks inside the margin (label area) return `null`.

### Touch events
Attached imperatively with `{ passive: false }` — React synthetic events can't set this. Registered in a `useEffect` in `GridCanvas`. Callbacks are stable (read fresh state via `useGridStore.getState()`) so listeners never need to re-register on color/tool changes.

### Canvas ref / export
`GridCanvas` is a `forwardRef` component. `App` holds the canvas ref and passes it to `downloadGridAsPng` in `src/lib/export.ts`, which composites the canvas over a white background before exporting (empty cells are transparent in the live canvas but white makes sense in a saved pattern).

### Component responsibilities
| File | Role |
|---|---|
| `src/store.ts` | All state + actions |
| `src/lib/grid.ts` | Pure functions: `createGrid`, `cellIndex`, `coordsToIndex` |
| `src/lib/renderer.ts` | `renderGrid`, `AXIS_LABEL_SIZE` |
| `src/lib/colors.ts` | 33 Hama bead colors as `{ name, hex }[]` |
| `src/lib/export.ts` | `downloadGridAsPng` |
| `src/components/GridCanvas.tsx` | Canvas mount, events, resize observer |
| `src/components/ColorPalette.tsx` | Fixed controls + scrollable swatches |
| `src/App.tsx` | Root layout, canvas ref, keyboard shortcuts |

### Layout
App is a flex column: grid area (`flex-1`) + palette strip (`shrink-0`). The grid container uses `container-type: size` + `width: min(100cqi, 100cqb)` — the correct CSS idiom for "largest square that fits an arbitrary rectangle." Grid re-renders on resize via `ResizeObserver`.

## iPad / touch specifics — always keep in mind
- All tap targets minimum 44×44px
- No hover-only interactions
- Touch events on canvas need `{ passive: false }` and `e.preventDefault()` on `touchmove` to prevent scroll-while-painting
- Test mental model: a user's finger, not a mouse cursor

## How you should behave
- Before writing any significant code, briefly state the approach and data structures you'll use. One short paragraph is enough — then write the code.
- If I'm about to do something in a naive or problematic way, stop me and explain why before proceeding.
- Prefer explicit TypeScript types. No `any`. Name things clearly.
- Comment the "why", not the "what".
- When a feature request has non-obvious edge cases (e.g. drag-painting across cells, canvas coordinate math on retina displays), call them out.
- Keep responses focused. Don't rewrite working code unless asked. When updating existing code, show only the changed parts with enough context to locate them.

## Feature status

### Complete
1. Canvas grid renderer (retina-aware, offset for axis labels)
2. Color palette UI — 33 Hama colors, fixed controls + scrollable swatches
3. Paint on tap and drag (touch + mouse)
4. Erase tool
5. Clear / reset grid (pushes to undo history)
6. Export grid as PNG (white background composite)
7. Undo / redo — `beginStroke` pattern, 100-step history, Cmd/Ctrl+Z / Cmd/Ctrl+Shift+Z
8. localStorage persistence — grid, dimensions, active color survive reload
9. Axis labels — column numbers top, row numbers left; auto-thinning for small cells

### Out of scope for now
- Image import / color quantization
- Pinch-to-zoom / pan
- Knitting or cross-stitch modes
- Any backend or user accounts
