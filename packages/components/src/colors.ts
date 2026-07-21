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

import { primitives } from './primitives'

/**
 * @deprecated The flat `colors` palette is a backwards-compatibility shim kept
 * only so existing consumers keep working while packages migrate onto the
 * two-tier token system (`primitives` + `lightColors`/`darkColors` from
 * `./semantics`).
 *
 * Do not add to it, and do not reference it in new code. Each key carries an
 * `@deprecated` pointer to its semantic replacement, and each value is
 * re-expressed via `primitives` where the palette still contains it — mapped by
 * VALUE, not by name (note e.g. old `grey600` / `copy` = #222222 =
 * `primitives.grey[900]`, NOT `grey[600]`).
 *
 * Values here are the ORIGINAL flat-palette values, preserved exactly so that
 * consumers still on the flat keys (client, login) do not shift. Because the v4
 * Figma palette renumbered and revalued several ramps, a number of legacy
 * values (`primaryLighter`, the brand `yellow*`, `teal*`, `orange`, `redLight`,
 * `negativeLighter`, `opacity24/54`) no longer exist in `primitives` and are
 * kept as raw hex here rather than forced onto a mismatching token.
 */
export const colors = {
  // Primary Blue
  /** @deprecated use `lightColors['action/primary']`, `text/link` or `feedback/info` */
  primary: primitives.blue[500],
  /** @deprecated use `lightColors['action/primaryHover']` */
  primaryDark: primitives.blue[800],
  /** @deprecated use `lightColors['action/primaryPressed']` */
  primaryDarker: primitives.blue[900],
  /** @deprecated use `primitives.blue[100]` (also `feedback/infoSubtle`) */
  primaryLight: primitives.blue[100],
  /** @deprecated no palette equivalent — off-palette light blue (nearest: `primitives.blue[100]` #C7DDFF) */
  primaryLighter: '#E7F0FC',
  /** @deprecated no semantic equivalent — off-palette accent blue */
  primaryBlue: '#1470FF',

  // Secondary Purple
  /** @deprecated use `primitives.purple[500]` */
  purple: primitives.purple[500],
  /** @deprecated use `primitives.purple[800]` */
  purpleDark: primitives.purple[800],
  /** @deprecated use `primitives.purple[900]` */
  purpleDarker: primitives.purple[900],
  /** @deprecated use `primitives.purple[100]` */
  purpleLight: primitives.purple[100],
  /** @deprecated use `primitives.purple[50]` */
  purpleLighter: primitives.purple[50],

  // Secondary Orange
  /** @deprecated no palette equivalent — off-palette orange (see `feedback/warning` = `orange[500]` for the warning accent) */
  orange: '#E99B63',
  /** @deprecated use `primitives.orange[800]` */
  orangeDark: primitives.orange[800],
  /** @deprecated use `primitives.orange[900]` */
  orangeDarker: primitives.orange[900],
  /** @deprecated use `primitives.orange[100]` */
  orangeLight: primitives.orange[100],
  /** @deprecated use `primitives.orange[50]` */
  orangeLighter: primitives.orange[50],

  // Secondary Green
  /** @deprecated use `lightColors['action/positive']` or `feedback/positive` */
  green: primitives.green[500],
  /** @deprecated use `lightColors['action/positiveHover']` */
  greenDark: primitives.green[800],
  /** @deprecated use `lightColors['action/positivePressed']` */
  greenDarker: primitives.green[900],
  /** @deprecated use `primitives.green[100]` (also `feedback/positiveSubtle`) */
  greenLight: primitives.green[100],
  /** @deprecated use `primitives.green[50]` */
  greenLighter: primitives.green[50],

  // Secondary Red
  /** @deprecated use `lightColors['action/negative']` or `feedback/negative` */
  red: primitives.red[500],
  /** @deprecated use `lightColors['action/negativePressed']` / `primitives.red[800]` */
  redDark: primitives.red[800],
  /** @deprecated use `primitives.red[900]` */
  redDarker: primitives.red[900],
  /** @deprecated no palette equivalent — off-palette light red */
  redLight: '#FCE4E4',
  /** @deprecated use `lightColors['feedback/negativeSubtle']` / `primitives.red[50]` */
  redLighter: primitives.red[50],

  // Secondary Yellow
  /** @deprecated no palette equivalent — legacy brand yellow (v4 `yellow` ramp is a different hue; `feedback/focus` = `yellow[300]` #FDE047) */
  yellow: '#FBD91E',
  /** @deprecated no palette equivalent — legacy brand yellow */
  yellowDark: '#E2B605',
  /** @deprecated no palette equivalent — legacy brand yellow */
  yellowDarker: '#85530E',
  /** @deprecated no palette equivalent — legacy brand yellow */
  yellowLight: '#FEFCC3',
  /** @deprecated no palette equivalent — legacy brand yellow */
  yellowLighter: '#FEFDE8',

  // Secondary Teal
  /** @deprecated no palette equivalent — off-palette teal (see `primitives.ocean` for the v4 ocean ramp) */
  teal: '#4A8AD7',
  /** @deprecated no palette equivalent — off-palette teal */
  tealDark: '#2B70C3',
  /** @deprecated use `primitives.ocean[900]` */
  tealDarker: primitives.ocean[900],
  /** @deprecated no palette equivalent — off-palette teal */
  tealLight: '#9EC0E9',
  /** @deprecated no palette equivalent — off-palette teal */
  tealLighter: '#DCE8F7',

  // Grey
  /** @deprecated use `lightColors['surface/default']` or `text/onAction` */
  white: primitives.white,
  /** @deprecated use `primitives.grey[50]`, `surface/page` or `surface/hover` */
  grey50: primitives.grey[50],
  /** @deprecated use `primitives.grey[100]`, `surface/sunken`, `border/subtle` or `action/secondary` */
  grey100: primitives.grey[100],
  /** @deprecated use `primitives.grey[200]`, `border/default` or `action/disabled` */
  grey200: primitives.grey[200],
  /** @deprecated use `primitives.grey[300]`, `border/strong` or `action/secondaryPressed` */
  grey300: primitives.grey[300],
  /** @deprecated use `primitives.grey[400]` or `text/disabled` */
  grey400: primitives.grey[400],
  /** @deprecated use `primitives.grey[500]` or `text/tertiary` */
  grey500: primitives.grey[500],
  /** @deprecated #222222 is now `primitives.grey[900]` (NOT grey[600]) — use `text/primary` */
  grey600: primitives.grey[900],

  // Utility
  /** @deprecated use `lightColors['action/positive']` */
  positive: primitives.green[500],
  /** @deprecated use `lightColors['action/positiveHover']` */
  positiveDark: primitives.green[800],
  /** @deprecated use `lightColors['action/positivePressed']` */
  positiveDarker: primitives.green[900],
  /** @deprecated use `primitives.green[100]` */
  positiveLight: primitives.green[100],
  /** @deprecated use `primitives.green[50]` (also `feedback/positiveSubtle`) */
  positiveLighter: primitives.green[50],
  /** @deprecated use `lightColors['feedback/warning']` / `primitives.orange[500]` */
  neutral: primitives.orange[500],
  /** @deprecated use `primitives.orange[800]` */
  neutralDark: primitives.orange[800],
  /** @deprecated use `primitives.orange[900]` */
  neutralDarker: primitives.orange[900],
  /** @deprecated use `primitives.orange[100]` */
  neutralLight: primitives.orange[100],
  /** @deprecated use `primitives.orange[50]` (also `feedback/warningSubtle`) */
  neutralLighter: primitives.orange[50],
  /** @deprecated use `lightColors['action/negative']` or `feedback/negative` */
  negative: primitives.red[500],
  /** @deprecated use `lightColors['action/negativePressed']` / `primitives.red[800]` */
  negativeDark: primitives.red[800],
  /** @deprecated use `primitives.red[900]` */
  negativeDarker: primitives.red[900],
  /** @deprecated use `primitives.red[100]` */
  negativeLight: primitives.red[100],
  /** @deprecated no palette equivalent — off-palette light red (see `feedback/negativeSubtle`) */
  negativeLighter: '#FAE6E6',
  /** @deprecated no direct equivalent — see `lightColors['overlay/subtle']` (grey/900 @ 24%) */
  opacity24: 'rgba(41, 47, 51, 0.24)',
  /** @deprecated no direct equivalent — see `lightColors['overlay/scrim']` (grey/900 @ 54%) */
  opacity54: 'rgba(41, 47, 51, 0.54)',
  /** @deprecated use `lightColors['text/primary']` */
  copy: primitives.grey[900],
  /** @deprecated use `lightColors['text/secondary']` (note: the semantic token is `grey[600]` #525252; this legacy value is `grey[500]` #6B6B6B) */
  supportingCopy: primitives.grey[500],
  /** @deprecated use `lightColors['text/tertiary']` (note: the semantic token is `grey[500]` #6B6B6B; this legacy value is `grey[400]` #B5B5B5) */
  placeholderCopy: primitives.grey[400],
  /** @deprecated use `lightColors['text/disabled']` or `action/disabled` */
  disabled: primitives.grey[400],
  /** @deprecated use `lightColors['surface/page']` */
  background: primitives.grey[50]
}

export const gradients = {
  primary: 'background: linear-gradient(180deg, #42506B 0%, #485F88 100%)'
}

export const shadows = {
  light: 'box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32)',
  heavy: 'box-shadow: 0px 2px 8px rgba(53, 67, 93, 0.54)'
}

export type IColor = keyof typeof colors
