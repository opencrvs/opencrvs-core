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
import { Button, Content, Divider, Icon } from '@opencrvs/components'
import { ROUTES } from '@client/v2-events/routes'
import { buttonMessages } from '@client/i18n/messages/buttons'
import { useEvents } from '../../../useEvents/useEvents'
import { useEventFormData } from '../../../useEventFormData'
import { useActionAnnotation } from '../../../useActionAnnotation'
import { CorrectionDetails } from './Summary/CorrectionDetails'

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

const messages = defineMessages({
  correctionRequest: {
    id: 'v2-events.correction.correctionRequest',
    defaultMessage: 'Correction request',
    description: 'Correction request text'
  }
})

export function ReviewCorrection() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.REQUEST_CORRECTION.REVIEW)
  const events = useEvents()
  const intl = useIntl()
  const event = events.getEvent.getFromCache(eventId)
  const getFormValues = useEventFormData((state) => state.getFormValues)

  const form = getFormValues()
  const { getAnnotation } = useActionAnnotation()
  const annotation = getAnnotation()

  return (
    <>
      <Content
        bottomActionButtons={[
          <>
            <Button
              id="ApproveCorrectionBtn"
              size="large"
              type="positive"
              onClick={() => alert('approve correction')}
            >
              <Icon name="Check" />
              {intl.formatMessage(buttonMessages.approve)}
            </Button>
            <Button
              id="rejectCorrectionBtn"
              size="large"
              type="negative"
              onClick={() => alert('reject correction')}
            >
              <Icon name="X" />
              {intl.formatMessage(buttonMessages.reject)}
            </Button>
          </>
        ]}
        showTitleOnMobile={true}
        title={intl.formatMessage(messages.correctionRequest)}
      >
        <ReviewContainter>
          <Card>
            <CorrectionDetails
              annotation={annotation}
              event={{
                type: event.type,
                id: event.id,
                actions: event.actions,
                trackingId: event.trackingId,
                updatedAt: event.updatedAt,
                createdAt: event.createdAt
              }}
              form={form}
            />
          </Card>
          <Divider />
        </ReviewContainter>
      </Content>
    </>
  )
}
