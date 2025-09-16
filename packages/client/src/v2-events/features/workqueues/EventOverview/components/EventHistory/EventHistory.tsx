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
import { Link, Pagination } from '@opencrvs/components'
import { ColumnContentAlignment } from '@opencrvs/components/lib/common-types'
import { Divider } from '@opencrvs/components/lib/Divider'
import { Stack } from '@opencrvs/components/lib/Stack'
import { Text } from '@opencrvs/components/lib/Text'
import { Table } from '@opencrvs/components/lib/Table'
import {
  ActionDocument,
  ActionType,
  EventDocument,
  getAcceptedActions
} from '@opencrvs/commons/client'
import { Box } from '@opencrvs/components/lib/icons'
import { useModal } from '@client/v2-events/hooks/useModal'
import * as routes from '@client/navigation/routes'
import { formatUrl } from '@client/navigation'
import { useEventOverviewContext } from '@client/v2-events/features/workqueues/EventOverview/EventOverviewContext'
import { getUsersFullName } from '@client/v2-events/utils'
import { getOfflineData } from '@client/offline/selectors'
import { serializeSearchParams } from '@client/v2-events/features/events/Search/utils'
import { useActionForHistory } from '@client/v2-events/features/events/actions/correct/useActionForHistory'
import { usePermissions } from '@client/hooks/useAuthorization'
import {
  EventHistoryDialog,
  eventHistoryStatusMessage
} from './EventHistoryDialog/EventHistoryDialog'
import { UserAvatar } from './UserAvatar'

/**
 * Based on packages/client/src/views/RecordAudit/History.tsx
 */

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
      '{role, select, LOCAL_REGISTRAR {Local Registrar} SOCIAL_WORKER {Social Worker} FIELD_AGENT {Field Agent} POLICE_OFFICER {Police Officer} REGISTRATION_AGENT {Registration Agent} HEALTHCARE_WORKER {Healthcare Worker} LOCAL_LEADER {Local Leader} HOSPITAL_CLERK {Hospital Clerk} LOCAL_SYSTEM_ADMIN {Administrator} NATIONAL_REGISTRAR {Registrar General} PERFORMANCE_MANAGER {Operations Manager} NATIONAL_SYSTEM_ADMIN {National Administrator} COMMUNITY_LEADER {Community Leader} HEALTH {Health integration} IMPORT {Import integration} NATIONAL_ID {National ID integration} RECORD_SEARCH {Record search integration} WEBHOOK {Webhook} other {Unknown}}',
    description: 'Role of the user in the event history'
  },
  system: {
    id: 'v2.event.history.system',
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
  history: {
    defaultMessage: 'History',
    description: 'History heading',
    id: 'constants.history'
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

const Header = styled(Text)`
  margin-bottom: 20px;
`

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
  const { getUser } = useEventOverviewContext()
  const { systems } = useSelector(getOfflineData)

  const getActionCreator = (action: ActionDocument): ActionCreator => {
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
    const user = getUser(action.createdBy)
    return {
      type: 'user',
      name: getUsersFullName(user.name, intl.locale)
    } as const
  }
  return { getActionCreator }
}

function User({ action }: { action: ActionDocument }) {
  const intl = useIntl()
  const { getUser } = useEventOverviewContext()
  const navigate = useNavigate()
  const user = getUser(action.createdBy)
  const { canReadUser } = usePermissions()

  const { getActionCreator } = useActionCreator()

  const { type, name } = getActionCreator(action)

  if (type !== 'user') {
    throw new Error('Expected action creator to be a user')
  }

  const canViewUser = canReadUser({
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

function Integration({ action }: { action: ActionDocument }) {
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

function ActionCreator({ action }: { action: ActionDocument }) {
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

function ActionRole({ action }: { action: ActionDocument }) {
  const intl = useIntl()
  const role = action.createdByRole
  const { getActionCreator } = useActionCreator()
  const { type } = getActionCreator(action)

  if (type === 'system') {
    return null
  }

  return (
    <Text element="span" variant="reg14">
      {intl.formatMessage(messages.role, { role })}
    </Text>
  )
}

function ActionLocation({ action }: { action: ActionDocument }) {
  const { getUser, getLocation } = useEventOverviewContext()
  const { canAccessOffice } = usePermissions()
  const navigate = useNavigate()
  const { getActionCreator } = useActionCreator()

  const user = getUser(action.createdBy)
  const locationName = action.createdAtLocation
    ? getLocation(action.createdAtLocation)?.name
    : undefined

  const hasAccessToOffice = canAccessOffice({
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

export function EventHistorySkeleton() {
  const intl = useIntl()
  return (
    <>
      <Divider />
      <Stack alignItems="stretch" direction="column" gap={16}>
        <Text color="copy" element="h3" variant="h3">
          {intl.formatMessage(messages.history)}
        </Text>
        <LargeGreyedInfo />
      </Stack>
    </>
  )
}

/**
 *  Renders the event history table. Used for audit trail.
 */
export function EventHistory({ fullEvent }: { fullEvent: EventDocument }) {
  const [currentPageNumber, setCurrentPageNumber] = React.useState(1)

  const intl = useIntl()
  const [modal, openModal] = useModal()
  const { getActionTypeForHistory } = useActionForHistory()
  const { getActionCreator } = useActionCreator()

  const onHistoryRowClick = (item: ActionDocument, userName: string) => {
    void openModal<void>((close) => (
      <EventHistoryDialog
        action={item}
        close={close}
        fullEvent={fullEvent}
        userName={userName}
      />
    ))
  }

  const history = getAcceptedActions(fullEvent)

  const visibleHistory = history.filter(
    ({ type }) => type !== ActionType.CREATE
  )

  const historyRows = visibleHistory
    .map((x) => {
      if (x.type === ActionType.REQUEST_CORRECTION) {
        const immediateApprovedCorrection = visibleHistory.find(
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

      return {
        action: (
          <Link
            font="bold14"
            onClick={() => onHistoryRowClick(action, actionCreatorName)}
          >
            {intl.formatMessage(eventHistoryStatusMessage, {
              status: getActionTypeForHistory(history, action)
            })}
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
    <>
      <Divider />
      <Header color="copy" element="h3" variant="h3">
        {intl.formatMessage(messages.history)}
      </Header>
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
        {visibleHistory.length > DEFAULT_HISTORY_RECORD_PAGE_SIZE && (
          <Pagination
            currentPage={currentPageNumber}
            totalPages={Math.ceil(
              visibleHistory.length / DEFAULT_HISTORY_RECORD_PAGE_SIZE
            )}
            onPageChange={(page) => setCurrentPageNumber(page)}
          />
        )}
      </TableDiv>
      {modal}
    </>
  )
}
