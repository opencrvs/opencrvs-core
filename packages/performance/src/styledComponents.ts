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
/*
 * This file is here to provide automatic typing for
 * "theme" context property coming in to all components.
 * This also requires that instead of
 *
 * import styled from '@performance/styledComponents';
 *
 * we import it from this module
 *
 * import styled from '@performance/styledComponents';
 */

import * as styledComponents from 'styled-components'
import { ITheme as IThemeInterface } from '@opencrvs/components/lib/theme'

export type ITheme = IThemeInterface

const {
  default: styled,
  css,
  injectGlobal,
  keyframes,
  ThemeProvider,
  withTheme
} = styledComponents as styledComponents.ThemedStyledComponentsModule<ITheme>

export { css, injectGlobal, keyframes, ThemeProvider, withTheme }
export default styled
