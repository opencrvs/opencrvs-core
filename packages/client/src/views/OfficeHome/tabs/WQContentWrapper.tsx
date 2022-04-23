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
import {
  Content,
  ContentSize
} from '@opencrvs/components/lib/interface/Content'
import styled from 'styled-components'

interface IContentWrapper {
  isMobileSize: boolean
  title: string
  children: React.ReactNode | React.ReactNode[]
  tabBarContent?: React.ReactNode
}

const TabBarContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  padding-left: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
`

const MobileChildrenContainer = styled.div`
  margin: 20px 16px 0;
`

export const WQContentWrapper = ({
  tabBarContent,
  isMobileSize,
  title,
  children
}: IContentWrapper) => {
  if (isMobileSize) {
    return (
      <>
        {tabBarContent && <TabBarContainer>{tabBarContent}</TabBarContainer>}
        <MobileChildrenContainer>{children}</MobileChildrenContainer>
      </>
    )
  } else {
    return (
      <Content
        title={title}
        size={ContentSize.LARGE}
        tabBarContent={tabBarContent}
      >
        {children}
      </Content>
    )
  }
}
