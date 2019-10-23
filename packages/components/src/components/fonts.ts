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
  h5Style: string
  englishTextFont: string
  subtitleStyle: string
  captionStyle: string
  buttonStyle: string
  smallButtonStyle: string
}

// TODO: we need a way to load fonts for other languages without recompiling
const languageFonts = {
  bn: {
    semiBoldFontFamily: 'noto_sans_bengali_semi_bold',
    regularFontFamily: 'noto_sans_bengali_regular'
  },
  en: {
    semiBoldFontFamily: 'noto_sans_semi_bold',
    regularFontFamily: 'noto_sans_regular'
  },
  default: {
    semiBoldFontFamily: 'noto_sans_semi_bold',
    regularFontFamily: 'noto_sans_regular'
  }
}

export const fonts = (language: string): IFonts => {
  const regularFont =
    languageFonts[language].regularFontFamily ||
    languageFonts.default.regularFontFamily
  const semiBoldFont =
    languageFonts[language].semiBoldFontFamily ||
    languageFonts.default.semiBoldFontFamily

  return {
    englishTextFont: 'noto_sansregular',
    regularFont,
    semiBoldFont,
    bigBodyBoldStyle: `font-family: ${semiBoldFont};
      font-size: 18px;
      font-weight: normal;
      line-height: 27px;`,
    bigBodyStyle: `font-family: ${regularFont};
      font-size: 18px;
      font-weight: normal;
      line-height: 27px;`,
    bodyStyle: `font-family: ${regularFont};
      font-size: 16px;
      font-weight: normal;
      line-height: 24px;`,
    bodyBoldStyle: `font-family: ${semiBoldFont};
      font-size: 16px;
      line-height: 24px;
      font-weight: normal;`,
    subtitleStyle: `font-family: ${semiBoldFont};
      font-size: 14px;
      line-height: 21px;
      font-weight: normal;`,
    captionStyle: `font-family: ${regularFont};
      font-size: 12px;
      line-height: 18px;
      font-weight: normal;
      letter-spacing: 0.4px;`,
    h5Style: `font-family: ${semiBoldFont};
      font-size: 21px;
      font-weight: normal;
      line-height: 31px;`,
    h4Style: `font-family: ${semiBoldFont};
      font-size: 24px;
      font-weight: normal;
      line-height: 36px;`,
    h3Style: `font-family: ${regularFont};
      font-size: 27px;
      line-height: 40px;
      font-weight: normal;
      letter-spacing: 0.25px;`,
    h2Style: `font-family: ${regularFont};
      font-size: 36px;
      font-weight: normal;
      line-height: 54px;`,
    h1Style: `font-family: ${regularFont};
      font-size: 48px;
      font-weight: normal;
      line-height: 72px;`,
    heroStyle: `font-family: ${regularFont};
      font-size: 80px;
      line-height: 120px;
      font-weight: normal;
      letter-spacing: -1.5px;`,
    buttonStyle: `font-family: ${semiBoldFont};
      font-size: 16px;
      line-height: 24px;
      font-weight: normal;
      letter-spacing: 1px;
      text-transform: uppercase;`,
    smallButtonStyle: `font-family: ${regularFont};
      font-size: 14px;
      line-height: 0px;
      font-weight: normal;
      text-transform: capitalize;`
  }
}
