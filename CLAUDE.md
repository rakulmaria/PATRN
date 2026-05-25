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
- Lucide React (`lucide-react`) for SVG icons
- No backend; localStorage handles persistence
- Deployed to Vercel

## Architecture rules — always follow these

### Grid state
- Flat `string[]`, length = `rows × cols`, indexed as `row * cols + col`. Empty cell = `""`.
- Lives in the Zustand store.

### Zustand store (`src/store.ts`)
Holds:
```
grid: string[]        activeColor: string
rows: number          tool: 'paint' | 'erase'
cols: number          past: string[][]    // undo history (max 100)
pencilOnly: boolean   future: string[][]  // redo stack
theme: 'light'|'dark'
```
Actions: `setActiveColor`, `setTool`, `setPencilOnly`, `setTheme`, `beginStroke`, `paintCell`, `eraseCell`, `clearGrid`, `resizeGrid`, `undo`, `redo`.

Persistence: `persist` middleware with `partialize` — `grid`, `rows`, `cols`, `activeColor`, `pencilOnly`, and `theme` are saved to localStorage. History and tool reset on reload.

### Undo/redo — the `beginStroke` pattern
`paintCell` and `eraseCell` do NOT push to history. Instead, call `beginStroke()` once at pointer-down; it snapshots the current grid. This makes an entire drag stroke one undo step. `clearGrid` pushes its own snapshot. `resizeGrid` clears history entirely (restoring across dimension changes is unsupported). Max history depth: 100.

### Canvas rendering (`src/lib/renderer.ts`)
- Single `<canvas>` element, rendered by `renderGrid(canvas, { grid, rows, cols, theme })`.
- Retina-aware: backing store is set to `logicalSize × devicePixelRatio`, then `ctx.scale(dpr, dpr)` — all drawing uses logical pixel coordinates.
- `AXIS_LABEL_SIZE = 20` (exported constant) — the left/top margin reserved for axis labels. **Any code that maps canvas coordinates to cell indices must subtract this offset.**
- Grid lines drawn after cell fills so they're always visible.
- Axis labels: column numbers across the top, row numbers down the left. Labels fall back to every 5th when cells are narrower than 14px. Font is `"Space Mono", monospace`.
- `COLORS` object holds theme-aware `gridLine` and `label` colours.

### Coordinate math (`src/lib/grid.ts`)
`coordsToIndex(clientX, clientY, rect, rows, cols, offset = 0)` — `offset` is `AXIS_LABEL_SIZE`. Clicks inside the margin (label area) return `null`.

### Input events — Pointer Events API
All input (finger, pen, mouse) is handled via `onPointerDown`/`onPointerMove`/`onPointerUp`/`onPointerCancel` React synthetic events. `touch-action: none` on the canvas element tells the browser not to scroll/zoom, eliminating the need for `{ passive: false }` or `preventDefault()`. `setPointerCapture` on `pointerdown` keeps events firing even if the pointer drifts outside the canvas.

`pencilOnly` mode: when enabled, events with `pointerType === 'touch'` are ignored (fingers and palms), while `'pen'` (Apple Pencil) and `'mouse'` (desktop dev) still work.

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
| `src/components/LeftToolbar.tsx` | Left sidebar — 3×3×2 button grid (color swatch, undo, redo, pencil-only, theme, resize, clear, export) |
| `src/components/ColorPalette.tsx` | Right sidebar — erase + 33 color swatches in a 4-column grid, vertical scroll |
| `src/components/GridSizeDialog.tsx` | Modal for resizing the grid; rows×cols inputs, square-lock toggle, confirmation step |
| `src/App.tsx` | Root layout, canvas ref, keyboard shortcuts, dialog state |

### Layout
App is a `flex-col h-dvh`. Inside: a `flex-row flex-1` row containing left toolbar | center grid | right palette, plus a `shrink-0` footer.

The center grid container uses `container-type: size`. The grid div inside it uses:
```
width: min(100cqi, calc(100cqb * cols / rows))
aspect-ratio: cols / rows
```
This is the general formula for "largest rectangle of a given aspect ratio that fits a container" — for square grids it reduces to `min(100cqi, 100cqb)`. Grid re-renders on resize via `ResizeObserver`.

### Grid size dialog (`src/components/GridSizeDialog.tsx`)
- Rows × cols number inputs (range 2–200), with a square-lock toggle (`Link` icon from Lucide) between them.
- Lock defaults to `true` when current grid is square. Locking snaps cols to match rows.
- If the grid is non-empty, Apply shows a confirmation step before calling `resizeGrid`.
- Enter key triggers Apply / confirm via a handler-ref pattern (registered once on mount, always reads latest state).

### Typography
Space Mono (Google Fonts) is loaded via `<link>` in `index.html` and applied globally via `font-family` on `body` in `index.css`. The canvas axis labels also use `"Space Mono", monospace` via `ctx.font`.

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
1. Canvas grid renderer (retina-aware, offset for axis labels, Space Mono font)
2. Color palette UI — 33 Hama colors in a 4-column right sidebar with vertical scroll
3. Paint on tap and drag (Pointer Events API — finger, pen, mouse)
4. Erase tool
5. Clear / reset grid (pushes to undo history)
6. Export grid as PNG (white background composite)
7. Undo / redo — `beginStroke` pattern, 100-step history, Cmd/Ctrl+Z / Cmd/Ctrl+Shift+Z
8. localStorage persistence — grid, dimensions, active color, pencilOnly, theme survive reload
9. Axis labels — column numbers top, row numbers left; auto-thinning for small cells
10. Pencil-only mode — blocks finger/palm input (`pointerType === 'touch'`), allows Apple Pencil + mouse
11. Light / dark mode toggle — `theme` field in store, persisted, renderer and UI both theme-aware
12. Configurable grid size — `resizeGrid(rows, cols)` action, GridSizeDialog with square-lock and confirmation
13. Three-column layout — left toolbar (controls), center grid, right palette
14. Lucide React icons throughout the left toolbar
15. Footer with copyright and link to rakulmaria.com
16. Deployed to Vercel

### Future work (prioritised)

1. **Pattern nudge / reposition** — a "move" tool that shifts the entire painted pattern by N cells in any direction. Cells that fall outside the grid boundary are clipped (or optionally wrap). Useful when the user finishes a design and realises it is off-centre. Implementation: a translate operation on the flat grid array — pure function, no canvas changes needed.

### Permanently out of scope
- Image import / color quantization
- Pinch-to-zoom / pan
- Knitting or cross-stitch modes
- Any backend or user accounts
