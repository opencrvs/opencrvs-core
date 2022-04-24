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
import React from 'react'
import styled from '@client/styledComponents'

interface PerformanceBlockProps {
  title: string
  description?: string
  headerBorderBottom?: boolean
  children: React.ReactNode
}

export const Header = styled.div<{ borderBottom?: boolean }>`
  padding-bottom: 16px;
  ${({ borderBottom, theme }) =>
    borderBottom && `border-bottom: 1px solid ${theme.colors.grey300};`}
`
export const Heading = styled.h4`
  ${({ theme }) => theme.fonts.h3};
  color: ${({ theme }) => theme.colors.copy};
  margin: 0;
`

export const SubHeading = styled.p`
  ${({ theme }) => theme.fonts.reg16}
  color:  ${({ theme }) => theme.colors.supportingCopy};
  margin: 0;
`

export function PerformanceBlock({
  title,
  description,
  children,
  headerBorderBottom = true
}: PerformanceBlockProps) {
  return (
    <div className="performance-block">
      <Header borderBottom={headerBorderBottom}>
        <Heading>{title}</Heading>
        {description && <SubHeading>{description}</SubHeading>}
      </Header>
      {children}
    </div>
  )
}
