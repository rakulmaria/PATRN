```
██████╗  █████╗ ████████╗██████╗ ███╗   ██╗  ✦
██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗████╗  ██║
██████╔╝███████║   ██║   ██████╔╝██╔██╗ ██║
██╔═══╝ ██╔══██║   ██║   ██╔══██╗██║╚██╗██║
██║     ██║  ██║   ██║   ██║  ██║██║ ╚████║
╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝
```

A canvas-based perler bead pattern designer built for iPad. Pick a color, paint cells, build a pattern — then use it as a reference while placing real beads on a pegboard.

Think MS Paint meets a bead pegboard.

---

## Features

- **29×29 grid** rendered on a single HTML Canvas — retina-sharp on all displays
- **33 Hama bead colors** in a horizontally scrollable palette
- **Paint & erase** — tap or drag to fill cells; full erase tool
- **Undo / redo** — entire drag strokes are one undo step (Cmd/Ctrl+Z / Cmd/Ctrl+Shift+Z)
- **Pencil-only mode** — blocks finger/palm input, lets you draw with Apple Pencil while your hand rests on the screen
- **Axis labels** — numbered rows and columns so counting beads is easy
- **Export as PNG** — white background composite, retina resolution
- **Persistent** — grid, active color, and settings survive page reloads via localStorage

---

## Stack

| | |
|---|---|
| Framework | React 18 + TypeScript |
| Bundler | Vite |
| Styling | Tailwind CSS v4 |
| State | Zustand with `persist` middleware |
| Rendering | HTML Canvas (no DOM cells) |
| Input | Pointer Events API (finger, pen, mouse) |

---

## Running locally

```bash
npm install
npm run dev
```

To use on iPad over your local network:

```bash
npm run dev -- --host
```

Then open `http://<your-mac-ip>:5173` in Safari on your iPad.

---

## Project structure

```
src/
  store.ts                 # All state + actions (Zustand)
  lib/
    grid.ts                # Pure grid math (createGrid, coordsToIndex)
    renderer.ts            # Canvas draw function + AXIS_LABEL_SIZE
    colors.ts              # 33 Hama bead colors
    export.ts              # PNG export (Web Share API on iOS, download on desktop)
  components/
    GridCanvas.tsx         # Canvas mount, pointer events, resize observer
    ColorPalette.tsx       # Fixed controls + scrollable color swatches
  App.tsx                  # Root layout + keyboard shortcuts
```

---

## Architecture notes

**Grid state** is a flat `string[]` of length `rows × cols`, indexed as `row * cols + col`. Empty cell = `""`. This lives in Zustand and is the single source of truth — the canvas is just a view over it.

**Undo/redo** uses a snapshot stack. `beginStroke()` is called once on pointer-down and snapshots the current grid. `paintCell` and `eraseCell` modify the grid freely without touching history, so an entire drag stroke is one undo step. Max 100 steps.

**Input** is handled entirely via the Pointer Events API. `touch-action: none` on the canvas tells the browser not to scroll on touch, removing the need for `{ passive: false }` event listeners. `setPointerCapture` keeps events firing even when the pointer drifts outside the canvas.

**Pencil-only mode** filters on `e.pointerType === 'touch'` — blocking fingers and palms while passing through `'pen'` (Apple Pencil) and `'mouse'` (desktop).
