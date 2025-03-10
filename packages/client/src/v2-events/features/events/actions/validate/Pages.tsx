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
import { ActionType, findActiveActionFormPages } from '@opencrvs/commons/client'
import { useEvents } from '@client/v2-events//features/events/useEvents/useEvents'
import { Pages as PagesComponent } from '@client/v2-events/features/events/components/Pages'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { ROUTES } from '@client/v2-events/routes'
import {
  useEventFormData,
  useSubscribeEventFormData
} from '@client/v2-events/features/events/useEventFormData'
import { FormLayout } from '@client/v2-events/layouts'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'

export function Pages() {
  const { eventId, pageId } = useTypedParams(ROUTES.V2.EVENTS.VALIDATE.PAGES)
  const [searchParams] = useTypedSearchParams(ROUTES.V2.EVENTS.VALIDATE.PAGES)
  const setFormValues = useEventFormData((state) => state.setFormValues)
  const { formValues: form } = useSubscribeEventFormData()

  const navigate = useNavigate()
  const events = useEvents()
  const drafts = useDrafts()
  const { modal, goToHome } = useEventFormNavigation()

  const [event] = events.getEvent.useSuspenseQuery(eventId)

  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )

  const formPages = findActiveActionFormPages(
    configuration,
    ActionType.VALIDATE
  )

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
        ROUTES.V2.EVENTS.VALIDATE.PAGES.buildPath({
          eventId,
          pageId: currentPageId
        }),
        { replace: true }
      )
    }
  }, [pageId, currentPageId, navigate, eventId])

  return (
    <FormLayout
      route={ROUTES.V2.EVENTS.VALIDATE}
      onSaveAndExit={() => {
        drafts.submitLocalDraft()
        goToHome()
      }}
    >
      {modal}
      <PagesComponent
        form={form}
        formPages={formPages}
        pageId={currentPageId}
        setFormData={(data) => setFormValues(data)}
        showReviewButton={searchParams.from === 'review'}
        onFormPageChange={(nextPageId: string) =>
          navigate(
            ROUTES.V2.EVENTS.VALIDATE.PAGES.buildPath({
              eventId,
              pageId: nextPageId
            })
          )
        }
        onSubmit={() =>
          navigate(ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({ eventId }))
        }
      />
    </FormLayout>
  )
}
