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
import { defineMessages, IntlShape, useIntl } from 'react-intl'
import { NavigateFunction, useNavigate } from 'react-router-dom'
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
import { constantsMessages } from '@client/v2-events/messages'
import * as routes from '@client/navigation/routes'
import { formatUrl } from '@client/navigation'
import { useEventOverviewContext } from '@client/v2-events/features/workqueues/EventOverview/EventOverviewContext'
import { getUsersFullName } from '@client/v2-events/utils'
import { getOfflineData } from '@client/offline/selectors'
import { serializeSearchParams } from '@client/v2-events/features/events/Search/utils'
import { useActionForHistory } from '@client/v2-events/features/events/actions/correct/useActionForHistory'
import { usePermissions } from '@client/hooks/useAuthorization'
import { ILocation } from '@client/offline/reducer'
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
    id: 'v2.configuration.timeFormat',
    description: 'Time format for timestamps in event history'
  },
  role: {
    id: 'v2.event.history.role',
    defaultMessage:
      '{role, select, LOCAL_REGISTRAR {Local Registrar} SOCIAL_WORKER {Social Worker} FIELD_AGENT {Field Agent} POLICE_OFFICER {Police Officer} REGISTRATION_AGENT {Registration Agent} HEALTHCARE_WORKER {Healthcare Worker} LOCAL_LEADER {Local Leader} HOSPITAL_CLERK {Hospital Clerk} LOCAL_SYSTEM_ADMIN {Administrator} NATIONAL_REGISTRAR {Registrar General} PERFORMANCE_MANAGER {Operations Manager} NATIONAL_SYSTEM_ADMIN {National Administrator} COMMUNITY_LEADER {Community Leader} HEALTH {Health integration} IMPORT {Import integration} NATIONAL_ID {National ID integration} RECORD_SEARCH {Record search integration} WEBHOOK {Webhook} other {Unknown}}',
    description: 'Role of the user in the event history'
  },
  systemDefaultName: {
    id: 'v2.event.history.systemDefaultName',
    defaultMessage: 'System integration',
    description: 'Fallback for system integration name in the event history'
  }
})

const Header = styled(Text)`
  margin-bottom: 20px;
`

// At first we tried adding a field such as 'userType' to all actions etc, but that would have caused file changes to like 20 files.
// So lets Keep It Stupid Simple and just check it there is no location -> machine user.
function isUserAction(
  item: ActionDocument
): item is ActionDocument & { createdAtLocation: string } {
  return Boolean(item.createdAtLocation)
}

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

function getUserAvatar(
  intl: IntlShape,
  name: string,
  navigate: NavigateFunction,
  userId: string,
  isClickable: boolean
) {
  return isClickable ? (
    <Link
      font="bold14"
      id="profile-link"
      onClick={() => navigate(formatUrl(routes.USER_PROFILE, { userId }))}
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

function getSystemAvatar(name: string) {
  return (
    <SystemName>
      <div>
        <Box />
      </div>
      {name}
    </SystemName>
  )
}

function getEventLocation(
  navigate: NavigateFunction,
  location: ILocation | undefined,
  action: ActionDocument,
  isClickable: boolean
) {
  return isClickable ? (
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
      {location?.name}
    </Link>
  ) : (
    <>{location?.name}</>
  )
}

export function EventHistorySkeleton() {
  const intl = useIntl()
  return (
    <>
      <Divider />
      <Stack alignItems="stretch" direction="column" gap={16}>
        <Text color="copy" element="h3" variant="h3">
          {intl.formatMessage(constantsMessages.history)}
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
  const { systems } = useSelector(getOfflineData)

  const intl = useIntl()
  const navigate = useNavigate()
  const [modal, openModal] = useModal()
  const { getUser, getLocation } = useEventOverviewContext()
  const { getActionTypeForHistory } = useActionForHistory()
  const { canReadUser, canAccessOffice } = usePermissions()

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
      const userAction = isUserAction(action)
      const user = getUser(action.createdBy)
      const system = systems.find((s) => s._id === action.createdBy)

      const location = userAction
        ? getLocation(action.createdAtLocation)
        : undefined

      const canSeeOtherUserHistory = canReadUser({
        id: user.id,
        primaryOffice: { id: user.primaryOfficeId }
      })

      const canSeeHistoryUserOffice = canAccessOffice({
        id: user.primaryOfficeId
      })

      const userName = userAction
        ? getUsersFullName(user.name, intl.locale)
        : (system?.name ?? intl.formatMessage(messages.systemDefaultName))

      const userElement = userAction
        ? getUserAvatar(
            intl,
            userName,
            navigate,
            action.createdBy,
            canSeeOtherUserHistory
          )
        : getSystemAvatar(userName)

      return {
        action: (
          <Link
            font="bold14"
            onClick={() => onHistoryRowClick(action, userName)}
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
        user: userElement,
        role: intl.formatMessage(messages.role, { role: action.createdByRole }),
        location: getEventLocation(
          navigate,
          location,
          action,
          canSeeHistoryUserOffice
        )
      }
    })

  const columns = [
    {
      label: intl.formatMessage(constantsMessages.action),
      width: 22,
      key: 'action'
    },
    {
      label: intl.formatMessage(constantsMessages.date),
      width: 22,
      key: 'date'
    },
    {
      label: intl.formatMessage(constantsMessages.by),
      width: 22,
      key: 'user',
      isIconColumn: true,
      ICON_ALIGNMENT: ColumnContentAlignment.LEFT
    },
    {
      label: intl.formatMessage(constantsMessages.labelRole),
      width: 15,
      key: 'role'
    },
    {
      label: intl.formatMessage(constantsMessages.location),
      width: 20,
      key: 'location'
    }
  ]

  return (
    <>
      <Divider />
      <Header color="copy" element="h3" variant="h3">
        {intl.formatMessage(constantsMessages.history)}
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
