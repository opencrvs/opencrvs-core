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

export const colors = {
  // Primary Blue
  primary: '#0B68F9',
  primaryDark: '#1447b9',
  primaryDarker: '#002661',
  primaryLight: '#C7DDFF',
  primaryLighter: '#E7F0FC',

  // Secondary Purple
  purple: '#785AE6',
  purpleDark: '#45288A',
  purpleDarker: '#373050',
  purpleLight: '#D8D3F8',
  purpleLighter: '#F0ECF9',

  // Secondary Orange
  orange: '#EA8A25',
  orangeDark: '#B65618',
  orangeDarker: '#753919',
  orangeLight: '#F9DFAF',
  orangeLighter: '#FEF9EE',

  // Secondary Green
  green: '#39AB7F',
  greenDark: '#1D7E5E',
  greenDarker: '#15503F',
  greenLight: '#B3E7CE',
  greenLighter: '#EFFAF5',

  // Secondary Red
  red: '#D53F3F',
  redDark: '#B02525',
  redDarker: '#792323',
  redLight: '#E79393',
  redLighter: '#FAE6E6',

  // Secondary Yellow
  yellow: '#FBD91E',
  yellowDark: '#E2B605',
  yellowDarker: '#85530E',
  yellowLight: '#FEFCC3',
  yellowLighter: '#FEFDE8',

  // Secondary Teal
  teal: '#1E7F93',
  tealDark: '#225968',
  tealDarker: '#0A3944',
  tealLight: '#AEDFEA',
  tealLighter: '#EBF7FA',

  // DEPRECTATED
  blue: '#4A8AD7',
  secondary: '#4A8AD7',
  tertiary: '#CCCCCC',
  subheaderCopyBirth: '#007A5E',
  subheaderCopyDeath: '#4B5EAA',
  subheaderCopyMarriage: '#E4BC0C',
  backgroundPrimary: '#36304E',

  // Grey
  white: '#FFFFFF',
  grey50: '#F8F8F8',
  grey100: '#F2F2F2',
  grey200: '#E1E1E1',
  grey300: '#CECECE',
  grey400: '#B5B5B5',
  grey500: '#6B6B6B',
  grey600: '#222222',

  // Utility
  positive: '#39AB7F',
  positiveDark: '#1D7E5E',
  positiveDarker: '#15503F',
  positiveLight: '#B3E7CE',
  positiveLighter: '#EFFAF5',
  neutral: '#EA8A25',
  neutralDark: '#B65618',
  neutralDarker: '#753919',
  neutralLight: '#F9DFAF',
  neutralLighter: '#FEF9EE',
  negative: '#D53F3F',
  negativeDark: '#B02525',
  negativeDarker: '#792323',
  negativeLight: '#E79393',
  negativeLighter: '#FAE6E6',
  opacity24: 'rgba(41, 47, 51, 0.24)',
  opacity54: 'rgba(41, 47, 51, 0.54)',
  copy: '#222222',
  supportingCopy: '#6B6B6B',
  placeholderCopy: '#B5B5B5',
  disabled: '#B5B5B5',
  background: '#F8F8F8'
}

export const gradients = {
  primary: 'background: linear-gradient(180deg, #42506B 0%, #485F88 100%)'
}

export const shadows = {
  light: 'box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32)',
  heavy: 'box-shadow: 0px 2px 8px rgba(53, 67, 93, 0.54)'
}

export type IColor = keyof typeof colors
