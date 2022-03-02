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
  tertiary: '#cccfd0', // grey

  purple: '#8049B7', // in progress
  orange: '#F1B162', // ready for review
  red: '#d53f3f', // requires updates
  green: '#49b78d', // registered
  blue: '#4A8AD7', // certified
  teal: '#4CC1BA', // charts
  yellow: '#edc55e', // focus state

  // Darks
  indigoDark: '#42639C',
  redDark: '#994040',
  greenDark: '#409977',

  // Lights
  tealLight: '#D3EEE4',

  // Status
  positive: '#49b78d', // green
  neutral: '#f1b162', // orange
  negative: '#d53f3f', // red

  // Monochrome
  white: '#ffffff',
  grey200: '#f8f8f8', // app background
  grey300: '#f1f2f3', // hover state, light background
  grey400: '#dee2e4', // dividers
  grey500: '#cccfd0', // disabled state, borders
  grey600: '#909397', // placeholder copy
  grey700: '#676A6F', // supporting copy
  grey800: '#1e2326', // copy

  // Opacity
  opacity24: 'rgba(41, 47, 51, 0.24)',
  opacity54: 'rgba(41, 47, 51, 0.54)',

  // Alternative defintions
  copy: '#1e2326', // grey800
  supportingCopy: '#1e2326', // grey700
  placeholderCopy: '#909397', // grey600
  disabled: '#cccfd0', // grey500
  background: '#f8f8f8' // grey200
}

export const gradients = {
  primary: 'background: linear-gradient(180deg, #42506B 0%, #485F88 100%)'
}

export const shadows = {
  lightShadow: 'box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32)',
  heavyShadow: 'box-shadow: 0px 2px 8px rgba(53, 67, 93, 0.54)'
}
