/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as React from 'react'
import styled from '@client/styledComponents'
import { DeclarationIcon } from '@opencrvs/components/lib/icons/DeclarationIcon'
import { STATUSTOCOLOR } from '@client/views/Home/RecordAudit'
import { StringifyOptions } from 'querystring'
import { Duplicate } from '@opencrvs/components/lib/icons'

const Flex = styled.div`
  display: flex;
  gap: 16px;
`

const Name = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  ${({ theme }) => theme.fonts.bold16}
  margin-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Error = styled.span`
  color: ${({ theme }) => theme.colors.negative};
`

const Event = styled.div`
  color: ${({ theme }) => theme.colors.grey500};
  ${({ theme }) => theme.fonts.reg16}
`

const NameEventContainer = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Icon = styled.div`
  flex-shrink: 0;
  width: 24px;
`
interface IIconWith {
  status?: string
  name?: string
  event?: string
  isDuplicate?: boolean
  isValidatedOnReview?: boolean
}

const IconComp = ({
  status,
  isDuplicateIcon,
  isValidatedOnReview
}: {
  status: string
  isDuplicateIcon?: boolean
  isValidatedOnReview?: boolean
}) => {
  return (
    <Icon>
      {isDuplicateIcon ? (
        <Duplicate />
      ) : (
        <DeclarationIcon
          color={STATUSTOCOLOR[status]}
          isValidatedOnReview={isValidatedOnReview}
        />
      )}
    </Icon>
  )
}

export const IconWithName = ({
  status,
  name,
  isDuplicate,
  isValidatedOnReview
}: IIconWith) => {
  return (
    <Flex id="flex">
      {status && (
        <IconComp
          status={status}
          isDuplicateIcon={isDuplicate}
          isValidatedOnReview={isValidatedOnReview}
        />
      )}
      {name ? <Name id="name">{name}</Name> : <Error>No name provided</Error>}
    </Flex>
  )
}

export const IconWithNameEvent = ({
  status,
  name,
  event,
  isDuplicate,
  isValidatedOnReview
}: IIconWith) => {
  return (
    <Flex id="flex">
      {status && (
        <IconComp
          status={status}
          isDuplicateIcon={isDuplicate}
          isValidatedOnReview={isValidatedOnReview}
        />
      )}
      <NameEventContainer id="nameEvent">
        {name ? <Name>{name}</Name> : <Error>No name provided</Error>}
        {event && <Event>{event}</Event>}
      </NameEventContainer>
    </Flex>
  )
}
