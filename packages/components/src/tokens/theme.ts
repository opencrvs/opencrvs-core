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
import { colors, gradients, shadows } from './colors'
import { fonts, family as fontFamily } from './fonts'
import { grid } from './grid'

export const getTheme = () => ({
  colors,
  gradients,
  shadows,
  fonts,
  fontFamily,
  grid
})

export type ITheme = ReturnType<typeof getTheme>

declare module 'styled-components' {
  export interface DefaultTheme extends ITheme {}
}
