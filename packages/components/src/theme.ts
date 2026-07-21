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
import { gradients, shadows } from './colors'
import { lightColors } from './semantics'
import { fonts, family as fontFamily } from './fonts'
import { grid } from './grid'

/**
 * The active semantic colour set is carried on the theme (`theme.colors`),
 * alongside fonts / grid / shadows, so components resolve colours through the
 * provider — never via a direct `lightColors` import. `colors` is `lightColors`
 * today; theme selection (light/dark) is wired in a follow-up.
 */
export const getTheme = () => ({
  colors: lightColors,
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
