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

const Flex = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    align-items: flex-start;
  }
`

interface IconProps {
  status?: string
  name: React.ReactNode
  event?: string
  isValidatedOnReview?: boolean
  isArchived?: boolean
}

const Event = styled.div`
  color: ${({ theme }) => theme.colors.grey500};
  ${({ theme }) => theme.fonts.reg16}
`

const NameEventContainer = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const STATUS_TO_COLOR_MAP: { [key: string]: string } = {
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
  CORRECTION_REQUESTED: 'blue',
  WAITING_VALIDATION: 'teal',
  SUBMITTED: 'orange',
  SUBMITTING: 'orange',
  ISSUED: 'blue'
}

const Icon = styled.div`
  flex-shrink: 0;
  display: flex;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    align-items: flex-end;
  }
  width: 24px;
`

function IconComp({
  status,
  isValidatedOnReview,
  isArchived
}: {
  status: string
  isValidatedOnReview?: boolean
  isArchived?: boolean
}) {
  return (
    <Icon>
      <DeclarationIcon
        color={STATUS_TO_COLOR_MAP[status]}
        isArchive={isArchived}
        isValidatedOnReview={isValidatedOnReview}
      />
    </Icon>
  )
}

export function IconWithName({
  status,
  name,
  isValidatedOnReview,
  isArchived
}: IconProps) {
  return (
    <Flex id="flex">
      {status && (
        <IconComp
          isArchived={isArchived}
          isValidatedOnReview={isValidatedOnReview}
          status={status}
        />
      )}
      {name}
    </Flex>
  )
}

export function IconWithNameEvent({
  status,
  name,
  event,
  isValidatedOnReview,
  isArchived
}: IconProps) {
  return (
    <Flex id="flex">
      {status && (
        <IconComp
          isArchived={isArchived}
          isValidatedOnReview={isValidatedOnReview}
          status={status}
        />
      )}
      <NameEventContainer id="nameEvent">
        {name}
        {event && <Event>{event}</Event>}
      </NameEventContainer>
    </Flex>
  )
}
