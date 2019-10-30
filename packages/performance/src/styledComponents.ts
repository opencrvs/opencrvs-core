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
  createGlobalStyle,
  keyframes,
  ThemeProvider,
  withTheme
} = styledComponents as styledComponents.ThemedStyledComponentsModule<ITheme>

export { css, createGlobalStyle, keyframes, ThemeProvider, withTheme }
export default styled
