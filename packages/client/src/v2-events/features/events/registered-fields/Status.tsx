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
import { useIntl } from 'react-intl'
import { Banner, Icon, Pill, Text } from '@opencrvs/components'
import * as SupportedIcons from '@opencrvs/components/lib/Icon/all-icons'
import {
  VerificationStatus,
  VerificationStatusValue
} from '@opencrvs/commons/client'

const StyledIcon = styled(Icon)`
  margin-right: 4px;
`

const IconWrapper = styled.div<{
  type: VerificationStatusValue
}>`
  --background-color: ${({ theme, type }) => `
    ${type === 'authenticated' ? theme.colors.primaryLight : ''}
    ${type === 'verified' ? theme.colors.greenLight : ''}
    ${type === 'failed' ? theme.colors.redLight : ''}
  `};
  height: 24px;
  width: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background-color);
`

const PILL_FOR_STATUS = {
  verified: 'default',
  authenticated: 'active',
  failed: 'inactive'
} as const

const ICON_FOR_STATUS = {
  verified: 'CircleWavyCheck',
  authenticated: 'Fingerprint',
  failed: 'X'
} satisfies Record<VerificationStatusValue, keyof typeof SupportedIcons>

function Input({
  id,
  configuration,
  value
}: {
  id: string
  configuration: VerificationStatus['configuration']
  value: VerificationStatusValue
}) {
  const intl = useIntl()

  return (
    <Banner.Container>
      <Banner.Header type={PILL_FOR_STATUS[value]}>
        <Pill
          data-testid={`${id}__${value}`}
          label={
            <>
              <StyledIcon name={ICON_FOR_STATUS[value]} size="small" />
              {intl.formatMessage(configuration.text)}
            </>
          }
          pillTheme="dark"
          size="small"
          type={PILL_FOR_STATUS[value]}
        />

        <IconWrapper type={value}>
          {value === 'verified' && (
            <Icon color="greenDarker" name="Check" size="small" weight="bold" />
          )}
          {value === 'authenticated' && (
            <Icon color="primaryDark" name="Check" size="small" weight="bold" />
          )}
          {value === 'failed' && (
            <Icon color="redDarker" name="X" size="small" weight="bold" />
          )}
        </IconWrapper>
      </Banner.Header>
      <Banner.Body>
        <Text element="span" variant="reg16">
          {intl.formatMessage(configuration.description)}
        </Text>
      </Banner.Body>
    </Banner.Container>
  )
}

function Output({
  id,
  configuration,
  value
}: {
  id: string
  configuration: VerificationStatus['configuration']
  value: VerificationStatusValue
}) {
  const intl = useIntl()

  return (
    <Pill
      data-testid={`${id}__${value}`}
      label={
        <>
          <StyledIcon name={ICON_FOR_STATUS[value]} size="small" />
          {intl.formatMessage(configuration.text)}
        </>
      }
      pillTheme="dark"
      size="small"
      type={PILL_FOR_STATUS[value]}
    />
  )
}

export const Status = {
  Input,
  Output
}
