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
import { Stack } from '@opencrvs/components'
import { InherentFlags } from '@opencrvs/commons/client'
import { Flex, getIconColor, Icon, IconWithName } from './IconWithName'

interface IconWithNameEventProps
  extends React.ComponentProps<typeof IconWithName> {
  event: string
}

const Event = styled.div`
  color: ${({ theme }) => theme.colors.grey500};
  ${({ theme }) => theme.fonts.reg16}
`
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
        {flags?.includes(InherentFlags.POTENTIAL_DUPLICATE) ? (
          <Duplicate />
        ) : (
          <DeclarationIcon
            color={getIconColor(status, flags)}
            isArchive={isArchived}
            isValidatedOnReview={isValidatedOnReview}
          />
        )}
      </Icon>
      <Stack alignItems="flex-start" direction="column" gap={0}>
        {name}
        <Event>{event}</Event>
      </Stack>
    </Flex>
  )
}
