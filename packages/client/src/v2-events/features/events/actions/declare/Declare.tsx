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
import { useIntl } from 'react-intl'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { FormWizard, Frame, Spinner } from '@opencrvs/components'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { usePagination } from '@client/v2-events/hooks/usePagination'

import { useEventConfiguration } from '@client/v2-events//features/events/useEventConfiguration'
import { useEventFormData } from '@client/v2-events//features/events/useEventFormData'
import { useEventFormNavigation } from '@client/v2-events//features/events/useEventFormNavigation'
import { useEvents } from '@client/v2-events//features/events/useEvents/useEvents'
import { FormHeader } from '@client/v2-events/features/events/components/FormHeader'
import { ROUTES } from '@client/v2-events/routes'
export function DeclareIndex() {
  return (
    <React.Suspense fallback={<Spinner id="event-form-spinner" />}>
      <Declare />
    </React.Suspense>
  )
}

function Declare() {
  const { eventId, pageId } = useParams<{
    eventId: string
    pageId?: string
  }>()

  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const fromPage = searchParams.get('from') || 'unknown'
  const navigate = useNavigate()
  const events = useEvents()

  if (!eventId) {
    throw new Error('Event ID is required')
  }

  // @TODO: Fix types
  const [event] = events.getEvent(eventId)

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!event) {
    throw new Error('Event not found')
  }
  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )

  if (!configuration) {
    throw new Error('Event configuration not found with type: ' + event.type)
  }
  const getFormValues = useEventFormData((state) => state.getFormValues)
  const formValues = getFormValues(eventId)
  const setFormValues = useEventFormData((state) => state.setFormValues)

  useEffect(() => {
    const hasTemporaryId = event.id === event.transactionId

    if (eventId !== event.id && !hasTemporaryId) {
      navigate(
        ROUTES.V2.EVENTS.DECLARE.buildPath({
          eventId: event.id
        })
      )
    }
  }, [event.id, event.transactionId, eventId, navigate])

  const pages = configuration.actions[0].forms[0].pages
  const {
    page: currentPage,
    next,
    previous,
    total
  } = usePagination(
    pages.length,
    pageId ? pages.findIndex((p) => p.id === pageId) : 0
  )

  useEffect(() => {
    if (!pageId) {
      navigate(
        ROUTES.V2.EVENTS.DECLARE.PAGE.buildPath({
          eventId: event.id,
          pageId: pages[0].id
        })
      )
    }

    const reviewPage = !pages.find((p) => p.id === pageId)
    if (reviewPage) {
      return
    }

    const pageChanged = pages[currentPage].id !== pageId
    if (pageChanged) {
      navigate(
        ROUTES.V2.EVENTS.DECLARE.PAGE.buildPath({
          eventId: event.id,
          pageId: pages[currentPage].id
        })
      )
    }
  }, [event.id, navigate, pageId, pages, currentPage])

  const intl = useIntl()

  const { modal, goToReview } = useEventFormNavigation()

  const page = pages[currentPage]

  return (
    <Frame
      header={<FormHeader label={configuration.label} />}
      skipToContentText="Skip to form"
    >
      {modal}
      <FormWizard
        currentPage={currentPage}
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        pageTitle={page && intl.formatMessage(page.title)}
        showReviewButton={fromPage === 'review'}
        totalPages={total}
        onNextPage={next}
        onPreviousPage={previous}
        onSubmit={() => {
          goToReview(event.id)
        }}
      >
        <FormFieldGenerator
          fields={page.fields}
          formData={formValues}
          id="locationForm"
          initialValues={formValues}
          setAllFieldsDirty={false}
          onChange={(values) => {
            setFormValues(eventId, values)
          }}
        />
      </FormWizard>
    </Frame>
  )
}
