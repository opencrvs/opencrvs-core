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

import styled, { css } from 'styled-components'
import { useSelector } from 'react-redux'
import { isEqual } from 'lodash-es'
import { selectCountryBackground } from '@client/offline/selectors'

export interface IProps {
  children: React.ReactNode
  id?: string
}

export const LogoContainer = styled.div`
  flex-direction: row;
  display: flex;
  justify-content: center;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    & svg {
      transform: scale(0.8);
    }
  }
`

const StyledPage = styled.div<{
  background: ReturnType<typeof selectCountryBackground>
}>`
  height: 100vh;
  width: 100%;
  position: relative;

  ${({ background: { backgroundImage, imageFit, backgroundColor } }) =>
    backgroundImage
      ? css`
          background-image: url(${backgroundImage});
          background-repeat: ${imageFit === 'FILL' ? 'no-repeat' : 'repeat'};
          background-size: ${imageFit === 'FILL' ? `cover` : `auto`};
        `
      : css`
          background: #${backgroundColor};
        `}
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
export const Container = styled.div`
  margin: auto;
  height: auto;
  padding-top: 104px;
  width: min(363px, 90%);
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.sm}px) {
    padding-top: 70px;
  }
`

export function BackgroundWrapper({ children, id }: IProps) {
  const countryBackground = useSelector(selectCountryBackground)

  return (
    <StyledPage id={id} background={countryBackground}>
      <Container> {children}</Container>
    </StyledPage>
  )
}
