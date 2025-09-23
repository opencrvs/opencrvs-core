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
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { isUndeclaredDraft, TranslationConfig } from '@opencrvs/commons/client'
import { AppBar, Button, Icon, ToggleMenu } from '@opencrvs/components'
import { useEvents } from '@client/v2-events//features/events/useEvents/useEvents'
import { useEventFormNavigation } from '@client/v2-events//features/events/useEventFormNavigation'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useValidationFunctionsWithContext } from '@client/v2-events/hooks/useValidationFunctionsWithContext'
import { AllowedRouteWithEventId } from './utils'

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
  }
})

export function FormHeader({
  label,
  onSaveAndExit,
  route,
  appbarIcon
}: {
  label: string
  onSaveAndExit?: () => void
  route: AllowedRouteWithEventId
  appbarIcon?: React.ReactNode
}) {
  const intl = useIntl()
  const { modal, exit, closeActionView, deleteDeclaration } =
    useEventFormNavigation()
  const events = useEvents()
  const { getCurrentEventState } = useValidationFunctionsWithContext()
  const { eventId } = useTypedParams(route)

  if (!eventId) {
    throw new Error('Event id is required')
  }
  const event = events.getEvent.getFromCache(eventId)
  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )
  const eventIndex = getCurrentEventState(event, configuration)

  const onExit = useCallback(async () => {
    await exit(eventIndex)
  }, [eventIndex, exit])

  const onDelete = useCallback(async () => {
    await deleteDeclaration(eventId)
  }, [eventId, deleteDeclaration])

  const menuItems = isUndeclaredDraft(eventIndex.status)
    ? [
        {
          label: 'Delete declaration',
          icon: <Icon name="Trash" />,
          handler: onDelete
        }
      ]
    : []

  return (
    <AppBar
      desktopLeft={appbarIcon}
      desktopRight={
        <>
          {onSaveAndExit ? (
            <>
              <Button
                disabled={false}
                id="save-exit-btn"
                size="small"
                type="primary"
                onClick={onSaveAndExit}
              >
                <Icon name="FloppyDisk" />
                {intl.formatMessage(messages.saveExitButton)}
              </Button>

              <Button
                data-testid="exit-button"
                size="small"
                type="secondary"
                onClick={onExit}
              >
                <Icon name="X" />
                {intl.formatMessage(messages.exitButton)}
              </Button>
              {menuItems.length > 0 && (
                <ToggleMenu
                  id="event-menu"
                  menuItems={menuItems}
                  toggleButton={
                    <Icon
                      color="primary"
                      data-testid="event-menu-toggle-button-image"
                      name="DotsThreeVertical"
                      size="large"
                    />
                  }
                />
              )}
            </>
          ) : (
            <Button
              data-testid="exit-button"
              size="small"
              type="icon"
              onClick={() => closeActionView()}
            >
              <Icon name="X" />
            </Button>
          )}
          {modal}
        </>
      }
      desktopTitle={label}
      mobileLeft={appbarIcon}
      mobileRight={
        <>
          {onSaveAndExit ? (
            <>
              <Button
                disabled={false}
                size="small"
                type="icon"
                onClick={onSaveAndExit}
              >
                <Icon name="FloppyDisk" />
              </Button>
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
                  <Icon
                    color="primary"
                    data-testid="event-menu-toggle-button-image"
                    name="DotsThreeVertical"
                    size="large"
                  />
                }
              />
            </>
          ) : (
            <Button size="small" type="icon" onClick={() => closeActionView()}>
              <Icon name="X" />
            </Button>
          )}
          {modal}
        </>
      }
      mobileTitle={label}
    />
  )
}
