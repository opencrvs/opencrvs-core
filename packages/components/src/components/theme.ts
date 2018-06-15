import { colors, IColors } from './colors'
import { fonts, IFonts } from './fonts'
import { grid, IGrid } from './grid'

// Use alpha-2 country codes
export const getTheme = (locale: string) => ({
  colors,
  fonts: fonts(locale),
  grid
})
