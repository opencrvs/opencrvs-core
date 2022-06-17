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
import * as React from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { getTheme } from '../theme'

const Wrapper = styled.div`
  * {
    box-sizing: border-box;
  }
  /* stylelint-disable */
  background: #ebf1f3;
  /* stylelint-enable */
  padding: 2em;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`

export class ThemeWrapper extends React.Component {
  render() {
    return (
      <Wrapper>
        <ThemeProvider theme={getTheme()}>
          {this.props.children as any}
        </ThemeProvider>
      </Wrapper>
    )
  }
}

// Styleguidist's styleguideComponents configuration only works with components that are default exports
// See packages/components/styleguide.config.js:16
export { ThemeWrapper as default }
