import SingleValue from 'react-select/lib/components/SingleValue'

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
export const colorDictionary = {
  blackStormy: '#35495D',
  blueDeepSea: '#4C68C1',
  blueDeepSeaLight: '#F1F3FA',
  blueBabyBaby: '#5E93ED',
  purpleDrafty: '#8049B7',
  orangeAmber: '#F1B162',
  redDanger: '#D53F3F',
  redDangerDark: '#994040',
  greenPeaPea: '#49B78D',
  greenPeaPeaDark: '#409977',
  blueCrystal: '#4A8AD7',
  yellowFocus: '#EDC55E',
  white: '#FFFFFF',
  black: '#000000',
  blueHover: '#F2F6FE',
  greyBlackMetal: '#373D3F',
  greyRaven: '#555F61',
  greyDarkSteel: '#707C80',
  greySteel: '#A7B0B2',
  greyGrey: '#C1C7C9',
  greySmoky: '#DADEDF',
  greyPearl: '#F2F3F4',
  nightshadeDark: '#42506B',
  nightshadeLight: '#485F88',
  darkSteel: '#707C80',
  lightGrey: '#F9F9F9',
  mercury: '#E5E5E5',
  silverSand: '#C1C7C9',
  swansDown: '#D3EEE4',
  fountainBlue: '#4CC1BA',
  ronchi: '#EDC55E'
}

export const gradients = {
  gradientNightshade:
    'background: linear-gradient(180deg, #42506B 0%, #485F88 100%)',
  gradientSkyDark:
    'background: linear-gradient(180deg, #3C55A3 0%, #4C68C1 100%)',
  gradientSkyLight:
    'background: linear-gradient(180deg, #6291CD 0%, #AACAF3 100%)',
  gradientBabyShade:
    'background: linear-gradient(180deg, #477cd7 0%, #5c91eb 100%);',
  gradientGreyShade:
    'background: linear-gradient(180deg, #FFFFFF 0%, #F2F3F4 100%);'
}

export const shadows = {
  mistyShadow: 'box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32)',
  thickShadow: 'box-shadow: 0px 2px 8px rgba(53, 67, 93, 0.54)'
}

export const colors = {
  primary: colorDictionary.blueDeepSea,
  secondary: colorDictionary.blueBabyBaby,
  tertiary: colorDictionary.blueDeepSea,
  error: colorDictionary.redDanger,
  errorHover: colorDictionary.redDangerDark,
  warning: colorDictionary.orangeAmber,
  copy: colorDictionary.blackStormy,
  placeholder: colorDictionary.greyDarkSteel,
  background: colorDictionary.greyPearl,
  disabled: colorDictionary.greyGrey,
  success: colorDictionary.greenPeaPea,
  successHover: colorDictionary.greenPeaPeaDark,
  white: colorDictionary.white,
  black: colorDictionary.black,
  focus: colorDictionary.yellowFocus,

  // Exceptions - Try to use one of the above before creating exceptions
  chartAreaGradientStart: colorDictionary.greySmoky,
  chartAreaGradientEnd: colorDictionary.blueHover,
  dropdownHover: colorDictionary.blueHover,
  menuBackground: colorDictionary.blackStormy,
  gradientDark: colorDictionary.nightshadeDark,
  gradientLight: colorDictionary.nightshadeLight,
  secondaryLabel: colorDictionary.darkSteel,
  previewBackground: colorDictionary.greyBlackMetal,
  smallButtonFocus: colorDictionary.mercury,
  dateDisabled: colorDictionary.greySteel,

  // Grey Scrollbar
  scrollBarGrey: colorDictionary.greySteel,
  lightScrollBarGrey: colorDictionary.greySmoky,

  // Dividers
  dividerLight: colorDictionary.greyPearl,
  dividerDark: colorDictionary.greySmoky,

  // Light Grey background
  lightGreyBackground: colorDictionary.lightGrey,

  // Deep sea light background
  blueDeepSeaLight: colorDictionary.blueDeepSeaLight,

  // Colors for applicatin statuses
  inProgress: colorDictionary.purpleDrafty,
  readyForReview: colorDictionary.orangeAmber,
  sentForUpdate: colorDictionary.redDanger,
  waitingForApproval: colorDictionary.greySteel,
  waitingForExternalValidation: colorDictionary.greyRaven,
  readyToPrint: colorDictionary.greenPeaPea,

  // Tri Line chart lines
  silverSand: colorDictionary.silverSand,
  swansDown: colorDictionary.swansDown,
  fountainBlue: colorDictionary.fountainBlue,
  ronchi: colorDictionary.ronchi
}
