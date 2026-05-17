import { GridCanvas } from './components/GridCanvas'

export default function App() {
  return (
    <div className="flex h-dvh w-screen items-center justify-center bg-gray-900 p-4">
      <div className="aspect-square h-full max-h-full max-w-full">
        <GridCanvas />
      </div>
    </div>
  )
}
