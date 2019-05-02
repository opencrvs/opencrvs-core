import { colors } from './colors'
import { fonts, IFonts } from './fonts'
import { grid, IGrid } from './grid'

// Use alpha-2 country codes

export interface ITheme {
  colors: typeof colors
  fonts: IFonts
  grid: IGrid
}
export const getTheme = (country: string, language: string): ITheme => ({
  colors,
  fonts: fonts(country, language),
  grid
})
