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
import { useIntl } from 'react-intl'
import { Icon } from '@opencrvs/components/lib/Icon'

const messages = {
  title: {
    defaultMessage: 'You cannot review this record for duplicates',
    description:
      'Title of the banner shown when the user cannot access every record matched as a potential duplicate',
    id: 'duplicates.reviewUnavailable.title'
  },
  description: {
    defaultMessage:
      'It is flagged against a record registered outside your jurisdiction, which you are not permitted to view. The review must be completed by someone with access to both records.',
    description:
      'Body of the banner shown when the user cannot access every record matched as a potential duplicate',
    id: 'duplicates.reviewUnavailable.description'
  }
}

const Wrapper = styled.div`
  margin: 16px auto;
  max-width: 1140px;
`

const Panel = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.negative};
  background: ${({ theme }) => theme.colors.redLighter};
`

const IconWrapper = styled.div`
  display: flex;
  flex-shrink: 0;
  margin-top: 2px;
`

const Title = styled.div`
  ${({ theme }) => theme.fonts.bold16};
  color: ${({ theme }) => theme.colors.negative};
`

const Description = styled.div`
  ${({ theme }) => theme.fonts.reg16};
  color: ${({ theme }) => theme.colors.copy};
`

export function DuplicateReviewUnavailable({
  className
}: {
  className?: string
}) {
  const intl = useIntl()

  return (
    <Wrapper className={className}>
      <Panel data-testid="duplicate-review-unavailable">
        <IconWrapper>
          <Icon color="red" name="WarningCircle" size="medium" />
        </IconWrapper>
        <div>
          <Title>{intl.formatMessage(messages.title)}</Title>
          <Description>{intl.formatMessage(messages.description)}</Description>
        </div>
      </Panel>
    </Wrapper>
  )
}
