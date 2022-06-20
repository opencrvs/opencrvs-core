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
  fontFamily: string

  h1: string
  h2: string
  h3: string
  h4: string

  bold16: string
  bold18: string
  bold14: string
  bold12: string

  reg18: string
  reg16: string
  reg14: string
  reg12: string
}

export const fonts = (): IFonts => {
  const fontFamily = 'Noto Sans'
  return {
    fontFamily,

    // Headings

    h1: `font-family: ${fontFamily};
    font-size: 36px;
    font-weight: 600;
    line-height: 54px;
    `,

    h2: `font-family: ${fontFamily};
    font-size: 24px;
    font-weight: 600;
    line-height: 36px;
    `,

    h3: `font-family: ${fontFamily};
    font-size: 21px;
    font-weight: 600;
    line-height: 32px;
    `,

    h4: `font-family: ${fontFamily};
      font-size: 18px;
      font-weight: 600;
      line-height: 27px;
      `,

    // Bold Body Styles

    bold18: `font-family: ${fontFamily};
    font-size: 18px;
    font-weight: 600;
    line-height: 27px;
    `,

    bold16: `font-family: ${fontFamily};
      font-size: 16px;
      font-weight: 600;
      line-height: 24px;
      `,

    bold14: `font-family: ${fontFamily};
      font-size: 14px;
      font-weight: 600;
      line-height: 21px;
      `,

    bold12: `font-family: ${fontFamily};
      font-size: 12px;
      font-weight: 600;
      line-height: 18px;
      `,

    // Regular Body Styles

    reg18: `font-family: ${fontFamily};
      font-size: 18px;
      font-weight: 400;
      line-height: 27px;`,

    reg16: `font-family: ${fontFamily};
      font-size: 16px;
      font-weight: 400;
      line-height: 24px;`,

    reg14: `font-family: ${fontFamily};
      font-size: 14px;
      font-weight: 400;
      line-height: 21px;`,

    reg12: `font-family: ${fontFamily};
      font-size: 12px;
      font-weight: 400;
      line-height: 18px;
      `
  }
}
