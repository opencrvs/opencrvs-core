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
import React from 'react'
import { Box } from '../Box'
import { IStackProps, Stack } from '../Stack'
import styled from 'styled-components'

const Wrapper = styled(Box)`
  padding: 0;
`
const HeaderWrapper = styled(Stack)<{
  type: 'active' | 'inactive' | 'pending' | 'default'
}>`
  padding: 8px 16px;
  --background-color: ${({ type, theme }) => `
  ${type === 'active' ? theme.colors.greenLighter : ''}
  ${type === 'inactive' ? theme.colors.redLighter : ''}
  ${type === 'pending' ? theme.colors.orangeLighter : ''}
  ${type === 'default' ? theme.colors.primaryLighter : ''}
  `};
  --color: ${({ type, theme }) => `
  ${type === 'active' ? theme.colors.positiveDarker : ''}
  ${type === 'inactive' ? theme.colors.negativeDarker : ''}
  ${type === 'pending' ? theme.colors.neutralDarker : ''}
  ${type === 'default' ? theme.colors.primaryDarker : ''}
`};
  background-color: var(--background-color);
  color: var(--color);
`
const ContentWrapper = styled(Stack)`
  padding: 16px;
`

export interface IBannerProps {
  type: 'active' | 'inactive' | 'pending' | 'default'
}

const Container: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Wrapper>{children}</Wrapper>
)

const Header: React.FC<{ children: React.ReactNode } & IBannerProps> = ({
  children,
  type
}) => (
  <HeaderWrapper justifyContent="space-between" type={type}>
    {children}
  </HeaderWrapper>
)

const Body: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ContentWrapper>{children}</ContentWrapper>
)

const Footer: React.FC<{ children: React.ReactNode } & IStackProps> = ({
  children,
  ...otherProps
}) => (
  <ContentWrapper direction="row" {...otherProps}>
    {children}
  </ContentWrapper>
)

export const Banner = { Container, Header, Body, Footer }
