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

export interface ILeftNavigationProps {
  applicationName: string
  children?: React.ReactNode
  navigationWidth?: number
  avatar?: () => void
  name?: string | null
  role?: string | null
}
const LeftNavigationContainer = styled.div<{
  navigationWidth?: number
}>`
  position: fixed;
  top: 0px;
  width: ${({ navigationWidth }) =>
    navigationWidth ? navigationWidth : 249}px;
  height: 100vh;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.white};
  border-right: 1px solid ${({ theme }) => theme.colors.grey300};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    ${({ navigationWidth }) => !navigationWidth && `display: none;`}
  }
`
const UserInfo = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: 32px 24px;
  text-align: justify;
  border: 0px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`
const UserName = styled.p`
  ${({ theme }) => theme.fonts.h4};
  margin: 25px 0px 5px;
`
const Role = styled.p`
  ${({ theme }) => theme.fonts.reg12};
  margin: 0px;
`

const ApplicationNameContainer = styled.div`
  padding: 16px 20px;
  height: 56px;
  background-color: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`
const ApplicationName = styled.div`
  color: ${({ theme }) => theme.colors.grey};
  ${({ theme }) => theme.fonts.h4};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const LeftNavigation = (props: ILeftNavigationProps) => {
  return (
    <LeftNavigationContainer navigationWidth={props.navigationWidth}>
      <ApplicationNameContainer>
        <ApplicationName>{props.applicationName}</ApplicationName>
      </ApplicationNameContainer>
      <UserInfo>
        {props.avatar && props.avatar()}
        <UserName>{props.name && props.name}</UserName>
        <Role>{props.role && props.role}</Role>
      </UserInfo>
      {props.children && props.children}
    </LeftNavigationContainer>
  )
}
