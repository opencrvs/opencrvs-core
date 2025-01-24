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
import { merge } from 'lodash'
import {
  useTypedParams,
  useTypedSearchParams
} from 'react-router-typesafe-routes/dom'
import { ActionType, getCurrentEventState } from '@opencrvs/commons/client'
import { useEvents } from '@client/v2-events//features/events/useEvents/useEvents'
import { Pages as PagesComponent } from '@client/v2-events/features/events/components/Pages'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { ROUTES } from '@client/v2-events/routes'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { FormLayout } from '@client/v2-events/layouts/form'

export function Pages() {
  const { eventId, pageId } = useTypedParams(
    ROUTES.V2.EVENTS.COLLECT_CERTIFICATE.PAGES
  )
  const [searchParams] = useTypedSearchParams(
    ROUTES.V2.EVENTS.COLLECT_CERTIFICATE.PAGES
  )
  const setFormValues = useEventFormData((state) => state.setFormValues)
  const formEventId = useEventFormData((state) => state.eventId)
  const form = useEventFormData((state) => state.formValues)
  const navigate = useNavigate()
  const events = useEvents()
  const { modal, goToHome } = useEventFormNavigation()

  const [event] = events.getEvent.useSuspenseQuery(eventId)
  const currentState = getCurrentEventState(event)

  useEffect(() => {
    if (formEventId !== event.id) {
      setFormValues(event.id, currentState.data)
    }
  }, [currentState.data, event.id, formEventId, setFormValues])

  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )
  const formPages = configuration.actions
    .find((action) => action.type === ActionType.COLLECT_CERTIFICATE)
    ?.forms.find((form) => form.active)?.pages

  const verifyId = configuration.actions.find(
    (action) => action.type === ActionType.COLLECT_CERTIFICATE
  )?.verifyId

  const payment = configuration.actions.find(
    (action) => action.type === ActionType.COLLECT_CERTIFICATE
  )?.payment

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
        ROUTES.V2.EVENTS.COLLECT_CERTIFICATE.PAGES.buildPath({
          eventId,
          pageId: currentPageId
        }),
        { replace: true }
      )
    }
  }, [pageId, currentPageId, navigate, eventId])

  return (
    <FormLayout
      action={ActionType.COLLECT_CERTIFICATE}
      route={ROUTES.V2.EVENTS.COLLECT_CERTIFICATE}
    >
      {modal}
      <PagesComponent
        form={form}
        eventId={eventId}
        formPages={formPages}
        pageId={currentPageId}
        showReviewButton={searchParams.from === 'review'}
        onFormPageChange={(nextPageId: string) =>
          navigate(
            ROUTES.V2.EVENTS.COLLECT_CERTIFICATE.PAGES.buildPath({
              eventId,
              pageId: nextPageId
            })
          )
        }
        onSubmit={() => {
          if (verifyId && verifyId.length > 0) {
            navigate(
              ROUTES.V2.EVENTS.COLLECT_CERTIFICATE.VERIFY.buildPath({ eventId })
            )
          } else if (payment) {
            if (verifyId && verifyId.length > 0) {
              navigate(
                ROUTES.V2.EVENTS.COLLECT_CERTIFICATE.VERIFY.buildPath({
                  eventId
                })
              )
            }
          } else {
            navigate(
              ROUTES.V2.EVENTS.COLLECT_CERTIFICATE.REVIEW.buildPath({ eventId })
            )
          }
        }}
      />
    </FormLayout>
  )
}
