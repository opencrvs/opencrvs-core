import * as React from 'react'
import { DeclarationIcon } from '@opencrvs/components/lib/icons'
import styled from 'styled-components'

const Flex = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    align-items: flex-start;
  }
`

interface IIconWith {
  status?: string
  name: React.ReactNode
  event?: string
  isDuplicate?: boolean
  isValidatedOnReview?: boolean
  isArchived?: boolean
}

export const STATUS_TO_COLOR_MAP: { [key: string]: string } = {
  ARCHIVED: 'grey',
  DRAFT: 'purple',
  IN_PROGRESS: 'purple',
  DECLARED: 'orange',
  REJECTED: 'red',
  VALIDATED: 'grey',
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

const IconComp = ({
  status,
  isValidatedOnReview,
  isArchived
}: {
  status: string
  isValidatedOnReview?: boolean
  isArchived?: boolean
}) => {
  return (
    <Icon>
      <DeclarationIcon
        color={STATUS_TO_COLOR_MAP[status]}
        isValidatedOnReview={isValidatedOnReview}
        isArchive={isArchived}
      />
    </Icon>
  )
}

export const IconWithName = ({
  status,
  name,
  isValidatedOnReview,
  isArchived
}: IIconWith) => {
  return (
    <Flex id="flex">
      {status && (
        <IconComp
          status={status}
          isValidatedOnReview={isValidatedOnReview}
          isArchived={isArchived}
        />
      )}
      {name}
    </Flex>
  )
}
