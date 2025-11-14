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
import format from 'date-fns/format'
import styled from 'styled-components'
import { defineMessages, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { Link, Pagination } from '@opencrvs/components'
import { ColumnContentAlignment } from '@opencrvs/components/lib/common-types'
import { Table } from '@opencrvs/components/lib/Table'
import {
  ActionType,
  ActionTypes,
  EventDocument,
  getAcceptedActions,
  getActionConfig,
  ValidatorContext
} from '@opencrvs/commons/client'
import { Box } from '@opencrvs/components/lib/icons'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { ROUTES } from '@client/v2-events/routes'
import { useModal } from '@client/v2-events/hooks/useModal'
import * as routes from '@client/navigation/routes'
import { formatUrl } from '@client/navigation'
import { useEventOverviewContext } from '@client/v2-events/features/workqueues/EventOverview/EventOverviewContext'
import { getUsersFullName } from '@client/v2-events/utils'
import { getOfflineData } from '@client/offline/selectors'
import { serializeSearchParams } from '@client/v2-events/features/events/Search/utils'
import {
  expandWithClientSpecificActions,
  EventHistoryActionDocument,
  useActionForHistory,
  extractHistoryActions
} from '@client/v2-events/features/events/actions/correct/useActionForHistory'
import { usePermissions } from '@client/hooks/useAuthorization'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { UserAvatar } from './UserAvatar'
import {
  EventHistoryDialog,
  eventHistoryStatusMessage
} from './EventHistoryDialog/EventHistoryDialog'

const LargeGreyedInfo = styled.div`
  height: 231px;
  background-color: ${({ theme }) => theme.colors.grey200};
  max-width: 100%;
  border-radius: 4px;
`

const TableDiv = styled.div`
  overflow: auto;
`

const DEFAULT_HISTORY_RECORD_PAGE_SIZE = 10

const messages = defineMessages({
  timeFormat: {
    defaultMessage: 'MMMM dd, yyyy · hh.mm a',
    id: 'configuration.timeFormat',
    description: 'Time format for timestamps in event history'
  },
  role: {
    id: 'event.history.role',
    defaultMessage:
      '{role, select, LOCAL_REGISTRAR {Local Registrar} HOSPITAL_CLERK {Hospital Clerk} FIELD_AGENT {Field Agent} POLICE_OFFICER {Police Officer} REGISTRATION_AGENT {Registration Agent} HEALTHCARE_WORKER {Healthcare Worker} COMMUNITY_LEADER {Community Leader} LOCAL_SYSTEM_ADMIN {Administrator} NATIONAL_REGISTRAR {Registrar General} PERFORMANCE_MANAGER {Operations Manager} NATIONAL_SYSTEM_ADMIN {National Administrator} HEALTH {Health integration} IMPORT_EXPORT {Import integration} NATIONAL_ID {National ID integration} RECORD_SEARCH {Record search integration} WEBHOOK {Webhook} other {Unknown}}',
    description: 'Role of the user in the event history'
  },
  system: {
    id: 'event.history.system',
    defaultMessage: 'System',
    description: 'Name for system initiated actions in the event history'
  },
  systemDefaultName: {
    id: 'event.history.systemDefaultName',
    defaultMessage: 'System integration',
    description: 'Fallback for system integration name in the event history'
  },
  action: {
    defaultMessage: 'Action',
    description: 'Action Label',
    id: 'constants.label.action'
  },
  by: {
    defaultMessage: 'By',
    description: 'Label for By (the person who performed the action)',
    id: 'constants.by'
  },
  date: {
    defaultMessage: 'Date',
    description: 'Date Label',
    id: 'constants.label.date'
  },
  audit: {
    defaultMessage: 'Audit',
    description: 'Audit heading',
    id: 'constants.audit'
  },
  labelRole: {
    defaultMessage: 'Role',
    description: 'Role label',
    id: 'constants.role'
  },
  location: {
    defaultMessage: 'Location',
    description: 'Label for location',
    id: 'constants.location'
  }
})

const SystemName = styled.div`
  display: flex;
  align-items: center;

  > div {
    flex-grow: 0;
    flex-shrink: 0;
    border-radius: 100%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    margin-right: 10px;
    justify-content: center;
    background-color: ${({ theme }) => theme.colors.grey200};
  }
`

interface ActionCreator {
  type: 'user' | 'system' | 'integration'
  name: string
}

function useActionCreator() {
  const intl = useIntl()
  const { findUser } = useEventOverviewContext()
  const { systems } = useSelector(getOfflineData)

  const getActionCreator = (
    action: EventHistoryActionDocument
  ): ActionCreator => {
    if (action.createdByUserType === 'system') {
      const system = systems.find((s) => s._id === action.createdBy)
      return {
        type: 'integration',
        name: system?.name ?? intl.formatMessage(messages.systemDefaultName)
      } as const
    }
    if (action.type === ActionType.DUPLICATE_DETECTED) {
      return {
        type: 'system',
        name: intl.formatMessage(messages.system)
      } as const
    }
    const user = findUser(action.createdBy)
    return {
      type: 'user',
      // @todo:
      name: user ? getUsersFullName(user.name, intl.locale) : 'Missing user'
    } as const
  }
  return { getActionCreator }
}

function User({ action }: { action: EventHistoryActionDocument }) {
  const intl = useIntl()
  const { findUser } = useEventOverviewContext()
  const navigate = useNavigate()
  const user = findUser(action.createdBy)
  const { canReadUser } = usePermissions()

  const { getActionCreator } = useActionCreator()

  const { type, name } = getActionCreator(action)

  if (type !== 'user') {
    throw new Error('Expected action creator to be a user')
  }

  const canViewUser =
    !!user &&
    canReadUser({
      id: user.id,
      primaryOffice: { id: user.primaryOfficeId }
    })

  return canViewUser ? (
    <Link
      font="bold14"
      id="profile-link"
      onClick={() =>
        navigate(formatUrl(routes.USER_PROFILE, { userId: user.id }))
      }
    >
      <UserAvatar
        // @TODO: extend v2-events User to include avatar
        avatar={undefined}
        locale={intl.locale}
        names={name}
      />
    </Link>
  ) : (
    <UserAvatar avatar={undefined} locale={intl.locale} names={name} />
  )
}

function Integration({ action }: { action: EventHistoryActionDocument }) {
  const { getActionCreator } = useActionCreator()

  const { type, name } = getActionCreator(action)

  if (type !== 'integration') {
    throw new Error('Expected action creator to be an integration')
  }

  return (
    <SystemName>
      <div>
        <Box />
      </div>
      {name}
    </SystemName>
  )
}

function ActionCreator({ action }: { action: EventHistoryActionDocument }) {
  const intl = useIntl()
  if (action.createdByUserType === 'system') {
    return <Integration action={action} />
  }
  if (action.type === ActionType.DUPLICATE_DETECTED) {
    return (
      <SystemName>
        <div>
          <Box />
        </div>
        {intl.formatMessage(messages.system)}
      </SystemName>
    )
  }
  return <User action={action} />
}

function ActionRole({ action }: { action: EventHistoryActionDocument }) {
  const intl = useIntl()
  const role = action.createdByRole
  const { getActionCreator } = useActionCreator()
  const { type } = getActionCreator(action)

  if (type === 'system') {
    return null
  }

  return <>{intl.formatMessage(messages.role, { role })}</>
}

function ActionLocation({ action }: { action: EventHistoryActionDocument }) {
  const { findUser, getLocation } = useEventOverviewContext()
  const { canAccessOffice } = usePermissions()
  const navigate = useNavigate()
  const { getActionCreator } = useActionCreator()

  const user = findUser(action.createdBy)
  const locationName = action.createdAtLocation
    ? getLocation(action.createdAtLocation)?.name
    : undefined

  const hasAccessToOffice =
    !!user &&
    canAccessOffice({
      id: user.primaryOfficeId
    })

  const { type } = getActionCreator(action)

  if (type === 'system') {
    return null
  }

  return hasAccessToOffice ? (
    <Link
      font="bold14"
      onClick={() => {
        navigate({
          pathname: routes.TEAM_USER_LIST,
          search: serializeSearchParams({
            locationId: action.createdAtLocation
          })
        })
      }}
    >
      {locationName}
    </Link>
  ) : (
    locationName
  )
}

function EventHistorySkeleton() {
  const intl = useIntl()
  return (
    <Content
      size={ContentSize.LARGE}
      title={intl.formatMessage(messages.audit)}
    >
      <LargeGreyedInfo />
    </Content>
  )
}

/**
 *  Renders the event history table. Used for audit trail.
 */
function EventHistory({ fullEvent }: { fullEvent: EventDocument }) {
  const [currentPageNumber, setCurrentPageNumber] = React.useState(1)
  const validatorContext = useValidatorContext()
  const { eventConfiguration } = useEventConfiguration(fullEvent.type)

  const intl = useIntl()
  const [modal, openModal] = useModal()
  const { getActionTypeForHistory } = useActionForHistory()
  const { getActionCreator } = useActionCreator()

  const history = extractHistoryActions(fullEvent)

  const historyWithClientSpecificActions = expandWithClientSpecificActions(
    fullEvent,
    validatorContext,
    eventConfiguration
  )

  const visibleHistoryWithClientSpecificActions =
    historyWithClientSpecificActions.filter(
      ({ type }) => type !== ActionType.CREATE
    )

  const onHistoryRowClick = (
    action: EventHistoryActionDocument,
    userName: string
  ) => {
    void openModal<void>((close) => (
      <EventHistoryDialog
        action={action}
        close={close}
        fullEvent={fullEvent}
        userName={userName}
        validatorContext={validatorContext}
      />
    ))
  }

  const historyRows = visibleHistoryWithClientSpecificActions
    .map((x) => {
      if (x.type === ActionType.REQUEST_CORRECTION) {
        const immediateApprovedCorrection =
          visibleHistoryWithClientSpecificActions.find(
            (h) =>
              h.type === ActionType.APPROVE_CORRECTION &&
              (h.requestId === x.id || h.requestId === x.originalActionId) &&
              h.annotation?.isImmediateCorrection &&
              h.createdBy === x.createdBy
          )
        // Adding flag on immediately approved REQUEST_CORRECTION to show it
        // as 'Record corrected' in history table
        if (immediateApprovedCorrection) {
          return {
            ...x,
            annotation: { ...x.annotation, isImmediateCorrection: true }
          }
        }
      }
      return x
    })
    .filter((x) => {
      // removing immediately APPROVED_CORRECTION to since we only show
      // associated REQUEST_CORRECTION as 'Record corrected'
      if (
        x.type === ActionType.APPROVE_CORRECTION &&
        x.annotation?.isImmediateCorrection
      ) {
        return false
      }
      return true
    })
    .slice(
      (currentPageNumber - 1) * DEFAULT_HISTORY_RECORD_PAGE_SIZE,
      currentPageNumber * DEFAULT_HISTORY_RECORD_PAGE_SIZE
    )
    .map((action) => {
      const { name: actionCreatorName } = getActionCreator(action)

      const actionConfig = getActionConfig({
        eventConfiguration,
        actionType: action.type as ActionType,
        customActionType:
          'customActionType' in action ? action.customActionType : undefined
      })

      // If a audit history label is configured in action config, use that!
      const label =
        actionConfig && actionConfig.auditHistoryLabel
          ? intl.formatMessage(actionConfig.auditHistoryLabel)
          : intl.formatMessage(eventHistoryStatusMessage, {
              action: getActionTypeForHistory(history, action),
              status: action.status
            })

      return {
        action: (
          <Link
            font="bold14"
            onClick={() => onHistoryRowClick(action, actionCreatorName)}
          >
            {label}
          </Link>
        ),
        date: format(
          new Date(action.createdAt),
          intl.formatMessage(messages.timeFormat)
        ),
        user: <ActionCreator action={action} />,
        role: <ActionRole action={action} />,
        location: <ActionLocation action={action} />
      }
    })

  const columns = [
    {
      label: intl.formatMessage(messages.action),
      width: 22,
      key: 'action'
    },
    {
      label: intl.formatMessage(messages.date),
      width: 22,
      key: 'date'
    },
    {
      label: intl.formatMessage(messages.by),
      width: 22,
      key: 'user',
      isIconColumn: true,
      ICON_ALIGNMENT: ColumnContentAlignment.LEFT
    },
    {
      label: intl.formatMessage(messages.labelRole),
      width: 15,
      key: 'role'
    },
    {
      label: intl.formatMessage(messages.location),
      width: 20,
      key: 'location'
    }
  ]

  return (
    <Content
      size={ContentSize.LARGE}
      title={intl.formatMessage(messages.audit)}
    >
      <TableDiv>
        <Table
          highlightRowOnMouseOver
          columns={columns}
          content={historyRows}
          fixedWidth={1088}
          id="task-history"
          noResultText=""
          pageSize={DEFAULT_HISTORY_RECORD_PAGE_SIZE}
        />
        {visibleHistoryWithClientSpecificActions.length >
          DEFAULT_HISTORY_RECORD_PAGE_SIZE && (
          <Pagination
            currentPage={currentPageNumber}
            totalPages={Math.ceil(
              visibleHistoryWithClientSpecificActions.length /
                DEFAULT_HISTORY_RECORD_PAGE_SIZE
            )}
            onPageChange={(page) => setCurrentPageNumber(page)}
          />
        )}
      </TableDiv>
      {modal}
    </Content>
  )
}

export function EventHistoryIndex() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.EVENT.AUDIT)
  const { getEvent } = useEvents()
  const fullEvent = getEvent.findFromCache(eventId).data

  if (!fullEvent) {
    return <EventHistorySkeleton />
  }

  return <EventHistory fullEvent={fullEvent} />
}
