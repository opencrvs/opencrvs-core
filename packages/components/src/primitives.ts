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

/**
 * Primitives — the raw colour palette, organised by hue and numeric scale,
 * transcribed from the Figma v4 Design System "Primitives" collection:
 * https://www.figma.com/design/fi2i59UhtoxW0crnknz6wv/v4---OpenCRVS-Design-System?node-id=31-56
 *
 * This is the ONLY place raw hex values are allowed to live. Components must
 * never reference primitives directly — go through the semantic tokens in
 * `semantics.ts` (`lightColors` / `darkColors`) instead.
 *
 * Values mirror Figma exactly. Note the ramps run 50 / 100 / 200 / 300 / 500 /
 * 700 / 800 / 900 (grey adds 600 and 950); `red` additionally has a `600`
 * (#C23636) referenced by `action/negativeHover`.
 */
export const primitives = {
  black: '#000000',
  white: '#FFFFFF',

  blue: {
    50: '#F4F8FE',
    100: '#C7DDFF',
    200: '#99B7F0',
    300: '#6B92E0',
    500: '#1447B9',
    700: '#103EA5',
    800: '#0D3691',
    900: '#0E225D'
  },

  grey: {
    50: '#F8F8F8',
    100: '#F2F2F2',
    200: '#E1E1E1',
    300: '#CECECE',
    400: '#B5B5B5',
    500: '#6B6B6B',
    600: '#525252',
    700: '#3F3F3F',
    800: '#2A2A2A',
    900: '#222222',
    950: '#0E0E0E'
  },

  green: {
    50: '#EFFAF5',
    100: '#B3E7CE',
    200: '#94D8BB',
    300: '#76C9A7',
    500: '#39AB7F',
    700: '#2B956F',
    800: '#1D7E5E',
    900: '#15503F'
  },

  ocean: {
    50: '#EBF7FA',
    100: '#AEDFEA',
    200: '#8AC7D4',
    300: '#66AFBE',
    500: '#1E7F93',
    700: '#206C7E',
    800: '#225968',
    900: '#0A3944'
  },

  orange: {
    50: '#FEF9EE',
    100: '#F9DFAF',
    200: '#F5C889',
    300: '#F1B162',
    500: '#EA8A25',
    700: '#D0701F',
    800: '#B65618',
    900: '#753919'
  },

  purple: {
    50: '#F0ECF9',
    100: '#D8D3F8',
    200: '#C0B5F4',
    300: '#A896EF',
    500: '#785AE6',
    700: '#5F41B8',
    800: '#45288A',
    900: '#373050'
  },

  red: {
    50: '#FDF3F3',
    100: '#E79393',
    200: '#E37E7E',
    300: '#DE6969',
    500: '#D53F3F',
    600: '#C23636',
    700: '#C33232',
    800: '#B02525',
    900: '#792323'
  },

  yellow: {
    50: '#FEFCE8',
    100: '#FEF9C3',
    200: '#FEF08A',
    300: '#FDE047',
    500: '#EAB308',
    700: '#A16207',
    800: '#854D0E',
    900: '#713F12'
  }
} as const
