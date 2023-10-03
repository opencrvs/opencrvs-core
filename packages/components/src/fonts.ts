/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
export const family = "'Noto Sans', sans-serif"

/* stylelint-disable opencrvs/no-font-styles */
const hero = `
  font-family: ${family};
  font-weight: 600;
  font-size: 48px;
  line-height: 120%;
`
const h1 = `
  font-family: ${family};
  font-weight: 600;
  font-size: 28px;
  line-height: 120%;
`
const h2 = `
  font-family: ${family};
  font-weight: 600;
  font-size: 24px;
  line-height: 120%;
`
const h3 = `
  font-family: ${family};
  font-weight: 600;
  font-size: 20px;
  line-height: 140%;
`
const h4 = `
  font-family: ${family};
  font-weight: 600;
  font-size: 18px;
  line-height: 140%;
`
const reg18 = `
  font-family: ${family};
  font-weight: 400;
  font-size: 18px;
  line-height: 140%;
`

const bold18 = `
  font-family: ${family};
  font-weight: 600;
  font-size: 18px;
  line-height: 140%;
`

const reg16 = `
  font-family: ${family};
  font-weight: 400;
  font-size: 16px;
  line-height: 140%;
`

const bold16 = `
  font-family: ${family};
  font-weight: 600;
  font-size: 16px;
  line-height: 140%;
`

const reg14 = `
  font-family: ${family};
  font-weight: 400;
  font-size: 14px;
  line-height: 140%;
`

const bold14 = `
  font-family: ${family};
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;
`

const reg12 = `
  font-family: ${family};
  font-weight: 400;
  font-size: 12px;
  line-height: 140%;
`

const bold12 = `
  font-family: ${family};
  font-weight: 600;
  font-size: 12px;
  line-height: 140%;
`

export const fonts = {
  hero,
  h1,
  h2,
  h3,
  h4,
  bold18,
  bold16,
  bold14,
  bold12,
  reg18,
  reg16,
  reg14,
  reg12
}

export type IFont = keyof typeof fonts
