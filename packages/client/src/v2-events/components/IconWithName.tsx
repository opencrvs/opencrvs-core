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
import styled from 'styled-components'
import { DeclarationIcon, Duplicate } from '@opencrvs/components/lib/icons'
import { AvailableIcons, Flag, InherentFlags } from '@opencrvs/commons/client'
import { getEventIcon } from './IconWithNameEvent'

export const Flex = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    align-items: flex-start;
  }
`

export const STATUS_TO_COLOR_MAP = {
  OUTBOX: 'grey',
  ARCHIVED: 'grey',
  DRAFT: 'purple',
  CREATED: 'purple',
  IN_PROGRESS: 'purple',
  NOTIFIED: 'purple',
  DECLARED: 'orange',
  REJECTED: 'red',
  VALIDATED: 'orange',
  REGISTERED: 'green',
  CERTIFIED: 'teal',
  WAITING_VALIDATION: 'teal',
  SUBMITTED: 'orange',
  SUBMITTING: 'orange',
  ISSUED: 'blue'
}

export const Icon = styled.div`
  flex-shrink: 0;
  display: flex;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    align-items: flex-end;
  }
  width: 24px;
`

export function getIconColor(
  status: keyof typeof STATUS_TO_COLOR_MAP,
  flags?: Flag[]
) {
  let color = STATUS_TO_COLOR_MAP[status]

  if (flags?.length) {
    if (flags.includes(InherentFlags.CORRECTION_REQUESTED)) {
      color = 'blue'
    }
  }

  return color
}

export function IconWithName({
  status,
  name,
  isValidatedOnReview,
  isArchived,
  flags,
  iconName
}: {
  status: keyof typeof STATUS_TO_COLOR_MAP
  name: React.ReactNode
  isValidatedOnReview?: boolean
  isArchived?: boolean
  flags?: Flag[]
  /** Icon resolved from `EventConfig.icon`, taking precedence over the default status/flag-based icon. */
  iconName?: AvailableIcons
}) {
  return (
    <Flex id="flex">
      <Icon>
        {getEventIcon(flags, status, isArchived, isValidatedOnReview, iconName)}
      </Icon>
      {name}
    </Flex>
  )
}
