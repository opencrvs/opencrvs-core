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
import { ThemeProvider, createGlobalStyle } from 'styled-components'
import { getTheme } from '../src/components/theme'
import WebFont from 'webfontloader'

WebFont.load({
  google: {
    families: ['Noto+Sans:600', 'Noto+Sans:400']
  }
})
const language = process.env.VITE_APP_LANGUAGE
  ? process.env.VITE_APP_LANGUAGE
  : 'en'

const GlobalStyle = createGlobalStyle`
html,
body,
#__next,
#__layout,
#default-layout {
  width: 100%;
  height: 100%;
  ${({ theme }) => theme.fonts.text}
  color: ${({ theme }) => theme.colors.neutralD};
  overflow-x: hidden;
  .page-content {
    position: relative;
    height: 100%;
    .table-container {
      height: 100%;
    }
  }
  @font-face {
    /* stylelint-disable-next-line opencrvs/no-font-styles */
    font-family: "Noto Sans";
  }
  *:not(i) {
    font-family: "Noto Sans";
  }
}
body,
h1, h2, h3, h4, h5, h6,
blockquote, p, pre, code,
dl, dd, ol, ul,
figure,
hr,
fieldset, legend
 {
  margin:   0;
  padding:  0;
}
* {
  box-sizing: border-box;
}
`
export const decorators = [
  (Story) => (
    <ThemeProvider theme={getTheme(language)}>
      <GlobalStyle />
      <Story />
    </ThemeProvider>
  )
]

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/
    }
  }
}
