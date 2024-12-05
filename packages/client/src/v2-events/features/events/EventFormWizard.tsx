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
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { usePagination } from '@client/v2-events/hooks/usePagination'
import { EventConfig } from '@opencrvs/commons/client'
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
import { useHistory, useParams } from 'react-router-dom'
import { useEventConfiguration } from './useEventConfiguration'
import { useEventFormNavigation } from './useEventFormNavigation'
import { useEvents } from './useEvents'
import { formatUrl } from '@client/navigation'
import { V2_CREATE_EVENT_ROUTE } from '@client/v2-events/routes'

export function EventFormWizardIndex() {
  const { eventId } = useParams<{ eventId: string }>()
  const events = useEvents()

  const event = events.getEvent(eventId)
  if (!event) {
    throw new Error('Event not found')
  }
  const { eventConfiguration } = useEventConfiguration(event.type)
  if (!eventConfiguration) {
    throw new Error('Event configuration not found with type: ' + event.type)
  }
  const history = useHistory()
  useEffect(() => {
    if (eventId !== event.id && event.id !== '__EMPTY__') {
      history.push(
        formatUrl(V2_CREATE_EVENT_ROUTE, {
          eventId: event.id
        })
      )
    }
  }, [event.id, eventId, history])

  return (
    <React.Suspense fallback={<Spinner id="event-form-spinner" />}>
      <EventFormWizard event={eventConfiguration} />
    </React.Suspense>
  )
}

export const STATUSTOCOLOR: { [key: string]: string } = {
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

function EventFormWizard({ event }: { event: EventConfig }) {
  const intl = useIntl()
  const [formValues, setFormValues] = React.useState<any>({})
  const { modal, exit } = useEventFormNavigation()

  const pages = event.actions[0].forms[0].pages
  const {
    page: currentPage,
    next,
    previous,
    total
  } = usePagination(pages.length)

  const TODO = () => {}
  const IS_TODO = Math.random() > 0.5
  const page = pages[currentPage]
  const fields = page.fields.map(
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
      header={
        <AppBar
          desktopLeft={<DeclarationIcon color={getDeclarationIconColor()} />}
          desktopTitle={intl.formatMessage(messages.newVitalEventRegistration, {
            event: intl.formatMessage(event.label)
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
            event: intl.formatMessage(event.label)
          })}
          mobileRight={
            <>
              {
                <Button
                  type="icon"
                  size="small"
                  disabled={!IS_TODO}
                  onClick={TODO}
                >
                  <Icon name="DownloadSimple" />
                </Button>
              }
              <Button type="icon" size="small" onClick={exit}>
                <Icon name="X" />
              </Button>
            </>
          }
        />
      }
    >
      {modal}
      <FormWizard
        currentPage={currentPage}
        totalPages={total}
        onSubmit={() => console.log(formValues)}
        pageTitle={intl.formatMessage(page.title)}
        onNextPage={next}
        onPreviousPage={previous}
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
