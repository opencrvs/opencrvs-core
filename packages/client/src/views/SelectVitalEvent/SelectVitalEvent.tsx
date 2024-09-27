import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/selectVitalEvent'
import {
  goToBirthRegistrationAsParent,
  goToDeathInformant,
  goToHome,
  goToMarriageInformant
} from '@client/navigation'
import { Event } from '@client/utils/gateway'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Button } from '@opencrvs/components/lib/Button'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { ErrorText } from '@opencrvs/components/lib/ErrorText'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Icon } from '@opencrvs/components/lib/Icon'
import { RadioButton } from '@opencrvs/components/lib/Radio'
import { Stack } from '@opencrvs/components/lib/Stack'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { useDispatch } from 'react-redux'

import { createDeclaration, storeDeclaration } from '@client/declarations'
import { useForms } from '@client/hooks/useForms'
import { useState } from 'react'

const SelectVitalEventView = () => {
  const intl = useIntl()
  const [selectedEventType, setGoTo] = useState<Event>()
  const [noEventSelectedError, setNoEventSelectedError] = useState(false)
  const { forms, goToNewForm } = useForms()

  const dispatch = useDispatch()

  const legacyFlows = {
    [Event.Birth]: goToBirthRegistrationAsParent,
    [Event.Death]: goToDeathInformant,
    [Event.Marriage]: goToMarriageInformant
  }

  const handleContinue = () => {
    if (selectedEventType === undefined) {
      setNoEventSelectedError(true)
      return
    }

    if (legacyFlows[selectedEventType]) {
      const declaration = createDeclaration(selectedEventType)
      dispatch(storeDeclaration(declaration))
      dispatch(legacyFlows[selectedEventType](declaration.id))
      return
    }

    goToNewForm(selectedEventType)
  }

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
              onClick={() => dispatch(goToHome())}
            >
              <Icon name="X" />
              {intl.formatMessage(buttonMessages.exitButton)}
            </Button>
          }
          mobileLeft={<Icon name="Draft" size="large" />}
          mobileTitle={intl.formatMessage(messages.registerNewEventTitle)}
          mobileRight={
            <Button
              type="icon"
              size="medium"
              onClick={() => dispatch(goToHome())}
            >
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
        bottomActionButtons={[
          <Button
            key="select-vital-event-continue"
            id="continue"
            type="primary"
            size="large"
            fullWidth
            onClick={handleContinue}
          >
            {intl.formatMessage(buttonMessages.continueButton)}
          </Button>
        ]}
      >
        {noEventSelectedError && (
          <ErrorText id="require-error">
            {intl.formatMessage(messages.errorMessage)}
          </ErrorText>
        )}
        <Stack
          id="select_vital_event_view"
          direction="column"
          alignItems="left"
          gap={0}
        >
          {forms
            .filter((form) => form.enabled)
            .map((form) => (
              <RadioButton
                size="large"
                key={form.id}
                name={form.id}
                label={intl.formatMessage(form.label)}
                value={form.id}
                id={form.id}
                selected={selectedEventType === form.id ? form.id : ''}
                onChange={() => {
                  setGoTo(form.id as Event)
                  setNoEventSelectedError(false)
                }}
              />
            ))}
        </Stack>
      </Content>
    </Frame>
  )
}

export const SelectVitalEvent = SelectVitalEventView
