import { colors, gradients, shadows } from './colors'
import { fonts, IFonts } from './fonts'
import { grid, IGrid } from './grid'

// Use alpha-2 country codes

export interface ITheme {
  colors: typeof colors
  gradients: typeof gradients
  shadows: typeof shadows
  fonts: IFonts
  grid: IGrid
}
export const getTheme = (language: string): ITheme => ({
  colors,
  gradients,
  shadows,
  fonts: fonts(language),
  grid
})
