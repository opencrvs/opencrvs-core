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
import * as React from 'react'
import { Icon } from '../Icon'
import { Button } from '../Button'
import styled from 'styled-components'
import { Text } from '../Text'
import { Stack } from '../Stack'

export interface VerificationButtonProps {
  status?: 'unverified' | 'verified' | 'offline'
  id?: string
  onClick: () => void
  labelForVerified: string
  labelForUnverified: string
  labelForOffline: string
  reviewLabelForUnverified?: string
  useAsReviewLabel?: boolean
}

const VerificationBadge = styled.div`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  color: ${({ theme }) => theme.colors.primary};
  svg {
    height: 24px;
    width: 24px;
    vertical-align: top;
    margin-left: -2px;
    margin-right: 8px;
    pointer-events: none;
  }
`

export const VerificationButton = ({
  status = 'unverified',
  onClick,
  labelForUnverified,
  labelForVerified,
  labelForOffline,
  reviewLabelForUnverified,
  useAsReviewLabel
}: VerificationButtonProps) => {
  return (
    <>
      {status === 'unverified' && !useAsReviewLabel && (
        <Button size="medium" type="secondary" onClick={onClick}>
          <Icon name="CircleWavyCheck" />
          {labelForUnverified}
        </Button>
      )}

      {status === 'unverified' && useAsReviewLabel && (
        <VerificationBadge>
          <Icon name="CircleWavyQuestion" color="red" weight="fill" />
          <Text variant="bold16" element="p" color="red">
            {reviewLabelForUnverified}
          </Text>
        </VerificationBadge>
      )}

      {status === 'offline' && (
        <Stack direction="column" alignItems="flex-start">
          <Button
            size="medium"
            type="secondary"
            disabled={true}
            aria-disabled={true}
          >
            <Icon name="CircleWavyCheck" />
            {labelForUnverified}
          </Button>
          <Text element="span" color="red" variant="reg18">
            {labelForOffline}
          </Text>
        </Stack>
      )}

      {status === 'verified' && (
        <VerificationBadge>
          <Icon name="CircleWavyCheck" color="green" weight="fill" />
          <Text variant="bold16" element="p" color="green">
            {labelForVerified}
          </Text>
        </VerificationBadge>
      )}
    </>
  )
}
