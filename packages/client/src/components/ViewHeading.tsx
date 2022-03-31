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

export interface IViewHeadingProps {
  id: string
  title?: string
  description?: string
  breadcrumb?: string
  hideBackButton?: boolean
}

const ViewHeadingContainer = styled.div`
  padding: ${({ theme }) => theme.grid.margin}px 30px;
`

const Breadcrumb = styled.div`
  ${({ theme }) => theme.fonts.bold14};
  text-transform: uppercase;
  margin-bottom: 20px;
`

const ViewTitle = styled.h2`
  ${({ theme }) => theme.fonts.h1};
  margin: 0;
`

const ViewDescription = styled.p`
  ${({ theme }) => theme.fonts.reg18};
  margin: 0;
  margin-top: 5px;
`

export function ViewHeading({
  title,
  description,
  breadcrumb,
  id
}: IViewHeadingProps) {
  return (
    <ViewHeadingContainer id={id}>
      {breadcrumb && <Breadcrumb>{breadcrumb}</Breadcrumb>}
      {title && <ViewTitle id="view_title">{title}</ViewTitle>}
      {description && <ViewDescription>{description}</ViewDescription>}
    </ViewHeadingContainer>
  )
}
