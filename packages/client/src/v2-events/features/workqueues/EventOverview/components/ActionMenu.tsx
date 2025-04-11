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

import React, { useMemo } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import formatISO from 'date-fns/formatISO'
import {
  validate,
  ActionType,
  ConditionalType,
  SCOPES,
  EventDocument,
  type ActionConfig,
  getCurrentEventStateWithDrafts,
  getUUID,
  EventConfig,
  EventIndex
} from '@opencrvs/commons/client'
import { CaretDown } from '@opencrvs/components/lib/Icon/all-icons'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { DropdownMenu } from '@opencrvs/components/lib/Dropdown'
import { useAuthentication } from '@client/utils/userUtils'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { ROUTES } from '@client/v2-events/routes'
import { messages } from '@client/i18n/messages/views/action'
import ProtectedComponent from '@client/components/ProtectedComponent'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { AssignmentStatus, getAssignmentStatus } from '@client/v2-events/utils'

const viewRecordMessage = {
  id: 'v2.view.record',
  description: 'Label for view record',
  defaultMessage: 'View record'
}

function ReadOnlyViewOption({ event }: { event: EventDocument }) {
  const intl = useIntl()
  const navigate = useNavigate()
  return (
    <ProtectedComponent scopes={[SCOPES.RECORD_READ]}>
      <DropdownMenu.Item
        key="view-declaration"
        onClick={() =>
          navigate(ROUTES.V2.EVENTS.VIEW.buildPath({ eventId: event.id }))
        }
      >
        {intl.formatMessage(viewRecordMessage)}
      </DropdownMenu.Item>
    </ProtectedComponent>
  )
}

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

  /**
   * Refer to https://tanstack.com/query/latest/docs/framework/react/guides/dependent-queries
   * This does not immediately execute the query but instead prepares it to be fetched conditionally when needed.
   */
  const { refetch: refetchEvent } = events.getEvent.useQuery(eventId, false)
  const eventState = events.getEventState.useSuspenseQuery(eventId)
  const [event] = events.getEvent.useSuspenseQuery(eventId)

  if (!authentication) {
    throw new Error('Authentication is not available but is required')
  }

  const assignmentStatus = getAssignmentStatus(eventState, authentication.sub)

  const { getRemoteDrafts } = useDrafts()
  const drafts = getRemoteDrafts()
  const eventStateWithDrafts = useMemo(
    () => getCurrentEventStateWithDrafts(event, drafts),
    [drafts, event]
  )

  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )

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

  return (
    <>
      <DropdownMenu id="action">
        <DropdownMenu.Trigger asChild>
          <PrimaryButton
            data-testid="action-dropdownMenu"
            icon={() => <CaretDown />}
          >
            {intl.formatMessage(messages.action)}
          </PrimaryButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          {/* if an event has declaration, then it is viewable */}
          {Object.keys(eventStateWithDrafts.declaration).length > 0 && (
            <ReadOnlyViewOption event={event} />
          )}
          {configuration.actions.filter(isActionVisible).map((action) => {
            return (
              <DropdownMenu.Item
                key={action.type}
                disabled={
                  assignmentStatus !== AssignmentStatus.ASSIGNED_TO_SELF
                }
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
          {assignmentStatus === AssignmentStatus.UNASSIGNED && (
            <DropdownMenu.Item
              key={ActionType.ASSIGN}
              onClick={async () => {
                await events.actions.assignment.assign.mutate({
                  eventId,
                  assignedTo: authentication.sub,
                  refetchEvent
                })
              }}
            >
              {intl.formatMessage(actionMessages.assignLabel)}
            </DropdownMenu.Item>
          )}
          {(assignmentStatus === AssignmentStatus.ASSIGNED_TO_SELF ||
            (assignmentStatus === AssignmentStatus.ASSIGNED_TO_OTHERS &&
              authentication.scope.includes(
                SCOPES.RECORD_UNASSIGN_OTHERS
              ))) && (
            <DropdownMenu.Item
              key={ActionType.UNASSIGN}
              onClick={() => {
                events.actions.assignment.unassign.mutate({
                  eventId,
                  transactionId: getUUID(),
                  assignedTo: null
                })
              }}
            >
              {intl.formatMessage(actionMessages.unassignLabel)}
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu>
    </>
  )
}
