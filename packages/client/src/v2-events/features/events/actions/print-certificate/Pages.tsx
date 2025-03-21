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
  getActiveActionFormPages,
  isFieldVisible
} from '@opencrvs/commons/client'

import { Print } from '@opencrvs/components/lib/icons'
import { Pages as PagesComponent } from '@client/v2-events/features/events/components/Pages'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { ROUTES } from '@client/v2-events/routes'
import { FormLayout } from '@client/v2-events/layouts'
import { useEventMetadata } from '@client/v2-events/features/events/useEventMeta'
import {
  CERT_TEMPLATE_ID,
  useCertificateTemplateSelectorFieldConfig
} from '@client/v2-events/features/events/useCertificateTemplateSelectorFieldConfig'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'

export function Pages() {
  const { eventId, pageId } = useTypedParams(
    ROUTES.V2.EVENTS.PRINT_CERTIFICATE.PAGES
  )
  const [searchParams] = useTypedSearchParams(
    ROUTES.V2.EVENTS.PRINT_CERTIFICATE.PAGES
  )
  const navigate = useNavigate()
  const { modal } = useEventFormNavigation()
  const { setMetadata, getMetadata } = useEventMetadata()
  const metadata = getMetadata()
  const events = useEvents()
  const event = events.getEventState.useSuspenseQuery(eventId)
  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )
  const certTemplateFieldConfig = useCertificateTemplateSelectorFieldConfig(
    event.type
  )

  const formPages = getActiveActionFormPages(
    configuration,
    ActionType.PRINT_CERTIFICATE
  )

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

  // Allow the user to continue from the current page only if they have filled all the visible required fields.
  const currentPage = formPages.find((p) => p.id === currentPageId)
  const currentlyRequiredFields = currentPage?.fields.filter(
    (field) => isFieldVisible(field, metadata) && field.required
  )

  const isAllRequiredFieldsFilled = currentlyRequiredFields?.every((field) =>
    Boolean(metadata[field.id])
  )

  const isTemplateSelected = Boolean(metadata[CERT_TEMPLATE_ID])

  return (
    <FormLayout
      appbarIcon={<Print />}
      route={ROUTES.V2.EVENTS.PRINT_CERTIFICATE}
    >
      {modal}
      <PagesComponent
        disableContinue={!isAllRequiredFieldsFilled || !isTemplateSelected}
        eventConfig={configuration}
        eventDeclarationData={event.data}
        form={metadata}
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
        setFormData={(data) => setMetadata(data)}
        showReviewButton={searchParams.from === 'review'}
        onFormPageChange={(nextPageId: string) =>
          navigate(
            ROUTES.V2.EVENTS.PRINT_CERTIFICATE.PAGES.buildPath({
              eventId,
              pageId: nextPageId
            })
          )
        }
        onSubmit={() => {
          navigate(
            ROUTES.V2.EVENTS.PRINT_CERTIFICATE.REVIEW.buildPath(
              { eventId },
              { templateId: String(metadata[CERT_TEMPLATE_ID]) }
            )
          )
        }}
      />
    </FormLayout>
  )
}
