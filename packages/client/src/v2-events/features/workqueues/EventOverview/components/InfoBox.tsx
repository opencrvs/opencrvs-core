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
import { Button } from '@opencrvs/components/lib/Button'
import { Text } from '@opencrvs/components/lib/Text'
import { InfoBox as InfoBoxConfig } from '@opencrvs/commons/client'

type InfoBoxType = InfoBoxConfig['type']
type InfoBoxBackground = NonNullable<InfoBoxConfig['background']>

/** Strong tint used for the icon and (on white backgrounds) the icon block. */
const accentColor = {
  info: 'primary',
  positive: 'green',
  warning: 'orange',
  negative: 'red'
} as const

/** Light tint used for the wrapper (tinted) or the icon block (white). */
const lighterColor = {
  info: 'primaryLighter',
  positive: 'greenLighter',
  warning: 'orangeLighter',
  negative: 'redLighter'
} as const

const DEFAULT_ICON = 'FileSearch'

const Container = styled.div<{
  $type: InfoBoxType
  $background: InfoBoxBackground
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: 32px 24px;
  margin-bottom: 16px;
  border-radius: 4px;
  background-color: ${({ $type, $background, theme }) =>
    $background === 'white'
      ? theme.colors.white
      : theme.colors[lighterColor[$type]]};
  border: ${({ $background, theme }) =>
    $background === 'white' ? `1px solid ${theme.colors.grey200}` : 'none'};
`

const IconBlock = styled.div<{
  $type: InfoBoxType
  $background: InfoBoxBackground
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background-color: ${({ $type, $background, theme }) =>
    $background === 'white'
      ? theme.colors[lighterColor[$type]]
      : theme.colors.white};
`

const Heading = styled.span`
  ${({ theme }) => theme.fonts.bold16};
  color: ${({ theme }) => theme.colors.copy};
`

const Description = styled.span`
  ${({ theme }) => theme.fonts.reg14};
  color: ${({ theme }) => theme.colors.grey500};
`

export function InfoBox({
  type,
  background = 'tinted',
  icon,
  heading,
  description,
  button,
  'data-testid': dataTestId
}: {
  type: InfoBoxType
  background?: InfoBoxBackground
  icon?: InfoBoxConfig['icon']
  heading: string
  description?: string
  button?: { label: string; onClick: () => void }
  'data-testid'?: string
}) {
  return (
    <Container $background={background} $type={type} data-testid={dataTestId}>
      <IconBlock $background={background} $type={type}>
        <Icon color={accentColor[type]} name={icon ?? DEFAULT_ICON} size="large" />
      </IconBlock>
      <Heading>{heading}</Heading>
      {description && <Description>{description}</Description>}
      {button && (
        <Button size="small" type="secondary" onClick={button.onClick}>
          <Text element="span" variant="bold14">
            {button.label}
          </Text>
        </Button>
      )}
    </Container>
  )
}
