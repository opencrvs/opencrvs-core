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

import React, { useCallback } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import { ActionType, isUndeclaredDraft } from '@opencrvs/commons/client'
import type { TranslationConfig } from '@opencrvs/commons/events'
import { AppBar, Button, Icon, ToggleMenu } from '@opencrvs/components'
import { DeclarationIcon, Print } from '@opencrvs/components/lib/icons'
import { useEvents } from '@client/v2-events//features/events/useEvents/useEvents'
import { useEventFormNavigation } from '@client/v2-events//features/events/useEventFormNavigation'

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

export const ActionIcons: { [key in ActionType]: React.JSX.Element } = {
  CREATE: <DeclarationIcon color={getDeclarationIconColor()} />,
  ASSIGN: <DeclarationIcon color={getDeclarationIconColor()} />,
  UNASSIGN: <DeclarationIcon color={getDeclarationIconColor()} />,
  REGISTER: <DeclarationIcon color={getDeclarationIconColor()} />,
  VALIDATE: <DeclarationIcon color={getDeclarationIconColor()} />,
  CORRECT: <DeclarationIcon color={getDeclarationIconColor()} />,
  DETECT_DUPLICATE: <DeclarationIcon color={getDeclarationIconColor()} />,
  NOTIFY: <DeclarationIcon color={getDeclarationIconColor()} />,
  DECLARE: <DeclarationIcon color={getDeclarationIconColor()} />,
  DELETE: <DeclarationIcon color={getDeclarationIconColor()} />,
  COLLECT_CERTIFICATE: <Print color={getDeclarationIconColor()} />,
  CUSTOM: <DeclarationIcon color={getDeclarationIconColor()} />
}

export function FormHeader({
  action,
  label,
  onSaveAndExit
}: {
  action: ActionType
  label: TranslationConfig
  onSaveAndExit: () => void
}) {
  const intl = useIntl()
  const { modal, exit, deleteDeclaration } = useEventFormNavigation()

  const { eventId } = useParams<{
    eventId: string
  }>()

  if (!eventId) {
    throw new Error('Event id is required')
  }
  const events = useEvents()
  const [event] = events.getEvent.useSuspenseQuery(eventId)

  const onExit = useCallback(async () => {
    await exit(event)
  }, [event, exit])

  const onDelete = useCallback(async () => {
    await deleteDeclaration(eventId)
  }, [eventId, deleteDeclaration])

  return (
    <AppBar
      desktopLeft={ActionIcons[action]}
      desktopRight={
        <>
          {
            <Button
              disabled={false}
              id="save-exit-btn"
              size="small"
              type="primary"
              onClick={onSaveAndExit}
            >
              <Icon name="DownloadSimple" />
              {intl.formatMessage(messages.saveExitButton)}
            </Button>
          }
          <Button size="small" type="secondary" onClick={onExit}>
            <Icon name="X" />
            {intl.formatMessage(messages.exitButton)}
          </Button>
          <ToggleMenu
            id={'event-menu'}
            menuItems={
              isUndeclaredDraft(event)
                ? [
                    {
                      label: 'Delete declaration',
                      icon: <Icon name="Trash" />,
                      handler: onDelete
                    }
                  ]
                : []
            }
            toggleButton={
              <Icon color="primary" name="DotsThreeVertical" size="large" />
            }
          />
          {modal}
        </>
      }
      desktopTitle={intl.formatMessage(label)}
      mobileLeft={<DeclarationIcon color={getDeclarationIconColor()} />}
      mobileRight={
        <>
          {
            <Button
              disabled={false}
              size="small"
              type="icon"
              onClick={onSaveAndExit}
            >
              <Icon name="DownloadSimple" />
            </Button>
          }
          <Button size="small" type="icon" onClick={onExit}>
            <Icon name="X" />
          </Button>
          <ToggleMenu
            id={'event-menu'}
            menuItems={[
              {
                label: 'Delete declaration',
                icon: <Icon name="Trash" />,
                handler: onDelete
              }
            ]}
            toggleButton={
              <Icon color="primary" name="DotsThreeVertical" size="large" />
            }
          />
          {modal}
        </>
      }
      mobileTitle={intl.formatMessage(messages.newVitalEventRegistration, {
        event: intl.formatMessage(label)
      })}
    />
  )
}
