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
import { STATUSTOCOLOR } from '@client/views/RecordAudit/RecordAudit'
import { Duplicate, StatusFailed } from '@opencrvs/components/lib/icons'
import { SUBMISSION_STATUS } from '@client/declarations'
import { Spinner } from '@opencrvs/components/lib/interface/Spinner'
import { Uploaded } from '@opencrvs/components/lib/icons/Uploaded'
import { WaitingToSent } from '@opencrvs/components/lib/icons/WaitingToSent'
import { ConnectionError } from '@opencrvs/components/lib/icons/ConnectionError'
import { LinkButton } from '@opencrvs/components/lib/buttons'

const Flex = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    align-items: flex-start;
  }
`

export const NameContainer = styled(LinkButton)`
  height: auto;
  margin-left: 0;
  div {
    padding: 0;
  }
`

export const NoNameContainer = styled.span`
  color: ${({ theme }) => theme.colors.negative};
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.colors.negative};
    text-decoration-line: underline;
    text-underline-offset: 4px;
  }
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
  display: flex;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    align-items: flex-end;
  }
  width: 24px;
`
interface IIconWith {
  status?: string
  name: React.ReactNode
  event?: string
  isDuplicate?: boolean
  isValidatedOnReview?: boolean
  isArchived?: boolean
}

const IconComp = ({
  status,
  isDuplicateIcon,
  isValidatedOnReview,
  isArchived
}: {
  status: string
  isDuplicateIcon?: boolean
  isValidatedOnReview?: boolean
  isArchived?: boolean
}) => {
  return (
    <Icon>
      {isDuplicateIcon ? (
        <Duplicate />
      ) : (
        <DeclarationIcon
          color={STATUSTOCOLOR[status]}
          isValidatedOnReview={isValidatedOnReview}
          isArchive={isArchived}
        />
      )}
    </Icon>
  )
}

export const IconWithName = ({
  status,
  name,
  isDuplicate,
  isValidatedOnReview,
  isArchived
}: IIconWith) => {
  return (
    <Flex id="flex">
      {status && (
        <IconComp
          status={status}
          isDuplicateIcon={isDuplicate}
          isValidatedOnReview={isValidatedOnReview}
          isArchived={isArchived}
        />
      )}
      {name}
    </Flex>
  )
}

export const IconWithNameEvent = ({
  status,
  name,
  event,
  isDuplicate,
  isValidatedOnReview,
  isArchived
}: IIconWith) => {
  return (
    <Flex id="flex">
      {status && (
        <IconComp
          status={status}
          isDuplicateIcon={isDuplicate}
          isValidatedOnReview={isValidatedOnReview}
          isArchived={isArchived}
        />
      )}
      <NameEventContainer id="nameEvent">
        {name}
        {event && <Event>{event}</Event>}
      </NameEventContainer>
    </Flex>
  )
}

export const SubmissionStatusMap = ({
  status,
  online,
  index
}: {
  status: string
  online: boolean
  index: number
}) => {
  let icon: React.ReactNode
  let overwriteStatusIfOffline = true
  let iconId: string
  switch (status) {
    case SUBMISSION_STATUS[SUBMISSION_STATUS.SUBMITTING]:
      iconId = `submitting${index}`
      icon = <Spinner id={iconId} key={iconId} size={24} />
      break
    case SUBMISSION_STATUS[SUBMISSION_STATUS.SUBMITTED]:
    case SUBMISSION_STATUS[SUBMISSION_STATUS.DECLARED]:
      overwriteStatusIfOffline = false
      iconId = `submitted${index}`
      icon = <Uploaded id={iconId} key={iconId} />
      break
    case SUBMISSION_STATUS[SUBMISSION_STATUS.FAILED]:
      overwriteStatusIfOffline = false
      iconId = `failed${index}`
      icon = <StatusFailed id={iconId} key={iconId} />
      break
    case SUBMISSION_STATUS[SUBMISSION_STATUS.READY_TO_SUBMIT]:
      iconId = `waiting${index}`
      icon = <WaitingToSent id={iconId} key={iconId} />
      break
    default:
      iconId = `waiting${index}`
      icon = <WaitingToSent id={iconId} key={iconId} />
      break
  }

  if (!online && overwriteStatusIfOffline) {
    iconId = `offline${index}`
    icon = <ConnectionError id={iconId} key={iconId} />
  }

  return <>{icon}</>
}
