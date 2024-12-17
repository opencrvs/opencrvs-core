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

import { formatUrl } from '@client/navigation'
import { Debug } from '@client/v2-events/features/debug/debug'
import { V2_DECLARE_ACTION_ROUTE } from '@client/v2-events/routes'
import { Spinner } from '@opencrvs/components'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Button } from '@opencrvs/components/lib/Button'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { ErrorText } from '@opencrvs/components/lib/ErrorText'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Icon } from '@opencrvs/components/lib/Icon'
import { RadioButton } from '@opencrvs/components/lib/Radio'
import { Stack } from '@opencrvs/components/lib/Stack'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { useEventConfigurations } from './useEventConfiguration'
import { useEvents } from './useEvents/useEvents'
import { useEventFormNavigation } from './useEventFormNavigation'
import { useEventFormData } from './useEventFormData'

const messages = defineMessages({
  registerNewEventTitle: {
    id: 'register.selectVitalEvent.registerNewEventTitle',
    defaultMessage: 'New declaration',
    description: 'The title that appears on the select vital event page'
  },
  registerNewEventHeading: {
    id: 'register.selectVitalEvent.registerNewEventHeading',
    defaultMessage: 'What type of event do you want to declare?',
    description: 'The section heading on the page'
  },
  continueButton: {
    defaultMessage: 'Continue',
    description: 'Continue Button Text',
    id: 'buttons.continue'
  },
  errorMessage: {
    id: 'register.selectVitalEvent.errorMessage',
    defaultMessage: 'Please select the type of event',
    description: 'Error Message to show when no event is being selected'
  },
  exitButton: {
    defaultMessage: 'EXIT',
    description: 'Label for Exit button on EventTopBar',
    id: 'buttons.exit'
  }
})

const constantsMessages = defineMessages({
  skipToMainContent: {
    defaultMessage: 'Skip to main content',
    description:
      'Label for a keyboard accessibility link which skips to the main content',
    id: 'constants.skipToMainContent'
  }
})

const EventSelector = () => {
  const intl = useIntl()
  const navigate = useNavigate()
  const [eventType, setEventType] = useState('')
  const [noEventSelectedError, setNoEventSelectedError] = useState(false)
  const eventConfigurations = useEventConfigurations()
  const events = useEvents()
  const clearForm = useEventFormData((state) => state.clear)
  const createEvent = events.createEvent()

  const handleContinue = async () => {
    if (eventType === '') {
      return setNoEventSelectedError(true)
    }
    const transactionId = Math.random().toString()

    createEvent.mutate({
      type: eventType,
      transactionId
    })

    clearForm()

    navigate(
      formatUrl(V2_DECLARE_ACTION_ROUTE, {
        eventId: transactionId
      })
    )
  }

  return (
    <>
      {noEventSelectedError && (
        <ErrorText id="require-error">
          {intl.formatMessage(messages.errorMessage)}
        </ErrorText>
      )}
      <Stack
        id="select_vital_event_view"
        direction="column"
        alignItems="left"
        gap={16}
      >
        {eventConfigurations.map((event) => (
          <RadioButton
            size="large"
            key={`${event.id}event`}
            name={`${event.id}event`}
            label={intl.formatMessage(event.label)}
            value={event.id}
            id="select_birth_event"
            selected={eventType === event.id ? event.id : ''}
            onChange={() => {
              setEventType(event.id)
              setNoEventSelectedError(false)
            }}
          />
        ))}

        <Button
          key="select-vital-event-continue"
          id="continue"
          type="primary"
          size="large"
          fullWidth
          onClick={handleContinue}
        >
          {intl.formatMessage(messages.continueButton)}
        </Button>
      </Stack>
    </>
  )
}

export const EventSelection = () => {
  const intl = useIntl()
  const { goToHome } = useEventFormNavigation()

  return (
    <Frame
      header={
        <AppBar
          desktopLeft={<Icon name="Draft" size="large" />}
          desktopTitle={intl.formatMessage(messages.registerNewEventTitle)}
          desktopRight={
            <Button
              id="goBack"
              type="secondary"
              size="small"
              onClick={goToHome}
            >
              <Icon name="X" />
              {intl.formatMessage(messages.exitButton)}
            </Button>
          }
          mobileLeft={<Icon name="Draft" size="large" />}
          mobileTitle={intl.formatMessage(messages.registerNewEventTitle)}
          mobileRight={
            <Button type="icon" size="medium" onClick={goToHome}>
              <Icon name="X" />
            </Button>
          }
        />
      }
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
    >
      <Content
        size={ContentSize.SMALL}
        title={intl.formatMessage(messages.registerNewEventHeading)}
      >
        <React.Suspense fallback={<Spinner id="event-selector-spinner" />}>
          <EventSelector />
        </React.Suspense>
      </Content>
      <Debug />
    </Frame>
  )
}
