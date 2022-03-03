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

export const colors = {
  // Pallete
  primary: '#4972BB', // indigo
  secondary: '#4A8AD7', // blue
  tertiary: '#CCCFD0', // grey

  purple: '#8049B7', // in progress
  orange: '#F1B162', // ready for review
  red: '#D53F3F', // requires updates
  green: '#49b78d', // registered
  blue: '#4A8AD7', // certified
  teal: '#4CC1BA', // charts
  yellow: '#EDC55E', // focus state

  // Darks
  indigoDark: '#42639C',
  redDark: '#994040',
  greenDark: '#409977',

  // Lights
  tealLight: '#D3EEE4',

  // Status
  positive: '#49B78D', // green
  neutral: '#F1B162', // orange
  negative: '#D53F3F', // red

  // Monochrome
  white: '#FFFFFF',
  grey100: '#F5F5F5', // background
  grey200: '#EEEEEE', // dividers, hover
  grey300: '#CCCCCC', // disabled state, borders
  grey400: '#A5A5A5', // placeholder copy
  grey500: '#707070', // supporting copy
  grey600: '#222222', // copy

  // Opacity
  opacity24: 'rgba(41, 47, 51, 0.24)',
  opacity54: 'rgba(41, 47, 51, 0.54)',

  // Alternative defintions
  copy: '#222222', // grey800
  supportingCopy: '#707070', // grey700
  placeholderCopy: '#A5A5A5', // grey600
  disabled: '#CCCCCC', // grey300
  background: '#F5F5F5' // grey100
}

export const gradients = {
  primary: 'background: linear-gradient(180deg, #42506B 0%, #485F88 100%)'
}

export const shadows = {
  lightShadow: 'box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32)',
  heavyShadow: 'box-shadow: 0px 2px 8px rgba(53, 67, 93, 0.54)'
}
