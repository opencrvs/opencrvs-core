import { grid } from './grid'

export interface IFonts {
  bodyStyle: string
  bigBodyStyle: string
  regularFont: string
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
      regularFontFamily: 'noto_sans_bengaliregular'
    },
    en: {
      regularFontFamily: 'noto_sansregular'
    }
  },
  gbr: {
    en: {
      regularFontFamily: 'noto_sansregular'
    }
  },
  za: {
    en: {
      regularFontFamily: 'noto_sansregular'
    }
  }
}

export const fonts = (country: string, language: string): IFonts => ({
  englishTextFont: 'noto_sansregular',
  regularFont: countryFonts[country][language].regularFontFamily,
  bigBodyBoldStyle: `font-family: ${
    countryFonts[country][language].regularFontFamily
  };
    font-weight: 600;
    font-size: 18px;
    line-height: 27px;`,
  bigBodyStyle: `font-family: ${
    countryFonts[country][language].regularFontFamily
  };
    font-weight: 400;
    font-size: 18px;
    line-height: 27px;`,
  bodyStyle: `font-family: ${countryFonts[country][language].regularFontFamily};
    font-size: 16px;
    line-height: 24px;`,
  subtitleStyle: `font-family: ${
    countryFonts[country][language].regularFontFamily
  };
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
    letter-spacing: 0.4px;`,
  captionStyle: `font-family: ${
    countryFonts[country][language].regularFontFamily
  };
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    letter-spacing: 0.4px;`,
  h4Style: `font-family: ${countryFonts[country][language].regularFontFamily};
    font-weight: 600;
    font-size: 24px;
    line-height: 36px;`,
  h3Style: `font-family: ${countryFonts[country][language].regularFontFamily};
    font-size: 27px;
    line-height: 40px;
    letter-spacing: 0.25px;`,
  h2Style: `font-family: ${countryFonts[country][language].regularFontFamily};
    font-size: 36px;
    line-height: 54px;`,
  h1Style: `font-family: ${countryFonts[country][language].regularFontFamily};
    font-size: 48px;
    line-height: 72px;`,
  heroStyle: `font-family: ${countryFonts[country][language].regularFontFamily};
    font-size: 80px;
    line-height: 120px;
    letter-spacing: -1.5px;`,
  buttonStyle: `font-family: ${
    countryFonts[country][language].regularFontFamily
  };
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 1px;`
})
