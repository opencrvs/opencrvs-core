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
import { getDefaultLanguage } from '@login/i18n/utils'
import zambiaBackground from './background-zmb.jpg'
const languageFromProps = ({ language }: IPage) => language

const StyledPage = styled.div<IPage>`
  ${({ theme }) => theme.gradients.primary};
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

  @font-face {
    /* stylelint-disable-next-line opencrvs/no-font-styles */
    font-family: ${({ theme }) => theme.fonts.semiBoldFont};
    src: url('/fonts/notosans-semibold-webfont-en.ttf') format('truetype');
  }

  @font-face {
    /* stylelint-disable-next-line opencrvs/no-font-styles */
    font-family: ${({ theme }) => theme.fonts.regularFont};
    src: url('/fonts/notosans-regular-webfont-en.ttf') format('truetype');
  }

  @font-face {
    /* stylelint-disable-next-line opencrvs/no-font-styles */
    font-family: ${({ theme }) => theme.fonts.semiBoldFont};
    src: url('/fonts/notosans-semibold-webfont-${languageFromProps}.ttf')
      format('truetype');
  }

  @font-face {
    /* stylelint-disable-next-line opencrvs/no-font-styles */
    font-family: ${({ theme }) => theme.fonts.regularFont};
    src: url('/fonts/notosans-regular-webfont-${languageFromProps}.ttf')
      format('truetype');
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
              baseColor={getTheme(getDefaultLanguage()).colors.white}
            />
          ) : (
            children
          )}
        </StyledPage>
      </div>
    )
  }
}
