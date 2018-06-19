import { colors, IColors } from './colors'
import { fonts, IFonts } from './fonts'
import { grid, IGrid } from './grid'

// Use alpha-2 country codes

export interface ITheme {
  colors: IColors
  fonts: IFonts
  grid: IGrid
}
export const getTheme = (locale: string): ITheme =>
  ({
    colors,
    fonts: fonts(locale),
    grid
  } as ITheme)
