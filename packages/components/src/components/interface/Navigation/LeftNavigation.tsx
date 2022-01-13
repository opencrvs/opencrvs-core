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
}
const LeftNavigationContainer = styled.div`
  position: fixed;
  top: 0px;
  width: 249px;
  height: 100vh;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.white};
  border: 0px;
  border-right: 1px;
  border-style: solid;
  border-color: ${({ theme }) => theme.colors.border};
  z-index: 3;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`
const ApplicationNameContainer = styled.div`
  padding: 16px 20px;
  height: 64px;
  background-color: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`
const ApplicationName = styled.div`
  color: ${({ theme }) => theme.colors.grey};
  ${({ theme }) => theme.fonts.bigBodyBoldStyle};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const LeftNavigation = (props: ILeftNavigationProps) => {
  return (
    <LeftNavigationContainer>
      <ApplicationNameContainer>
        <ApplicationName>{props.applicationName}</ApplicationName>
      </ApplicationNameContainer>
      {props.children && props.children}
    </LeftNavigationContainer>
  )
}
