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
  getCurrentEventState,
  getPrintCertificatePages
} from '@opencrvs/commons/client'
import { Print } from '@opencrvs/components/lib/icons'
import { Pages as PagesComponent } from '@client/v2-events/features/events/components/Pages'
import { useActionAnnotation } from '@client/v2-events/features/events/useActionAnnotation'
import {
  CERT_TEMPLATE_ID,
  useCertificateTemplateSelectorFieldConfig
} from '@client/v2-events/features/events/useCertificateTemplateSelectorFieldConfig'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { FormLayout } from '@client/v2-events/layouts'
import { ROUTES } from '@client/v2-events/routes'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'

export function Pages() {
  const { eventId, pageId } = useTypedParams(
    ROUTES.V2.EVENTS.PRINT_CERTIFICATE.PAGES
  )
  const [searchParams] = useTypedSearchParams(
    ROUTES.V2.EVENTS.PRINT_CERTIFICATE.PAGES
  )
  const navigate = useNavigate()
  const { modal } = useEventFormNavigation()
  const { setAnnotation, getAnnotation } = useActionAnnotation()
  const annotation = getAnnotation()
  const events = useEvents()
  const event = events.getEvent.getFromCache(eventId)
  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )
  const validatorContext = useValidatorContext()
  const eventIndex = getCurrentEventState(event, configuration)
  const certTemplateFieldConfig = useCertificateTemplateSelectorFieldConfig(
    event.type,
    eventIndex.declaration,
    event
  )

  const formPages = getPrintCertificatePages(configuration)

  const currentPageId =
    formPages.find((p) => p.id === pageId)?.id || formPages[0]?.id

  if (!currentPageId) {
    throw new Error('Form does not have any pages')
  }

  useEffect(() => {
    if (pageId !== currentPageId) {
      navigate(
        ROUTES.V2.EVENTS.PRINT_CERTIFICATE.PAGES.buildPath(
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
    <FormLayout
      appbarIcon={<Print />}
      route={ROUTES.V2.EVENTS.PRINT_CERTIFICATE}
    >
      {modal}
      <PagesComponent
        declaration={eventIndex.declaration}
        eventConfig={configuration}
        form={annotation}
        formPages={formPages.map((page) => {
          if (formPages[0].id === page.id) {
            page = {
              ...page,
              fields: [
                // hard coded certificate template selector form field
                certTemplateFieldConfig,
                ...page.fields
              ]
            }
          }
          return page
        })}
        pageId={currentPageId}
        setFormData={(data) => setAnnotation(data)}
        showReviewButton={false}
        validateBeforeNextPage={true}
        validatorContext={validatorContext}
        onPageChange={(nextPageId: string) => {
          return navigate(
            ROUTES.V2.EVENTS.PRINT_CERTIFICATE.PAGES.buildPath(
              {
                eventId,
                pageId: nextPageId
              },
              { workqueue: searchParams.workqueue }
            )
          )
        }}
        onSubmit={() => {
          navigate(
            ROUTES.V2.EVENTS.PRINT_CERTIFICATE.REVIEW.buildPath(
              { eventId },
              {
                templateId: String(annotation[CERT_TEMPLATE_ID]),
                workqueue: searchParams.workqueue
              }
            )
          )
        }}
      />
    </FormLayout>
  )
}
