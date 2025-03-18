/* eslint-disable no-restricted-imports */
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
import { defineMessages, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { ActionType } from '@opencrvs/commons/client'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import { generateGoToHomeTabUrl } from '@client/navigation'
import { Pages as PagesComponent } from '@client/v2-events/features/events/components/Pages'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import { buttonMessages } from '@client/i18n/messages'
import { useEventMetadata } from '@client/v2-events/features/events/useEventMeta'

const messages = defineMessages({
  title: {
    defaultMessage: 'Correct Record',
    description: 'Label for correct record button in dropdown menu',
    id: 'v2.action.correct'
  }
})

export function AdditionalDetails() {
  const navigate = useNavigate()

  const { eventId, pageId } = useTypedParams(
    ROUTES.V2.EVENTS.REQUEST_CORRECTION.ADDITIONAL_DETAILS
  )
  const events = useEvents()
  const metadata = useEventMetadata((state) => state.getMetadata())
  const setMetadata = useEventMetadata((state) => state.setMetadata)

  const event = events.getEventState.useSuspenseQuery(eventId)

  const intl = useIntl()

  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )

  const actionConfiguration = configuration.actions.find(
    (action) => action.type === ActionType.REQUEST_CORRECTION
  )

  if (!actionConfiguration) {
    throw new Error(
      `User got to a request correction flow without configuration defined for this action. Event ID: ${eventId}, Page ID: ${pageId}, Action Type: ${ActionType.REQUEST_CORRECTION}`
    )
  }

  const formPages = actionConfiguration.additionalDetailsForm

  const currentPageId =
    formPages.find((p) => p.id === pageId)?.id || formPages[0]?.id

  React.useEffect(() => {
    if (!currentPageId) {
      navigate(
        ROUTES.V2.EVENTS.REQUEST_CORRECTION.ADDITIONAL_DETAILS.buildPath({
          eventId: event.id,
          pageId: formPages[0]?.id
        })
      )
    }
  }, [currentPageId, navigate, event.id, pageId, formPages])

  if (!currentPageId) {
    return null
  }

  return (
    <>
      <ActionPageLight
        hideBackground
        goBack={() => navigate(-1)}
        goHome={() =>
          navigate(
            generateGoToHomeTabUrl({
              tabId: WORKQUEUE_TABS.readyForReview
            })
          )
        }
        id="corrector_form"
        title={intl.formatMessage(messages.title)}
      >
        <PagesComponent
          // @TODO: Use subscription if needed
          continueButtonText={intl.formatMessage(buttonMessages.continueButton)}
          form={metadata}
          formPages={formPages}
          pageId={currentPageId}
          setFormData={(data) => setMetadata(data)}
          showReviewButton={false}
          onFormPageChange={(nextPageId: string) => {
            return navigate(
              ROUTES.V2.EVENTS.REQUEST_CORRECTION.ADDITIONAL_DETAILS.buildPath({
                eventId: event.id,
                pageId: nextPageId
              })
            )
          }}
          onSubmit={() => {
            return navigate(
              ROUTES.V2.EVENTS.REQUEST_CORRECTION.SUMMARY.buildPath({
                eventId: event.id
              })
            )
          }}
        />
      </ActionPageLight>
    </>
  )
}
