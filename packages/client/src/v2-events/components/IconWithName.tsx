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
import { DeclarationIcon } from '@opencrvs/components/lib/icons'
import { Flag, InherentFlags } from '@opencrvs/commons/client'

export const Flex = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    align-items: flex-start;
  }
`

const STATUS_TO_COLOR_MAP = {
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
  flags
}: {
  status: keyof typeof STATUS_TO_COLOR_MAP
  name: React.ReactNode
  isValidatedOnReview?: boolean
  isArchived?: boolean
  flags?: Flag[]
}) {
  return (
    <Flex id="flex">
      <Icon>
        <DeclarationIcon
          color={getIconColor(status, flags)}
          isArchive={isArchived}
          isValidatedOnReview={isValidatedOnReview}
        />
      </Icon>
      {name}
    </Flex>
  )
}
