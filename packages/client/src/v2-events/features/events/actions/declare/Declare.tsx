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

import { IFormField } from '@client/forms'
import { formatUrl } from '@client/navigation'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { usePagination } from '@client/v2-events/hooks/usePagination'

import {
  AppBar,
  Button,
  FormWizard,
  Frame,
  Icon,
  Spinner
} from '@opencrvs/components'
import { DeclarationIcon } from '@opencrvs/components/lib/icons'
import React, { useEffect } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEventConfiguration } from '@client/v2-events//features/events/useEventConfiguration'
import { useEventFormNavigation } from '@client/v2-events//features/events/useEventFormNavigation'
import { useEvents } from '@client/v2-events//features/events/useEvents/useEvents'
import type { TranslationConfig } from '@opencrvs/commons/events'
import { useEventFormData } from '@client/v2-events//features/events/useEventFormData'
import { ROUTES } from '@client/v2-events/routes'

export function DeclareIndex() {
  return (
    <React.Suspense fallback={<Spinner id="event-form-spinner" />}>
      <Declare />
    </React.Suspense>
  )
}

const STATUSTOCOLOR: { [key: string]: string } = {
  ARCHIVED: 'grey',
  DRAFT: 'purple',
  IN_PROGRESS: 'purple',
  DECLARED: 'orange',
  REJECTED: 'red',
  VALIDATED: 'grey',
  REGISTERED: 'green',
  CERTIFIED: 'teal',
  CORRECTION_REQUESTED: 'blue',
  WAITING_VALIDATION: 'teal',
  SUBMITTED: 'orange',
  SUBMITTING: 'orange',
  ISSUED: 'blue'
}

function getDeclarationIconColor(): string {
  return Math.random() > 0.5
    ? 'purple'
    : Math.random() > 0.5
    ? STATUSTOCOLOR.DRAFT
    : 'orange'
}

const messages = defineMessages({
  saveExitButton: {
    id: 'buttons.saveExit',
    defaultMessage: 'Save & Exit',
    description: 'The label for the save and exit button'
  },
  exitButton: {
    id: 'buttons.exit',
    defaultMessage: 'Exit',
    description: 'The label for the exit button'
  },
  newVitalEventRegistration: {
    id: 'event.newVitalEventRegistration',
    defaultMessage: 'New "{event}" registration',
    description: 'The title for the new vital event registration page'
  }
})

export const FormHeader = ({ label }: { label: TranslationConfig }) => {
  const intl = useIntl()
  const { exit } = useEventFormNavigation()

  const TODO = () => {}
  const IS_TODO = Math.random() > 0.5
  return (
    <AppBar
      desktopLeft={<DeclarationIcon color={getDeclarationIconColor()} />}
      desktopTitle={intl.formatMessage(messages.newVitalEventRegistration, {
        event: intl.formatMessage(label)
      })}
      desktopRight={
        <>
          {
            <Button
              id="save-exit-btn"
              type="primary"
              size="small"
              disabled={!IS_TODO}
              onClick={TODO}
            >
              <Icon name="DownloadSimple" />
              {intl.formatMessage(messages.saveExitButton)}
            </Button>
          }

          <Button type="secondary" size="small" onClick={exit}>
            <Icon name="X" />
            {intl.formatMessage(messages.exitButton)}
          </Button>
        </>
      }
      mobileLeft={<DeclarationIcon color={getDeclarationIconColor()} />}
      mobileTitle={intl.formatMessage(messages.newVitalEventRegistration, {
        event: intl.formatMessage(label)
      })}
      mobileRight={
        <>
          {
            <Button type="icon" size="small" disabled={!IS_TODO} onClick={TODO}>
              <Icon name="DownloadSimple" />
            </Button>
          }
          <Button type="icon" size="small" onClick={exit}>
            <Icon name="X" />
          </Button>
        </>
      }
    />
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

  const [event] = events.getEvent(eventId)

  if (!event) {
    throw new Error('Event not found')
  }
  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )

  if (!configuration) {
    throw new Error('Event configuration not found with type: ' + event.type)
  }
  const formValues = useEventFormData((state) => state.formValues)
  const setFormValues = useEventFormData((state) => state.setFormValues)

  useEffect(() => {
    const hasTemporaryId = event.id === event.transactionId

    if (eventId !== event.id && !hasTemporaryId) {
      navigate(
        ROUTES.V2.EVENTS.DECLARE.EVENT.buildPath({
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
        ROUTES.V2.EVENTS.DECLARE.EVENT.PAGE.buildPath({
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
        ROUTES.V2.EVENTS.DECLARE.EVENT.PAGE.buildPath({
          eventId: event.id,
          pageId: pages[currentPage].id
        })
      )
    }
  }, [event.id, navigate, pageId, pages, currentPage])

  const intl = useIntl()

  const { modal, goToReview } = useEventFormNavigation()

  const page = pages[currentPage]

  const fields = !page
    ? []
    : page.fields.map(
        (field) =>
          ({
            name: field.id,
            type: field.type,
            required: true,
            validator: [],
            label: field.label,
            initialValue: ''
          } as IFormField)
      )

  return (
    <Frame
      skipToContentText="Skip to form"
      header={<FormHeader label={configuration.label} />}
    >
      {modal}
      <FormWizard
        currentPage={currentPage}
        totalPages={total}
        onSubmit={() => {
          goToReview(event.id)
        }}
        pageTitle={page && intl.formatMessage(page.title)}
        onNextPage={next}
        onPreviousPage={previous}
        showReviewButton={fromPage === 'review'}
      >
        <FormFieldGenerator
          id="locationForm"
          setAllFieldsDirty={false}
          onChange={(values) => {
            setFormValues(values)
          }}
          formData={formValues}
          fields={fields}
        />
      </FormWizard>
    </Frame>
  )
}
