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
import { DeclarationIcon, Duplicate, Box } from '@opencrvs/components/lib/icons'
import { Stack } from '@opencrvs/components'
import { InherentFlags, Flag } from '@opencrvs/commons/client'
import { Lock } from '@opencrvs/components/lib/Icon/all-icons'
import {
  Flex,
  getIconColor,
  Icon,
  IconWithName,
  STATUS_TO_COLOR_MAP
} from './IconWithName'

interface IconWithNameEventProps
  extends React.ComponentProps<typeof IconWithName> {
  event: string
}

const Event = styled.div`
  color: ${({ theme }) => theme.colors.grey500};
  ${({ theme }) => theme.fonts.reg16}
`
const SealedContainer = styled.div`
  position: relative;
  display: inline-block;
`

const LockContainer = styled.div`
  position: absolute;
  bottom: -4px;
  right: -7px;
  /* stylelint-disable-next-line opencrvs/no-font-styles */
  font-size: 16px;
`

export function getEventIcon(
  flags: Flag[] | undefined,
  status: keyof typeof STATUS_TO_COLOR_MAP,
  isArchived: boolean | undefined,
  isValidatedOnReview: boolean | undefined
) {
  if (flags?.includes(InherentFlags.SEALED)) {
    return (
      <SealedContainer>
        <DeclarationIcon
          color={getIconColor(status, flags)}
          isArchive={isArchived}
          isValidatedOnReview={isValidatedOnReview}
        />
        <LockContainer>{'🔐'}</LockContainer>
      </SealedContainer>
    )
  }

  if (flags?.includes(InherentFlags.POTENTIAL_DUPLICATE)) {
    return <Duplicate />
  }

  return (
    <DeclarationIcon
      color={getIconColor(status, flags)}
      isArchive={isArchived}
      isValidatedOnReview={isValidatedOnReview}
    />
  )
}
export function IconWithNameEvent({
  status,
  name,
  isValidatedOnReview,
  isArchived,
  flags,
  event
}: IconWithNameEventProps) {
  return (
    <Flex id="flex">
      <Icon>
        {getEventIcon(flags, status, isArchived, isValidatedOnReview)}
      </Icon>
      <Stack alignItems="flex-start" direction="column" gap={0}>
        {name}
        <Event>{event}</Event>
      </Stack>
    </Flex>
  )
}
