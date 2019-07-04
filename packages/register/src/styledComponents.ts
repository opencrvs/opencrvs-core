/*
 * This file is here to provide automatic typing for
 * "theme" context property coming in to all components.
 * This also requires that instead of
 *
 * import styled from '@register/styledComponents';
 *
 * we import it from this module
 *
 * import styled from '@register/styledComponents';
 */

import * as styledComponents from 'styled-components'
import { ThemedStyledComponentsModule } from 'styled-components'
import { ITheme as IThemeInterface } from '@opencrvs/components/lib/theme'

export type ITheme = IThemeInterface

const {
  default: styled,
  css,
  injectGlobal,
  keyframes,
  ThemeProvider,
  withTheme
} = styledComponents as ThemedStyledComponentsModule<ITheme>

export { css, injectGlobal, keyframes, ThemeProvider, withTheme }
export default styled
