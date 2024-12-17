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

import { AppBar, Button, Icon } from '@opencrvs/components'
import { DeclarationIcon } from '@opencrvs/components/lib/icons'
import React, { useCallback } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import { useEventFormNavigation } from '@client/v2-events//features/events/useEventFormNavigation'
import { useEvents } from '@client/v2-events//features/events/useEvents/useEvents'
import type { TranslationConfig } from '@opencrvs/commons/events'
import { useEventFormData } from '@client/v2-events//features/events/useEventFormData'
import { v4 as uuid } from 'uuid'

function getDeclarationIconColor(): string {
  return 'purple'
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
  const { modal, exit, goToHome } = useEventFormNavigation()
  const events = useEvents()
  const formValues = useEventFormData((state) => state.formValues)
  const { eventId } = useParams<{
    eventId: string
  }>()

  if (!eventId) {
    throw new Error('Event id is required')
  }

  const createDraft = events.actions.draft()

  const saveAndExit = useCallback(() => {
    createDraft.mutate({ eventId, data: formValues, transactionId: uuid() })
    goToHome()
  }, [createDraft, eventId, formValues, goToHome])

  const onExit = useCallback(() => {
    exit()
  }, [exit])

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
              disabled={false}
              onClick={saveAndExit}
            >
              <Icon name="DownloadSimple" />
              {intl.formatMessage(messages.saveExitButton)}
            </Button>
          }
          <Button type="secondary" size="small" onClick={onExit}>
            <Icon name="X" />
            {intl.formatMessage(messages.exitButton)}
          </Button>
          {modal}
        </>
      }
      mobileLeft={<DeclarationIcon color={getDeclarationIconColor()} />}
      mobileTitle={intl.formatMessage(messages.newVitalEventRegistration, {
        event: intl.formatMessage(label)
      })}
      mobileRight={
        <>
          {
            <Button
              type="icon"
              size="small"
              disabled={false}
              onClick={saveAndExit}
            >
              <Icon name="DownloadSimple" />
            </Button>
          }
          <Button type="icon" size="small" onClick={onExit}>
            <Icon name="X" />
          </Button>
        </>
      }
    />
  )
}
