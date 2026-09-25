export const colors = {
  bg:      '#080808',
  bg1:     '#0f0f0f',
  bg2:     '#141414',
  bg3:     '#1c1c1c',
  border:  '#1e1e1e',
  border2: '#2a2a2a',
  text:    '#f0f0f0',
  text2:   '#888888',
  text3:   '#444444',
  accent:  '#e8ff47',
  blue:    '#4d7cff',
  red:     '#ff4d4d',
  green:   '#4dffb4',
  orange:  '#ff9900',
  purple:  '#a78bfa',
} as const

export const fonts = {
  sans: '"Space Grotesk", system-ui, sans-serif',
  mono: '"Space Mono", monospace',
} as const

export type ColorKey = keyof typeof colors
