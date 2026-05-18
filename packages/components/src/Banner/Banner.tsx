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

export type BannerVariant = 'active' | 'inactive' | 'pending' | 'default'

const Wrapper = styled(Box)<{ variant: BannerVariant }>`
  padding: 0;
  overflow: hidden;
  --banner-background-color: ${({ variant, theme }) => `
    ${variant === 'active' ? theme.colors.greenLighter : ''}
    ${variant === 'inactive' ? theme.colors.redLighter : ''}
    ${variant === 'pending' ? theme.colors.orangeLighter : ''}
    ${variant === 'default' ? theme.colors.primaryLighter : ''}
  `};
  --banner-border-color: ${({ variant, theme }) => `
    ${variant === 'active' ? theme.colors.green : ''}
    ${variant === 'inactive' ? theme.colors.red : ''}
    ${variant === 'pending' ? theme.colors.orange : ''}
    ${variant === 'default' ? theme.colors.primary : ''}
  `};
  border: 1px solid var(--banner-border-color);
`
const HeaderWrapper = styled(Stack)`
  padding: 12px 16px;
  background-color: var(--banner-background-color);
  border-bottom: 1px solid var(--banner-border-color);
`
const BodyWrapper = styled(Stack)`
  padding: 20px 16px 8px;
`

const FooterWrapper = styled(Stack)`
  padding: 8px 16px 16px;
`

export interface IBannerProps {
  variant: BannerVariant
}

const Container: React.FC<{ children: React.ReactNode } & IBannerProps> = ({
  children,
  variant
}) => <Wrapper variant={variant}>{children}</Wrapper>

const Header: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <HeaderWrapper justifyContent="space-between">{children}</HeaderWrapper>
)

const Body: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BodyWrapper>{children}</BodyWrapper>
)

const Footer: React.FC<{ children: React.ReactNode } & IStackProps> = ({
  children,
  ...otherProps
}) => (
  <FooterWrapper direction="row" {...otherProps}>
    {children}
  </FooterWrapper>
)

export const Banner = { Container, Header, Body, Footer }
