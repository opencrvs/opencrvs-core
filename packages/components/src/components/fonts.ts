import { grid } from './grid'

export interface IFonts {
  bodyStyle: string
  bodyBoldStyle: string
  bigBodyStyle: string
  regularFont: string
  semiBoldFont: string
  bigBodyBoldStyle: string
  heroStyle: string
  h1Style: string
  h2Style: string
  h3Style: string
  h4Style: string
  englishTextFont: string
  subtitleStyle: string
  captionStyle: string
  buttonStyle: string
}

const countryFonts = {
  bgd: {
    bn: {
      semiBoldFontFamily: 'noto_sans_bengali_semi_bold',
      regularFontFamily: 'noto_sans_bengali_regular'
    },
    en: {
      semiBoldFontFamily: 'noto_sans_semi_bold',
      regularFontFamily: 'noto_sans_regular'
    }
  },
  gbr: {
    en: {
      semiBoldFontFamily: 'noto_sans_semi_bold',
      regularFontFamily: 'noto_sans_regular'
    }
  },
  za: {
    en: {
      semiBoldFontFamily: 'noto_sans_semi_bold',
      regularFontFamily: 'noto_sans_regular'
    }
  }
}

export const fonts = (country: string, language: string): IFonts => ({
  englishTextFont: 'noto_sansregular',
  regularFont: countryFonts[country][language].regularFontFamily,
  semiBoldFont: countryFonts[country][language].semiBoldFontFamily,
  bigBodyBoldStyle: `font-family: ${countryFonts[country][language].semiBoldFontFamily};
    font-size: 18px;
    font-weight: normal;
    line-height: 27px;`,
  bigBodyStyle: `font-family: ${countryFonts[country][language].regularFontFamily};
    font-size: 18px;
    font-weight: normal;
    line-height: 27px;`,
  bodyStyle: `font-family: ${countryFonts[country][language].regularFontFamily};
    font-size: 16px;
    font-weight: normal;
    line-height: 24px;`,
  bodyBoldStyle: `font-family: ${countryFonts[country][language].semiBoldFontFamily};
    font-size: 16px;
    line-height: 24px;
    font-weight: normal;`,
  subtitleStyle: `font-family: ${countryFonts[country][language].semiBoldFontFamily};
    font-size: 14px;
    line-height: 21px;
    font-weight: normal;`,
  captionStyle: `font-family: ${countryFonts[country][language].regularFontFamily};
    font-size: 12px;
    line-height: 18px;
    font-weight: normal;
    letter-spacing: 0.4px;`,
  h4Style: `font-family: ${countryFonts[country][language].semiBoldFontFamily};
    font-size: 24px;
    font-weight: normal;
    line-height: 36px;`,
  h3Style: `font-family: ${countryFonts[country][language].regularFontFamily};
    font-size: 27px;
    line-height: 40px;
    font-weight: normal;
    letter-spacing: 0.25px;`,
  h2Style: `font-family: ${countryFonts[country][language].regularFontFamily};
    font-size: 36px;
    font-weight: normal;
    line-height: 54px;`,
  h1Style: `font-family: ${countryFonts[country][language].regularFontFamily};
    font-size: 48px;
    font-weight: normal;
    line-height: 72px;`,
  heroStyle: `font-family: ${countryFonts[country][language].regularFontFamily};
    font-size: 80px;
    line-height: 120px;
    font-weight: normal;
    letter-spacing: -1.5px;`,
  buttonStyle: `font-family: ${countryFonts[country][language].semiBoldFontFamily};
    font-size: 16px;
    line-height: 24px;
    font-weight: normal;
    letter-spacing: 1px;
    text-transform: uppercase;`
})
