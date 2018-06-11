
import { LocaleThemes } from './LocaleThemes'

const locale = process.env.REACT_APP_LOCALE
? process.env.REACT_APP_LOCALE
: 'gb'

export interface IFonts {
  boldFont: string
  lightFont: string
  regularFont: string
}

export const Fonts: IFonts = {
  boldFont: LocaleThemes[locale].boldFontFamily,
  lightFont: LocaleThemes[locale].lightFontFamily,
  regularFont: LocaleThemes[locale].regularFontFamily,
}

