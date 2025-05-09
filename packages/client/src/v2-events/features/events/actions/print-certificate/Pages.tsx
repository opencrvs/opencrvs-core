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
import { ActionType, EventConfig, getOrThrow } from '@opencrvs/commons/client'
import { Print } from '@opencrvs/components/lib/icons'
import { Pages as PagesComponent } from '@client/v2-events/features/events/components/Pages'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { ROUTES } from '@client/v2-events/routes'
import { FormLayout } from '@client/v2-events/layouts'
import { useActionAnnotation } from '@client/v2-events/features/events/useActionAnnotation'
import {
  CERT_TEMPLATE_ID,
  useCertificateTemplateSelectorFieldConfig
} from '@client/v2-events/features/events/useCertificateTemplateSelectorFieldConfig'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'

function getPrintCertificatePages(configuration: EventConfig) {
  const action = configuration.actions.find(
    (a) => a.type === ActionType.PRINT_CERTIFICATE
  )

  return getOrThrow(
    action?.printForm.pages,
    `${ActionType.PRINT_CERTIFICATE} action does not have print form set.`
  )
}

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
  const event = events.getEventState.useSuspenseQuery(eventId)
  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )
  const certTemplateFieldConfig = useCertificateTemplateSelectorFieldConfig(
    event.type
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
        ROUTES.V2.EVENTS.PRINT_CERTIFICATE.PAGES.buildPath({
          eventId,
          pageId: currentPageId
        }),
        { replace: true }
      )
    }
  }, [pageId, currentPageId, navigate, eventId])

  return (
    <FormLayout
      appbarIcon={<Print />}
      route={ROUTES.V2.EVENTS.PRINT_CERTIFICATE}
    >
      {modal}
      <PagesComponent
        declaration={event.declaration}
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
        showReviewButton={searchParams.from === 'review'}
        validateBeforeNextPage={true}
        onPageChange={(nextPageId: string) => {
          return navigate(
            ROUTES.V2.EVENTS.PRINT_CERTIFICATE.PAGES.buildPath({
              eventId,
              pageId: nextPageId
            })
          )
        }}
        onSubmit={() => {
          navigate(
            ROUTES.V2.EVENTS.PRINT_CERTIFICATE.REVIEW.buildPath(
              { eventId },
              { templateId: String(annotation[CERT_TEMPLATE_ID]) }
            )
          )
        }}
      />
    </FormLayout>
  )
}
