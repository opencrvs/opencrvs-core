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
import styled from 'styled-components'
import { Icon } from '@opencrvs/components/lib/Icon'
import { SummaryBanner as SummaryBannerConfig } from '@opencrvs/commons/client'

type BannerType = SummaryBannerConfig['type']

const accentColor = {
  info: 'primary',
  warning: 'orange',
  error: 'red'
} as const

const Container = styled.div<{ $type: BannerType }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: 32px 24px;
  margin-bottom: 16px;
  border-radius: 4px;
  background-color: ${({ $type, theme }) =>
    // eslint-disable-next-line no-nested-ternary
    $type === 'error'
      ? theme.colors.redLighter
      : $type === 'warning'
        ? theme.colors.orangeLighter
        : theme.colors.primaryLighter};
`

const IconBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.white};
`

const Title = styled.span`
  ${({ theme }) => theme.fonts.bold16};
  color: ${({ theme }) => theme.colors.copy};
`

const Description = styled.span`
  ${({ theme }) => theme.fonts.reg14};
  color: ${({ theme }) => theme.colors.grey500};
`

export function SummaryBanner({
  type,
  icon,
  title,
  description,
  'data-testid': dataTestId
}: {
  type: BannerType
  icon?: SummaryBannerConfig['icon']
  title: string
  description?: string
  'data-testid'?: string
}) {
  return (
    <Container $type={type} data-testid={dataTestId}>
      {icon && (
        <IconBadge>
          <Icon color={accentColor[type]} name={icon} size="large" />
        </IconBadge>
      )}
      <Title>{title}</Title>
      {description && <Description>{description}</Description>}
    </Container>
  )
}
