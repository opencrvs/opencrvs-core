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
import { create } from '@storybook/theming'
import { getTheme } from '@opencrvs/components/lib/theme'

export const BRAND_BLUE =
  '#0058E0' /* Also see `manager-head.html`, if you're going to change this */

const theme = getTheme()

export default create({
  base: 'light',
  colorPrimary: BRAND_BLUE,
  colorSecondary: BRAND_BLUE,
  brandTitle: 'OpenUi-Kit',
  brandUrl: '/',
  brandImage: 'logo.png',
  brandTarget: '_self',
  fontBase: theme.fontFamily
})
