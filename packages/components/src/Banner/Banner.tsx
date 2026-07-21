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
import { lightColors } from '../semantics'

export type BannerVariant = 'active' | 'inactive' | 'pending' | 'default'

const Wrapper = styled(Box)<{ variant: BannerVariant }>`
  padding: 0;
  overflow: hidden;
  --banner-background-color: ${({ variant }) => `
    ${variant === 'active' ? lightColors['feedback/positiveSubtle'] : ''}
    ${variant === 'inactive' ? lightColors['feedback/negativeSubtle'] : ''}
    ${variant === 'pending' ? lightColors['feedback/warningSubtle'] : ''}
    ${variant === 'default' ? lightColors['feedback/infoSubtle'] : ''}
  `};
  --banner-border-color: ${({ variant }) => `
    ${variant === 'active' ? lightColors['feedback/positive'] : ''}
    ${variant === 'inactive' ? lightColors['feedback/negative'] : ''}
    ${variant === 'pending' ? lightColors['feedback/warning'] : ''}
    ${variant === 'default' ? lightColors['feedback/info'] : ''}
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
