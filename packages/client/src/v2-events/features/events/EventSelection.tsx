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

import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { useTypedSearchParams } from 'react-router-typesafe-routes/dom'
import { useSelector } from 'react-redux'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Button } from '@opencrvs/components/lib/Button'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { Dialog } from '@opencrvs/components/lib/Dialog'
import { ErrorText } from '@opencrvs/components/lib/ErrorText'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Icon } from '@opencrvs/components/lib/Icon'
import { RadioGroup, RadioSize } from '@opencrvs/components/lib/Radio'
import { Stack } from '@opencrvs/components/lib/Stack'
import {
  ActionType,
  canUserCreateEvent,
  canUserDeclareEvent,
  canUserNotifyEvent,
  EventConfig,
  hasIndependentNotifyForm
} from '@opencrvs/commons/client'
import { SuspenseLoadingFallback } from '@client/v2-events/components/SuspenseLoadingFallback'
import { ROUTES } from '@client/v2-events/routes'
import { createTemporaryId } from '@client/v2-events/utils'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { useModal } from '@client/v2-events/hooks/useModal'
import { actionLabels } from '@client/v2-events/features/workqueues/Actions/utils'
import { useEventConfigurations } from './useEventConfiguration'
import { useEventFormData } from './useEventFormData'
import { useEventFormNavigation } from './useEventFormNavigation'
import { useEvents } from './useEvents/useEvents'
import { useActionAnnotation } from './useActionAnnotation'

