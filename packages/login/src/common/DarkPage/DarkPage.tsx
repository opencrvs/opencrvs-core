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
import styled from 'styled-components'
import { RouteComponentProps } from 'react-router'
import { IPage } from '@login/common/Page'
import { Spinner } from '@opencrvs/components/lib/interface'
import { getTheme } from '@opencrvs/components/lib/theme'

const StyledPage = styled.div<IPage>`
  background: ${({ theme }) => theme.colors.backgroundPrimary};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;

  ${({ submitting }) =>
    submitting && `justify-content: center; align-items: center;`}

  * {
    box-sizing: border-box;
    -webkit-font-smoothing: subpixel-antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  *:before,
  *:after {
    box-sizing: border-box;
  }
`

export class DarkPage extends React.Component<IPage & RouteComponentProps<{}>> {
  render() {
    const { children, submitting } = this.props
    return (
      <div>
        <StyledPage {...this.props}>
          {submitting ? (
            <Spinner
              id="login-submitting-spinner"
              baseColor={getTheme().colors.white}
            />
          ) : (
            children
          )}
        </StyledPage>
      </div>
    )
  }
}
