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
import { defineMessages, useIntl } from 'react-intl'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { EventState } from '@opencrvs/commons/client'
import { Button, Icon } from '@opencrvs/components'
import { buttonMessages } from '@client/i18n/messages/buttons'
import { ROUTES } from '@client/v2-events/routes'
import { useActionAnnotation } from '../../../useActionAnnotation'
import { useEvents } from '../../../useEvents/useEvents'
import { CorrectionDetails } from './Summary/CorrectionDetails'
import { ReviewHeader } from './ReviewHeader'

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  background: ${({ theme }) => theme.colors.white};
  border-radius: 4px;
  margin-bottom: 40px;
  &:last-child {
    margin-bottom: 200px;
  }
`

const ReviewContainter = styled.div<{ paddingT?: boolean }>`
  padding: ${({ paddingT }) => (paddingT ? '32px 32px 0 32px' : '0px 32px')};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 0px 24px;
  }
`

const Row = styled.div<{
  position?: 'left' | 'center'
  background?: 'white' | 'background'
}>`
  display: flex;
  gap: 24px;
  width: 100%;
  justify-content: ${({ position }) => position || 'center'};
  background-color: ${({ theme, background }) =>
    !background || background === 'background'
      ? theme.colors.background
      : theme.colors.white};
  flex-direction: row;
  padding: 24px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 0;
  }
`

const messages = defineMessages({
  correctionRequest: {
    id: 'v2-events.correction.correctionRequest',
    defaultMessage: 'Correction request',
    description: 'Correction request text'
  }
})

export function ReviewCorrection({ form }: { form: EventState }) {
  const intl = useIntl()
  const { getAnnotation } = useActionAnnotation()
  const annotation = getAnnotation()
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.REQUEST_CORRECTION.REVIEW)
  const events = useEvents()
  const event = events.getEvent.getFromCache(eventId)

  return (
    <Card>
      <ReviewContainter paddingT={true}>
        <ReviewHeader
          id="correction_header"
          subject={messages.correctionRequest}
        />
        <CorrectionDetails annotation={annotation} event={event} form={form} />
        <Row background="white" position="left">
          <Button
            id="ApproveCorrectionBtn"
            size="large"
            type="positive"
            onClick={() => alert('Approve correction clicked')}
          >
            <Icon name="Check" />
            {intl.formatMessage(buttonMessages.approve)}
          </Button>
          <Button
            id="rejectCorrectionBtn"
            size="large"
            type="negative"
            onClick={() => alert('Reject correction clicked')}
          >
            <Icon name="X" />
            {intl.formatMessage(buttonMessages.reject)}
          </Button>
        </Row>
      </ReviewContainter>
    </Card>
  )
}
