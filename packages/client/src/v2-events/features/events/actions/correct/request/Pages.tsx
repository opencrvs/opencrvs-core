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
import {
  ActionType,
  getDeclarationPages,
  isNonInteractiveFieldType,
  PageConfig
} from '@opencrvs/commons/client'
import { getCurrentEventState } from '@opencrvs/commons/client'
import { useEvents } from '@client/v2-events//features/events/useEvents/useEvents'
import { Pages as PagesComponent } from '@client/v2-events/features/events/components/Pages'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { FormLayout } from '@client/v2-events/layouts'
import { ROUTES } from '@client/v2-events/routes'

// Filter out pages where all fields either have 'uncorrectable' set to true or are non-interactive
function getCorrectablePages(formPages: PageConfig[]) {
  return formPages.filter(
    (page) =>
      !page.fields.every(
        (field) => field.uncorrectable || isNonInteractiveFieldType(field)
      )
  )
}

export function Pages() {
  const { eventId, pageId } = useTypedParams(ROUTES.V2.EVENTS.REGISTER.PAGES)
  const [searchParams] = useTypedSearchParams(ROUTES.V2.EVENTS.REGISTER.PAGES)
  const setFormValues = useEventFormData((state) => state.setFormValues)
  const form = useEventFormData((state) => state.getFormValues())
  const navigate = useNavigate()
  const events = useEvents()
  const { modal } = useEventFormNavigation()

  const event = events.getEvent.getFromCache(eventId)

  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )

  const formPages = getDeclarationPages(configuration)
  const correctablePages = getCorrectablePages(formPages)

  const currentPageId =
    correctablePages.find((p) => p.id === pageId)?.id || correctablePages[0]?.id

  if (!currentPageId) {
    throw new Error('Form does not have any pages')
  }

  useEffect(() => {
    if (pageId !== currentPageId) {
      navigate(
        ROUTES.V2.EVENTS.REQUEST_CORRECTION.PAGES.buildPath(
          {
            eventId,
            pageId: currentPageId
          },
          searchParams
        ),
        { replace: true }
      )
    }
  }, [pageId, currentPageId, navigate, eventId, searchParams])

  return (
    <FormLayout route={ROUTES.V2.EVENTS.REQUEST_CORRECTION}>
      {modal}
      <PagesComponent
        actionType={ActionType.REQUEST_CORRECTION}
        eventConfig={configuration}
        form={form}
        formPages={correctablePages}
        isCorrection={true}
        pageId={currentPageId}
        setFormData={(data) => setFormValues(data)}
        showReviewButton={searchParams.from === 'review'}
        onPageChange={(nextPageId: string) =>
          navigate(
            ROUTES.V2.EVENTS.REQUEST_CORRECTION.PAGES.buildPath(
              {
                eventId,
                pageId: nextPageId
              },
              searchParams
            )
          )
        }
        onSubmit={() =>
          navigate(
            ROUTES.V2.EVENTS.REQUEST_CORRECTION.REVIEW.buildPath(
              { eventId },
              { workqueue: searchParams.workqueue }
            )
          )
        }
      />
    </FormLayout>
  )
}
