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

import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useTypedParams,
  useTypedSearchParams
} from 'react-router-typesafe-routes/dom'
import { v4 as uuid } from 'uuid'
import { ActionType } from '@opencrvs/commons/client'
import { useEvents } from '@client/v2-events//features/events/useEvents/useEvents'
import { Pages as PagesComponent } from '@client/v2-events/features/events/components/Pages'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { ROUTES } from '@client/v2-events/routes'
import {
  useEventFormData,
  useSubscribeEventFormData
} from '@client/v2-events/features/events/useEventFormData'
import { FormLayout } from '@client/v2-events/layouts/form'
import { isTemporaryId } from '@client/v2-events/features/events/useEvents/procedures/create'

export function Pages() {
  const { eventId, pageId } = useTypedParams(ROUTES.V2.EVENTS.DECLARE.PAGES)
  const [searchParams] = useTypedSearchParams(ROUTES.V2.EVENTS.DECLARE.PAGES)

  const navigate = useNavigate()
  const events = useEvents()
  const { modal, goToHome } = useEventFormNavigation()
  const [event] = events.getEvent.useSuspenseQuery(eventId)

  const { eventId: formEventId, formValues } = useSubscribeEventFormData()

  const setFormValues = useEventFormData((state) => state.setFormValues)

  useEffect(() => {
    if (formEventId !== event.id) {
      setFormValues(event.id, formValues)
    }
  }, [event.id, setFormValues, formEventId, formValues])

  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )
  const formPages = configuration.actions
    .find((action) => action.type === ActionType.DECLARE)
    ?.forms.find((f) => f.active)?.pages

  if (!formPages) {
    throw new Error('Form configuration not found for type: ' + event.type)
  }

  const currentPageId =
    formPages.find((p) => p.id === pageId)?.id || formPages[0]?.id

  if (!currentPageId) {
    throw new Error('Form does not have any pages')
  }

  useEffect(() => {
    if (pageId !== currentPageId) {
      navigate(
        ROUTES.V2.EVENTS.DECLARE.PAGES.buildPath({
          eventId,
          pageId: currentPageId
        }),
        { replace: true }
      )
    }
  }, [pageId, currentPageId, navigate, eventId])

  /*
   * If the event had a temporary ID and the record got persisted while the user
   * was on the declare page, we need to navigate to the event with the canonical
   * ID.
   */
  useEffect(() => {
    const hasTemporaryId = isTemporaryId(event.id)

    if (eventId !== event.id && !hasTemporaryId) {
      navigate(
        ROUTES.V2.EVENTS.DECLARE.buildPath({
          eventId: event.id
        })
      )
    }
  }, [event.id, eventId, navigate])

  return (
    <FormLayout
      route={ROUTES.V2.EVENTS.DECLARE}
      onSaveAndExit={() => {
        events.actions.declare.mutate({
          eventId: event.id,
          data: formValues,
          transactionId: uuid(),
          draft: true
        })

        goToHome()
      }}
    >
      {modal}
      <PagesComponent
        eventId={eventId}
        form={formValues}
        formPages={formPages}
        pageId={currentPageId}
        setFormData={(data) => setFormValues(eventId, data)}
        showReviewButton={searchParams.from === 'review'}
        onFormPageChange={(nextPageId: string) =>
          navigate(
            ROUTES.V2.EVENTS.DECLARE.PAGES.buildPath({
              eventId,
              pageId: nextPageId
            })
          )
        }
        onSubmit={() =>
          navigate(ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({ eventId }))
        }
      />
    </FormLayout>
  )
}
