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
import { FieldProps } from '@opencrvs/commons/client'
import * as SupportedIcons from '@opencrvs/components/lib/Icon/all-icons'

function throwIfUnsupportedIcon(icon: string) {
  if (icon in SupportedIcons) {
    return icon as keyof typeof SupportedIcons
  }

  throw new Error(
    `Unsupported icon in FieldType.STATUS: ${icon}. Please use one of the supported icons from @opencrvs/components`
  )
}

const StyledIcon = styled(Icon)`
  margin-right: 4px;
`

const IconWrapper = styled.div<{
  type: FieldProps<'STATUS'>['configuration']['theme']
}>`
  --background-color: ${({ theme, type }) => `
    ${type === 'default' ? theme.colors.primaryLight : ''}
    ${type === 'active' ? theme.colors.greenLight : ''}
    ${type === 'inactive' ? theme.colors.redLight : ''}
  `};
  height: 24px;
  width: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background-color);
`

function Input({
  id,
  configuration
}: Pick<FieldProps<'STATUS'>, 'id' | 'configuration'>) {
  const intl = useIntl()

  return (
    <Banner.Container>
      <Banner.Header type="active">
        <Pill
          data-testid={`${id}__${configuration.theme}`}
          label={
            <>
              <StyledIcon
                name={throwIfUnsupportedIcon(configuration.icon)}
                size="small"
              />
              {intl.formatMessage(configuration.text)}
            </>
          }
          pillTheme="dark"
          size="small"
          type={configuration.theme}
        />

        <IconWrapper type={configuration.theme}>
          {configuration.theme === 'active' && (
            <Icon color="greenDarker" name="Check" size="small" weight="bold" />
          )}
          {configuration.theme === 'default' && (
            <Icon color="primaryDark" name="Check" size="small" weight="bold" />
          )}
          {configuration.theme === 'inactive' && (
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
  configuration
}: Pick<FieldProps<'STATUS'>, 'id' | 'configuration'>) {
  const intl = useIntl()

  return (
    <Pill
      data-testid={`${id}__${configuration.theme}`}
      label={
        <>
          <StyledIcon
            name={throwIfUnsupportedIcon(configuration.icon)}
            size="small"
          />
          {intl.formatMessage(configuration.text)}
        </>
      }
      pillTheme="dark"
      size="small"
      type={configuration.theme}
    />
  )
}

export const Status = {
  Input,
  Output
}
