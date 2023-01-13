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

import styled from '@client/styledComponents'

interface IPageProps {
  background?: string
  backgroundUrl?: string
  imageFitter?: string
}

export const PageWrapper = styled.div<IPageProps>`
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100%;
  justify-content: center;
  align-items: center;
  background: ${({ background }) => `#${background}`};
  background-image: ${({ backgroundUrl }) => `url(${backgroundUrl})`};
  background-size: ${({ imageFitter }) =>
    imageFitter === 'FILL' ? `cover` : `auto`};
`

export const BoxWrapper = styled.div`
  text-align: center;
  border-radius: 4px;
  padding: 24px;
  width: min(500px, 90%);

  border: 1px solid ${({ theme }) => theme.colors.grey300};
  background: ${({ theme }) => theme.colors.white};
`

export const TitleText = styled.span`
  display: flex;
  justify-content: center;
  color: ${({ theme }) => theme.colors.grey600};
  ${({ theme }) => theme.fonts.h2};
  text-align: center;
  margin-top: 24px;
  margin-bottom: 16px;
  @media (max-height: 780px) {
    ${({ theme }) => theme.fonts.h3};
    margin-top: 0.3em;
    margin-bottom: 0.3em;
  }
`

export const DescriptionText = styled.span`
  color: ${({ theme }) => theme.colors.grey600};
  ${({ theme }) => theme.fonts.reg18};
  text-align: center;
  max-width: 360px;
  margin-bottom: 40px;
  @media (max-height: 780px) {
    ${({ theme }) => theme.fonts.reg16};
  }
`

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
export const Container = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: min(500px, 90%);
  border-radius: 4px;
  padding: 24px;
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  background: ${({ theme }) => theme.colors.white};
`
