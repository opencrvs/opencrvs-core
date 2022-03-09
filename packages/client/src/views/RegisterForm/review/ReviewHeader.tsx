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

interface IReviewHeaderProps {
  id?: string
  logoSource: string
  title: string
  subject: string
}

const HeaderContainer = styled.div`
  min-height: 288px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.colors.copy};
  background-color: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
`
const ContentContainer = styled.div`
  flex-direction: column;
  align-items: center;
  width: 100%;
`
const IconContainer = styled.div`
  margin: 16px auto 16px auto;
`
const TitleContainer = styled.div`
  ${({ theme }) => theme.fonts.reg12}
  text-transform: uppercase;
`
const SubjectContainer = styled.div`
  ${({ theme }) => theme.fonts.h2}
  width:70%;
  margin: auto;
  overflow-wrap: break-word;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    ${({ theme }) => theme.fonts.h3}
  }
`
const Image = styled.img`
  height: ${window.config.COUNTRY_LOGO_RENDER_HEIGHT || 104}px;
  width: ${window.config.COUNTRY_LOGO_RENDER_WIDTH || 104}px;
`

export const ReviewHeader = (props: IReviewHeaderProps) => {
  const { id, logoSource, title, subject } = props

  return (
    <HeaderContainer id={id}>
      <ContentContainer>
        <IconContainer>
          <Image src={logoSource} />
        </IconContainer>
        <TitleContainer id={`${id}_title`}>{title}</TitleContainer>
        <SubjectContainer id={`${id}_subject`}>{subject}</SubjectContainer>
      </ContentContainer>
    </HeaderContainer>
  )
}
