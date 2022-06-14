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
import styled from '@client/styledComponents'
import { CountryLogo } from '@opencrvs/components/lib/icons'

interface IReviewHeaderProps {
  id?: string
  logoSource: string
  title: string
  subject: string
}

const HeaderContainer = styled.div`
  min-height: 288px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.colors.copy};
  background-color: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
`

const TitleContainer = styled.div`
  ${({ theme }) => theme.fonts.bold14}
  text-transform: uppercase;
`
const SubjectContainer = styled.div`
  ${({ theme }) => theme.fonts.h2}
  overflow-wrap: break-word;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    ${({ theme }) => theme.fonts.h3}
  }
`
export const ReviewHeader = (props: IReviewHeaderProps) => {
  const { id, logoSource, title, subject } = props

  return (
    <HeaderContainer id={id}>
      <CountryLogo src={logoSource} />
      <TitleContainer id={`${id}_title`}>{title}</TitleContainer>
      <SubjectContainer id={`${id}_subject`}>{subject}</SubjectContainer>
    </HeaderContainer>
  )
}
