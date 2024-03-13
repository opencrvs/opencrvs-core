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
import * as React from 'react'

import styled, { css } from 'styled-components'
import { useSelector } from 'react-redux'
import { selectCountryBackground } from '@client/offline/selectors'

interface IProps {
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
  display: flex;
  align-items: center;
  justify-content: center;

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
const Container = styled.div`
  margin: auto;
  height: auto;
  width: min(380px, 90%);
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
