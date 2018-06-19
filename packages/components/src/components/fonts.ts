import { grid } from './grid'

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

const localeFonts = {
  bd: {
    boldFontFamily: 'noto_sans_bengalibold',
    lightFontFamily: 'noto_sans_bengalilight',
    regularFontFamily: 'noto_sans_bengaliregular'
  },
  gb: {
    boldFontFamily: 'noto_sansbold',
    lightFontFamily: 'noto_sanslight',
    regularFontFamily: 'noto_sansregular'
  },
  za: {
    boldFontFamily: 'noto_sansbold',
    lightFontFamily: 'noto_sanslight',
    regularFontFamily: 'noto_sansregular'
  }
}

export const fonts = (locale: string): IFonts => ({
  boldFont: localeFonts[locale].boldFontFamily,
  lightFont: localeFonts[locale].lightFontFamily,
  regularFont: localeFonts[locale].regularFontFamily,
  defaultFontStyle: `font-family: ${localeFonts[locale].regularFontFamily};
    font-weight: 300;
    font-size: 16px;
    @media (max-width: ${grid.breakpoints.lg}px) {
      font-size: 18px;
    }
    letter-spacing: 0.1px;`,
  lightFontStyle: `font-family: ${localeFonts[locale].lightFontFamily};
    font-weight: 300;
    font-size: 16px;
    @media (max-width: ${grid.breakpoints.lg}px) {
      font-size: 18px;
    }
    letter-spacing: 0.1px;`,
  infoFontStyle: `font-family: ${localeFonts[locale].regularFontFamily};
    font-weight: 300;
    font-size: 12px;
    @media (max-width: ${grid.breakpoints.lg}px) {
      font-size: 14px;
    }
    letter-spacing: 0.1px;`,
  capsFontStyle: `font-family: ${localeFonts[locale].regularFontFamily};
    font-weight: 300;
    font-size: 14px;
    @media (max-width: ${grid.breakpoints.lg}px) {
      font-size: 16px;
    }
    letter-spacing: 2.5px;
    text-transform: uppercase;`,
  h1FontStyle: `font-family: ${localeFonts[locale].lightFontFamily};
    font-weight: 300;
    font-size: 30px;
    @media (max-width: ${grid.breakpoints.lg}px) {
      font-size: 32px;
    }
    letter-spacing: 0.1px;
    text-transform: uppercase;`,
  h2FontStyle: `font-family: ${localeFonts[locale].lightFontFamily};
    font-weight: 300;
    font-size: 24px;
    @media (max-width: ${grid.breakpoints.lg}px) {
      font-size: 26px;
    }
    letter-spacing: 0.1px;
    text-transform: uppercase;`,
  h3FontStyle: `font-family: ${localeFonts[locale].lightFontFamily};
    font-weight: 300;
    font-size: 20px;
    @media (max-width: ${grid.breakpoints.lg}px) {
      font-size: 22px;
    }
    letter-spacing: 0.1px;
    text-transform: uppercase;`
})
