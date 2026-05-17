export interface BeadColor {
  name: string
  hex: string
}

// Approximate hex values for the standard Hama Midi bead palette.
// Names follow Hama's numbering order (light → dark, warm → cool).
export const HAMA_COLORS: BeadColor[] = [
  { name: 'White',       hex: '#FFFFFF' },
  { name: 'Cream',       hex: '#FFF8DC' },
  { name: 'Light Yellow',hex: '#FFEC8B' },
  { name: 'Yellow',      hex: '#FFD700' },
  { name: 'Light Orange',hex: '#FFA500' },
  { name: 'Orange',      hex: '#FF6600' },
  { name: 'Light Pink',  hex: '#FFB6C1' },
  { name: 'Pink',        hex: '#FF69B4' },
  { name: 'Dark Pink',   hex: '#FF1493' },
  { name: 'Red',         hex: '#CC0000' },
  { name: 'Dark Red',    hex: '#8B0000' },
  { name: 'Lavender',    hex: '#DDA0FF' },
  { name: 'Lilac',       hex: '#BB66FF' },
  { name: 'Purple',      hex: '#9900CC' },
  { name: 'Dark Purple', hex: '#4B0082' },
  { name: 'Sky Blue',    hex: '#87CEEB' },
  { name: 'Blue',        hex: '#0066CC' },
  { name: 'Dark Blue',   hex: '#003399' },
  { name: 'Navy',        hex: '#000066' },
  { name: 'Turquoise',   hex: '#00BBBB' },
  { name: 'Mint',        hex: '#98FF98' },
  { name: 'Light Green', hex: '#55CC55' },
  { name: 'Green',       hex: '#009900' },
  { name: 'Dark Green',  hex: '#005500' },
  { name: 'Olive',       hex: '#808000' },
  { name: 'Tan',         hex: '#D2B48C' },
  { name: 'Light Brown', hex: '#C68642' },
  { name: 'Brown',       hex: '#8B4513' },
  { name: 'Dark Brown',  hex: '#3D1C02' },
  { name: 'Light Grey',  hex: '#CCCCCC' },
  { name: 'Grey',        hex: '#888888' },
  { name: 'Dark Grey',   hex: '#444444' },
  { name: 'Black',       hex: '#111111' },
]
