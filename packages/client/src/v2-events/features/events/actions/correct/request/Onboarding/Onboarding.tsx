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
import {
  useTypedParams,
  useTypedSearchParams
} from 'react-router-typesafe-routes/dom'
import { ActionType, getCurrentEventState } from '@opencrvs/commons/client'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { buttonMessages } from '@client/i18n/messages'
import { Pages as PagesComponent } from '@client/v2-events/features/events/components/Pages'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useActionAnnotation } from '@client/v2-events/features/events/useActionAnnotation'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'

const messages = defineMessages({
  title: {
    defaultMessage: 'Correct Record',
    description: 'Label for correct record button in dropdown menu',
    id: 'action.correct'
  }
})

export function Onboarding() {
  const { eventId, pageId } = useTypedParams(
    ROUTES.V2.EVENTS.REQUEST_CORRECTION.ONBOARDING
  )
  const [{ workqueue }] = useTypedSearchParams(
    ROUTES.V2.EVENTS.REQUEST_CORRECTION.ONBOARDING
  )
  const validatorContext = useValidatorContext()
  const events = useEvents()
  const annotation = useActionAnnotation((state) => state.getAnnotation())
  const setAnnotation = useActionAnnotation((state) => state.setAnnotation)

  const event = events.getEvent.useGetEventFromCache(eventId)

  const navigate = useNavigate()
  const intl = useIntl()
  const { closeActionView } = useEventFormNavigation()
  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )

  const actionConfiguration = configuration.actions.find(
    (action) => action.type === ActionType.REQUEST_CORRECTION
  )

  if (!actionConfiguration) {
    throw new Error(
      `User got to a request correction flow without configuration defined for action type: ${ActionType.REQUEST_CORRECTION}, eventId: ${eventId}, pageId: ${pageId}`
    )
  }

  const formPages = actionConfiguration.correctionForm.pages
  const eventIndex = getCurrentEventState(event, configuration)

  const currentPageId =
    formPages.find((p) => p.id === pageId)?.id || formPages[0]?.id

  React.useEffect(() => {
    if (!currentPageId) {
      navigate(
        ROUTES.V2.EVENTS.REQUEST_CORRECTION.REVIEW.buildPath(
          {
            eventId: event.id
          },
          { workqueue }
        )
      )
    }
  }, [currentPageId, navigate, event.id, workqueue])

  if (!currentPageId) {
    return null
  }

  return (
    <ActionPageLight
      hideBackground
      goBack={() => navigate(-1)}
      goHome={() => closeActionView()}
      id="corrector_form"
      title={intl.formatMessage(messages.title)}
    >
      <PagesComponent
        continueButtonText={intl.formatMessage(buttonMessages.continueButton)}
        declaration={eventIndex.declaration}
        eventConfig={configuration}
        form={annotation}
        formPages={formPages}
        pageId={currentPageId}
        setFormData={(data) => setAnnotation(data)}
        showReviewButton={false}
        validateBeforeNextPage={true}
        validatorContext={validatorContext}
        onPageChange={(nextPageId: string) => {
          return navigate(
            ROUTES.V2.EVENTS.REQUEST_CORRECTION.ONBOARDING.buildPath(
              {
                eventId,
                pageId: nextPageId
              },
              { workqueue }
            )
          )
        }}
        onSubmit={() => {
          return navigate(
            ROUTES.V2.EVENTS.REQUEST_CORRECTION.REVIEW.buildPath(
              { eventId },
              { workqueue }
            )
          )
        }}
      />
    </ActionPageLight>
  )
}
