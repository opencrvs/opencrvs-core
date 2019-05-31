/*
 * This file is here to provide automatic typing for
 * "theme" context property coming in to all components.
 * This also requires that instead of
 *
 * import styled from '@register/styled-components';
 *
 * we import it from this module
 *
 * import styled from '@register/styled-components';
 */

import * as styledComponents from 'styled-components'
import { ThemedStyledComponentsModule } from 'styled-components'
import { ITheme } from '@opencrvs/components/lib/theme'

const {
  default: styled,
  css,
  injectGlobal,
  keyframes,
  ThemeProvider
} = styledComponents as ThemedStyledComponentsModule<ITheme>

export { css, injectGlobal, keyframes, ThemeProvider }
export default styled