const messages = defineMessages({
  registerNewEventTitle: {
    id: 'register.selectVitalEvent.registerNewEventTitle',
    defaultMessage: 'New declaration',
    description: 'The title that appears on the select vital event page'
  },
  registerNewEventHeading: {
    id: 'register.selectVitalEvent.registerNewEventHeader',
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
  },
  chooseActionTitle: {
    defaultMessage: 'How would you like to proceed?',
    description: 'Title of the modal asking whether to notify or declare',
    id: 'register.selectVitalEvent.chooseAction.title'
  },
  chooseActionBody: {
    defaultMessage:
      'You can notify the {event} now with limited details, or go straight to a full declaration.',
    description: 'Body text of the modal asking whether to notify or declare',
    id: 'register.selectVitalEvent.chooseAction.body'
  },
  cancel: {
    defaultMessage: 'Cancel',
    description: 'Label for cancel button of the notify-or-declare modal',
    id: 'register.selectVitalEvent.chooseAction.cancel'
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

type NotifyOrDeclareChoice = typeof ActionType.NOTIFY | typeof ActionType.DECLARE

/**
 * Shown when a user has both DECLARE and NOTIFY permission for an event that
 * gives NOTIFY its own independent form: since the two forms can differ,
 * the user must pick which one they intend to fill in before seeing it.
 */
function NotifyOrDeclareModal({
  eventConfig,
  close
}: {
  eventConfig: EventConfig
  close: (result: NotifyOrDeclareChoice | null) => void
}) {
  const intl = useIntl()

  return (
    <Dialog
      isOpen
      actions={[
        <Button
          key="cancel"
          type="tertiary"
          onClick={() => close(null)}
        >
          {intl.formatMessage(messages.cancel)}
        </Button>,
        <Button
          key="notify"
          type="secondary"
          onClick={() => close(ActionType.NOTIFY)}
        >
          {intl.formatMessage(actionLabels[ActionType.NOTIFY])}
        </Button>,
        <Button
          key="declare"
          type="primary"
          onClick={() => close(ActionType.DECLARE)}
        >
          {intl.formatMessage(actionLabels[ActionType.DECLARE])}
        </Button>
      ]}
      title={intl.formatMessage(messages.chooseActionTitle)}
      onClose={() => close(null)}
    >
      {intl.formatMessage(messages.chooseActionBody, {
        event: intl.formatMessage(eventConfig.label)
      })}
    </Dialog>
  )
}

function EventSelector() {
  const intl = useIntl()
  const navigate = useNavigate()
  const [eventType, setEventType] = useState('')
  const [noEventSelectedError, setNoEventSelectedError] = useState(false)
  const eventConfigurations = useEventConfigurations()
  const events = useEvents()
  const scopes = useSelector(getScope) ?? []
  const clearForm = useEventFormData((state) => state.clear)
  const clearAnnotation = useActionAnnotation((state) => state.clear)
  const createEvent = events.createEvent()
  const user = useSelector(getUserDetails)
  const [modal, openModal] = useModal()

  const allowedEventConfigurations = eventConfigurations.filter(({ id }) =>
    canUserCreateEvent(scopes, id)
  )

  async function handleContinue() {
    if (eventType === '') {
      return setNoEventSelectedError(true)
    }
    const eventConfig = allowedEventConfigurations.find(
      ({ id }) => id === eventType
    )

    if (!eventConfig) {
      throw new Error(`Configuration for event '${eventType}' not found`)
    }

    // When NOTIFY has its own independent form, it's a separate flow from
    // DECLARE, with a potentially different form. A user permitted to do
    // either must choose their intent upfront; a user permitted to do only
    // one of them is sent straight into that flow, as before.
    let targetRoute: typeof ROUTES.V2.EVENTS.DECLARE | typeof ROUTES.V2.EVENTS.NOTIFY =
      ROUTES.V2.EVENTS.DECLARE
    if (hasIndependentNotifyForm(eventConfig)) {
      const canDeclare = canUserDeclareEvent(scopes, eventType)
      const canNotify = canUserNotifyEvent(scopes, eventType)

      if (canDeclare && canNotify) {
        const choice = await openModal<NotifyOrDeclareChoice | null>(
          (close) => <NotifyOrDeclareModal close={close} eventConfig={eventConfig} />
        )

        if (!choice) {
          return
        }

        targetRoute =
          choice === ActionType.NOTIFY
            ? ROUTES.V2.EVENTS.NOTIFY
            : ROUTES.V2.EVENTS.DECLARE
      } else if (canNotify && !canDeclare) {
        targetRoute = ROUTES.V2.EVENTS.NOTIFY
      }
    }

    const transactionId = createTemporaryId()
    createEvent.mutate({
      type: eventType,
      transactionId,
      createdAtLocation: user?.primaryOfficeId
    })

    clearForm()
    clearAnnotation()

    navigate(targetRoute.buildPath({ eventId: transactionId }))
  }

  return (
    <>
      {noEventSelectedError && (
        <ErrorText id="require-error">
          {intl.formatMessage(messages.errorMessage)}
        </ErrorText>
      )}
      <Stack alignItems="left" direction="column" gap={16}>
        <RadioGroup
          name="eventType"
          options={allowedEventConfigurations.map((event) => ({
            value: event.id,
            label: intl.formatMessage(event.label)
          }))}
          size={RadioSize.LARGE}
          value={eventType}
          onChange={(val) => {
            setEventType(val)
            setNoEventSelectedError(false)
          }}
        />

        <Button
          key="select-vital-event-continue"
          fullWidth
          id="continue"
          size="large"
          type="primary"
          onClick={handleContinue}
        >
          {intl.formatMessage(messages.continueButton)}
        </Button>
      </Stack>
      {modal}
    </>
  )
}

export function EventSelection() {
  const intl = useIntl()
  const { closeActionView } = useEventFormNavigation()
  const [{ backTo }] = useTypedSearchParams(ROUTES.V2.EVENTS.CREATE)

  return (
    <Frame
      header={
        <AppBar
          desktopLeft={<Icon name="Draft" size="large" />}
          desktopRight={
            <Button
              id="goBack"
              size="small"
              type="secondary"
              onClick={() => closeActionView(backTo)}
            >
              <Icon name="X" />
              {intl.formatMessage(messages.exitButton)}
            </Button>
          }
          desktopTitle={intl.formatMessage(messages.registerNewEventTitle)}
          mobileLeft={<Icon name="Draft" size="large" />}
          mobileRight={
            <Button
              size="medium"
              type="icon"
              onClick={() => closeActionView(backTo)}
            >
              <Icon name="X" />
            </Button>
          }
          mobileTitle={intl.formatMessage(messages.registerNewEventTitle)}
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
        <React.Suspense
          fallback={<SuspenseLoadingFallback id="event-selector-spinner" />}
        >
          <EventSelector />
        </React.Suspense>
      </Content>
    </Frame>
  )
}
