
import { Grid } from './Grid'
import { LocaleThemes } from './LocaleThemes'

const locale = process.env.REACT_APP_LOCALE
? process.env.REACT_APP_LOCALE
: 'gb'

export interface IFonts {
  boldFont: string
  lightFont: string
  regularFont: string
  defaultFontStyle: string
  lightFontStyle: string
  infoFontStyle: string
  capsFontStyle: string
  h1FontStyle: string
  h2FontStyle: string
  h3FontStyle: string
}

export const Fonts: IFonts = {
  boldFont: LocaleThemes[locale].boldFontFamily,
  lightFont: LocaleThemes[locale].lightFontFamily,
  regularFont: LocaleThemes[locale].regularFontFamily,
  defaultFontStyle: `font-family: ${LocaleThemes[locale].regularFontFamily};
    font-weight: 300;
    font-size: 16px;
    @media (max-width: ${Grid.breakpoints.lg}px) {
      font-size: 18px;
    }
    letter-spacing: 0.1px;`,
  lightFontStyle: `font-family: ${LocaleThemes[locale].lightFontFamily};
    font-weight: 300;
    font-size: 16px;
    @media (max-width: ${Grid.breakpoints.lg}px) {
      font-size: 18px;
    }
    letter-spacing: 0.1px;`,
  infoFontStyle: `font-family: ${LocaleThemes[locale].regularFontFamily};
    font-weight: 300;
    font-size: 12px;
    @media (max-width: ${Grid.breakpoints.lg}px) {
      font-size: 14px;
    }
    letter-spacing: 0.1px;`,
  capsFontStyle: `font-family: ${LocaleThemes[locale].regularFontFamily};
    font-weight: 300;
    font-size: 14px;
    @media (max-width: ${Grid.breakpoints.lg}px) {
      font-size: 16px;
    }
    letter-spacing: 2.5px;
    text-transform: uppercase`,
  h1FontStyle: `font-family: ${LocaleThemes[locale].lightFontFamily};
    font-weight: 300;
    font-size: 30px;
    @media (max-width: ${Grid.breakpoints.lg}px) {
      font-size: 32px;
    }
    letter-spacing: 0.1px;
    text-transform: uppercase`,
  h2FontStyle: `font-family: ${LocaleThemes[locale].lightFontFamily};
    font-weight: 300;
    font-size: 24px;
    @media (max-width: ${Grid.breakpoints.lg}px) {
      font-size: 26px;
    }
    letter-spacing: 0.1px;
    text-transform: uppercase`,
  h3FontStyle: `font-family: ${LocaleThemes[locale].lightFontFamily};
    font-weight: 300;
    font-size: 20px;
    @media (max-width: ${Grid.breakpoints.lg}px) {
      font-size: 22px;
    }
    letter-spacing: 0.1px;
    text-transform: uppercase`
}
