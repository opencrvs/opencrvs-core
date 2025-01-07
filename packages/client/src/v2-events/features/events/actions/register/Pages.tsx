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
import { current } from '@reduxjs/toolkit'
import { ActionType } from '@opencrvs/commons/client'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { useEvents } from '@client/v2-events//features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import { Pages as PagesComponent } from '@client/v2-events/features/events/components/Pages'

export function Pages() {
  const { eventId, pageId } = useTypedParams(ROUTES.V2.EVENTS.REGISTER.PAGES)
  const [searchParams] = useTypedSearchParams(ROUTES.V2.EVENTS.REGISTER.PAGES)
  const navigate = useNavigate()
  const events = useEvents()
  const { modal } = useEventFormNavigation()

  const [event] = events.getEvent.useSuspenseQuery(eventId)

  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )
  const formPages = configuration.actions
    .find((action) => action.type === ActionType.REGISTER)
    ?.forms.find((form) => form.active)?.pages

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
        ROUTES.V2.EVENTS.REGISTER.PAGES.buildPath({
          eventId,
          pageId: currentPageId
        }),
        { replace: true }
      )
    }
  }, [pageId, currentPageId, navigate, eventId])

  return (
    <>
      {modal}
      <PagesComponent
        eventId={eventId}
        formPages={formPages}
        pageId={currentPageId}
        showReviewButton={searchParams.from === 'review'}
        onFormPageChange={(nextPageId: string) =>
          navigate(
            ROUTES.V2.EVENTS.REGISTER.PAGES.buildPath({
              eventId,
              pageId: nextPageId
            })
          )
        }
        onSubmit={() =>
          navigate(ROUTES.V2.EVENTS.REGISTER.REVIEW.buildPath({ eventId }))
        }
      />
    </>
  )
}
