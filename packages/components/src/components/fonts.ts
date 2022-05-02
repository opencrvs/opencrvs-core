/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
export interface IFonts {
  regularFont: string
  semiBoldFont: string

  h1: string
  h2: string
  h3: string
  h4: string

  bold16: string
  bold14: string
  bold12: string

  reg18: string
  reg16: string
  reg14: string
  reg12: string
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
  fr: {
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
    // Fonts

    regularFont,
    semiBoldFont,

    // Headings

    h1: `font-family: ${semiBoldFont};
    font-size: 36px;
    font-weight: 600;
    line-height: 54px;
    `,

    h2: `font-family: ${semiBoldFont};
    font-size: 24px;
    font-weight: 600;
    line-height: 36px;
    `,

    h3: `font-family: ${semiBoldFont};
    font-size: 21px;
    font-weight: 600;
    line-height: 32px;
    `,

    h4: `font-family: ${semiBoldFont};
      font-size: 18px;
      font-weight: 600;
      line-height: 27px;
      `,

    // Bold Body Styles

    bold16: `font-family: ${semiBoldFont};
      font-size: 16px;
      font-weight: normal;
      line-height: 24px;
      `,

    bold14: `font-family: ${semiBoldFont};
      font-size: 14px;
      font-weight: normal;
      line-height: 21px;
      `,

    bold12: `font-family: ${semiBoldFont};
      font-size: 12px;
      font-weight: normal;
      line-height: 18px;
      `,

    // Regular Body Styles

    reg18: `font-family: ${regularFont};
      font-size: 18px;
      font-weight: normal;
      line-height: 27px;`,

    reg16: `font-family: ${regularFont};
      font-size: 16px;
      font-weight: normal;
      line-height: 24px;`,

    reg14: `font-family: ${regularFont};
      font-size: 14px;
      font-weight: normal;
      line-height: 21px;`,

    reg12: `font-family: ${regularFont};
      font-size: 12px;
      font-weight: normal;
      line-height: 18px;
      `
  }
}
