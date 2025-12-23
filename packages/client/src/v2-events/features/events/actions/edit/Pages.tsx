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
import { ActionType, getDeclarationPages } from '@opencrvs/commons/client'
import { Pages as PagesComponent } from '@client/v2-events/features/events/components/Pages'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { FormLayout } from '@client/v2-events/layouts'
import { ROUTES } from '@client/v2-events/routes'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { EditPageBanner } from './EditPageBanner'

export function Pages() {
  const { eventId, pageId } = useTypedParams(ROUTES.V2.EVENTS.EDIT.PAGES)
  const [searchParams] = useTypedSearchParams(ROUTES.V2.EVENTS.EDIT.PAGES)
  const events = useEvents()
  const navigate = useNavigate()
  const { modal, closeActionView } = useEventFormNavigation()
  const { getFormValues, setFormValues } = useEventFormData()
  const formValues = getFormValues()
  const validatorContext = useValidatorContext()
  const event = events.getEvent.getFromCache(eventId)

  const validatorContext = useValidatorContext(event)
  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )
  const declarationPages = getDeclarationPages(configuration)

  const currentPageId =
    declarationPages.find((p) => p.id === pageId)?.id || declarationPages[0]?.id

  if (!currentPageId) {
    throw new Error('Form does not have any pages')
  }

  useEffect(() => {
    if (pageId !== currentPageId) {
      navigate(
        ROUTES.V2.EVENTS.EDIT.PAGES.buildPath(
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
    <>
      <EditPageBanner />
      <FormLayout route={ROUTES.V2.EVENTS.EDIT}>
        {modal}
        <PagesComponent
          actionType={ActionType.EDIT}
          eventConfig={configuration}
          form={formValues}
          formPages={declarationPages}
          pageId={currentPageId}
          setFormData={(data) => setFormValues(data)}
          showReviewButton={searchParams.from === 'review'}
          validatorContext={validatorContext}
          onPageChange={(nextPageId: string) =>
            navigate(
              ROUTES.V2.EVENTS.EDIT.PAGES.buildPath(
                { eventId, pageId: nextPageId },
                searchParams
              )
            )
          }
          onSubmit={() =>
            navigate(
              ROUTES.V2.EVENTS.EDIT.REVIEW.buildPath(
                { eventId },
                { workqueue: searchParams.workqueue }
              )
            )
          }
        />
      </FormLayout>
    </>
  )
}
