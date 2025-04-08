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

import React from 'react'
import { defineMessages, useIntl } from 'react-intl'

import { useNavigate } from 'react-router-dom'
import formatISO from 'date-fns/formatISO'
import {
  validate,
  ActionType,
  ConditionalType,
  ActionConfig,
  getUUID
} from '@opencrvs/commons/client'
import { CaretDown } from '@opencrvs/components/lib/Icon/all-icons'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { DropdownMenu } from '@opencrvs/components/lib/Dropdown'
import { useAuthentication } from '@client/utils/userUtils'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { ROUTES } from '@client/v2-events/routes'
import { messages } from '@client/i18n/messages/views/action'

const actionMessages = defineMessages({
  assignLabel: {
    defaultMessage: 'Assign',
    description: `Label for the ${ActionType.ASSIGN} action in the action menu`,
    id: 'v2.action.assign.label'
  },
  unassignLabel: {
    defaultMessage: 'Unassign',
    description: `Label for the ${ActionType.UNASSIGN} action in the action menu`,
    id: 'v2.action.unassign.label'
  }
})

export function ActionMenu({ eventId }: { eventId: string }) {
  const intl = useIntl()
  const events = useEvents()
  const navigate = useNavigate()
  const authentication = useAuthentication()

  const [event] = events.getEvent.useSuspenseQuery(eventId)

  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )

  if (!authentication) {
    throw new Error('Authentication is not available but is required')
  }

  function isActionVisible(action: ActionConfig) {
    if (action.conditionals.length === 0) {
      return true
    }

    const params = {
      $event: event,
      $user: authentication,
      $now: formatISO(new Date(), { representation: 'date' })
    }
    return action.conditionals.reduce((acc, conditional) => {
      if (conditional.type === ConditionalType.SHOW) {
        return acc && validate(conditional.conditional, params)
      }

      return acc
    }, true)
  }

  const AssignmentActions = (
    <>
      <DropdownMenu.Item
        key={ActionType.ASSIGN}
        onClick={() => {
          events.actions.assignment.assign.mutate({
            eventId,
            transactionId: getUUID(),
            declaration: {},
            assignedTo: authentication.sub
          })
        }}
      >
        {intl.formatMessage(actionMessages.assignLabel)}
      </DropdownMenu.Item>

      <DropdownMenu.Item
        key={ActionType.UNASSIGN}
        onClick={() => {
          events.actions.assignment.unassign.mutate({
            eventId,
            transactionId: getUUID(),
            declaration: {},
            assignedTo: null
          })
        }}
      >
        {intl.formatMessage(actionMessages.unassignLabel)}
      </DropdownMenu.Item>
    </>
  )

  return (
    <>
      <DropdownMenu id="action">
        <DropdownMenu.Trigger asChild>
          <PrimaryButton icon={() => <CaretDown />}>
            {intl.formatMessage(messages.action)}
          </PrimaryButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          {configuration.actions.filter(isActionVisible).map((action) => {
            return (
              <DropdownMenu.Item
                key={action.type}
                onClick={() => {
                  if (
                    action.type === ActionType.REJECT ||
                    action.type === ActionType.ARCHIVE ||
                    action.type === ActionType.MARKED_AS_DUPLICATE ||
                    action.type === ActionType.APPROVE_CORRECTION ||
                    action.type === ActionType.REJECT_CORRECTION
                  ) {
                    alert(`Action ${action.type} is not implemented yet.`)
                    return
                  }

                  if (
                    action.type === ActionType.REGISTER ||
                    action.type === ActionType.VALIDATE
                  ) {
                    navigate(
                      ROUTES.V2.EVENTS[action.type].REVIEW.buildPath({
                        eventId
                      })
                    )
                  } else {
                    navigate(
                      ROUTES.V2.EVENTS[action.type].buildPath({ eventId })
                    )
                  }
                }}
              >
                {intl.formatMessage(action.label)}
              </DropdownMenu.Item>
            )
          })}
          {AssignmentActions}
        </DropdownMenu.Content>
      </DropdownMenu>
    </>
  )
}
