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

import darken from 'polished/lib/color/darken'
import lighten from 'polished/lib/color/lighten'

const config = {
  // Pallete
  primary: '#4972BB', // indigo
  secondary: '#4A8AD7', // blue
  tertiary: '#CCCCCC', // grey

  purple: '#8049B7', // in progress
  orange: '#F1B162', // ready for review
  red: '#D53F3F', // requires updates
  green: '#49b78d', // registered
  blue: '#4A8AD7', // certified
  teal: '#4CC1BA', // charts
  yellow: '#EDC55E', // focus state

  // Status
  positive: '#49B78D', // green
  neutral: '#F1B162', // orange
  negative: '#D53F3F', // red

  // Monochrome
  white: '#FFFFFF',
  grey100: '#F8F8F8', // background
  grey200: '#ECECEC', // dividers, hover
  grey300: '#E0E0E0', // disabled state, borders
  grey400: '#AAAAAA', // placeholder copy
  grey500: '#6A6A6A', // supporting copy
  grey600: '#222222', // copy

  // Opacity
  opacity24: 'rgba(41, 47, 51, 0.24)',
  opacity54: 'rgba(41, 47, 51, 0.54)',

  // Alternative definitions
  copy: '#222222', // grey600
  supportingCopy: '#6A6A6A', // grey500
  placeholderCopy: '#AAAAAA', // grey400
  disabled: '#CCCCCC', // grey300
  background: '#F8F8F8', // grey100
  backgroundPrimary: '#36304E'
}

export const gradients = {
  primary: 'background: linear-gradient(180deg, #42506B 0%, #485F88 100%)'
}

export const shadows = {
  light: 'box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32)',
  heavy: 'box-shadow: 0px 2px 8px rgba(53, 67, 93, 0.54)'
}

/**
 * Color palette with auto-generated light / dark colors from color configuration
 */
export const colors = {
  ...config,

  primaryDarker: darken(0.2)(config.primary),
  primaryDark: darken(0.1)(config.primary),
  primaryLight: lighten(0.3)(config.primary),
  primaryLighter: lighten(0.38)(config.primary),
  primaryLightest: lighten(0.46)(config.primary),

  purpleDarker: darken(0.2)(config.purple),
  purpleDark: darken(0.1)(config.purple),
  purpleLight: lighten(0.25)(config.purple),
  purpleLighter: lighten(0.45)(config.purple),

  orangeDarker: darken(0.2)(config.orange),
  orangeDark: darken(0.1)(config.orange),
  orangeLight: lighten(0.25)(config.orange),
  orangeLighter: lighten(0.3)(config.orange),

  redDarker: darken(0.2)(config.red),
  redDark: darken(0.1)(config.red),
  redLight: lighten(0.25)(config.red),
  redLighter: lighten(0.4)(config.red),

  greenDarker: darken(0.2)(config.green),
  greenDark: darken(0.1)(config.green),
  greenLight: lighten(0.25)(config.green),
  greenLighter: lighten(0.41)(config.green),

  blueDarker: darken(0.2)(config.blue),
  blueDark: darken(0.1)(config.blue),
  blueLight: lighten(0.25)(config.blue),
  blueLighter: lighten(0.4)(config.blue),

  tealDarker: darken(0.2)(config.teal),
  tealDark: darken(0.1)(config.teal),
  tealLight: lighten(0.25)(config.teal),
  tealLighter: lighten(0.4)(config.teal),

  yellowDarker: darken(0.2)(config.yellow),
  yellowDark: darken(0.1)(config.yellow),
  yellowLight: lighten(0.25)(config.yellow),
  yellowLighter: lighten(0.3)(config.yellow),

  positiveDarker: darken(0.2)(config.positive),
  positiveDark: darken(0.1)(config.positive),
  positiveLight: lighten(0.25)(config.positive),

  neutralDarker: darken(0.2)(config.neutral),
  neutralDark: darken(0.1)(config.neutral),

  negativeDarker: darken(0.2)(config.negative),
  negativeDark: darken(0.1)(config.negative),
  negativeLight: lighten(0.25)(config.negative)
}

export type IColor = keyof typeof colors
