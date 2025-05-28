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
import { stringify } from 'query-string'
import { Link, Pagination } from '@opencrvs/components'
import { ColumnContentAlignment } from '@opencrvs/components/lib/common-types'
import { Divider } from '@opencrvs/components/lib/Divider'
import { Text } from '@opencrvs/components/lib/Text'
import { Table } from '@opencrvs/components/lib/Table'
import { ActionDocument, ActionType } from '@opencrvs/commons/client'
import { useModal } from '@client/v2-events/hooks/useModal'
import { constantsMessages } from '@client/v2-events/messages'
import * as routes from '@client/navigation/routes'
import { formatUrl } from '@client/navigation'
import { useEventOverviewContext } from '@client/v2-events/features/workqueues/EventOverview/EventOverviewContext'
import { useSystems } from '@client/views/SysAdmin/Config/Systems/useSystems'
import { getUsersFullName } from '@client/v2-events/utils'
import {
  EventHistoryModal,
  eventHistoryStatusMessage
} from './EventHistoryModal'
import { UserAvatar } from './UserAvatar'

/**
 * Based on packages/client/src/views/RecordAudit/History.tsx
 */

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
      '{role, select, LOCAL_REGISTRAR {Local Registrar} SOCIAL_WORKER {Field Agent} REGISTRATION_AGENT {Registration Agent} HEALTH {Health integration} IMPORT {Import integration} NATIONAL_ID {National ID integration} RECORD_SEARCH {Record search integration} WEBHOOK {Webhook} other {Unknown}}',
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

/*
 * At first we tried adding a field such as 'userType' to all actions etc,
 * but that would have caused file changes to like 20 files.
 * So lets Keep It Stupid Simple and just check it there is no location -> machine user.
 */
function isUserAction(
  item: ActionDocument
): item is ActionDocument & { createdAtLocation: string } {
  return Boolean(item.createdAtLocation)
}

/**
 *  Renders the event history table. Used for audit trail.
 */
export function EventHistory({ history }: { history: ActionDocument[] }) {
  const [currentPageNumber, setCurrentPageNumber] = React.useState(1)
  const { existingSystems } = useSystems()

  const intl = useIntl()
  const navigate = useNavigate()
  const [modal, openModal] = useModal()
  const { getUser, getLocation } = useEventOverviewContext()

  const onHistoryRowClick = (item: ActionDocument, userName: string) => {
    void openModal<void>((close) => (
      <EventHistoryModal close={close} history={item} userName={userName} />
    ))
  }

  const visibleHistory = history.filter(
    ({ type }) => type !== ActionType.CREATE
  )

  const historyRows = visibleHistory
    .slice(
      (currentPageNumber - 1) * DEFAULT_HISTORY_RECORD_PAGE_SIZE,
      currentPageNumber * DEFAULT_HISTORY_RECORD_PAGE_SIZE
    )
    .map((action) => {
      const userAction = isUserAction(action)
      const user = userAction && getUser(action.createdBy)
      const system = existingSystems.find((s) => s._id === action.createdBy)

      const location = userAction
        ? getLocation(action.createdAtLocation)
        : undefined

      const userName = user
        ? getUsersFullName(user.name, intl.locale)
        : (system?.name ?? intl.formatMessage(messages.systemDefaultName))

      const userElement = user ? (
        <Link
          font="bold14"
          id="profile-link"
          onClick={() =>
            navigate(
              formatUrl(routes.USER_PROFILE, { userId: action.createdBy })
            )
          }
        >
          <UserAvatar
            // @TODO: extend v2-events User to include avatar
            avatar={undefined}
            locale={intl.locale}
            names={userName}
          />
        </Link>
      ) : (
        // TODO CIHAN: show box here
        <UserAvatar avatar={undefined} locale={intl.locale} names={userName} />
      )

      const actionElement = (
        <Link
          font="bold14"
          onClick={() => {
            onHistoryRowClick(action, userName)
          }}
        >
          {intl.formatMessage(eventHistoryStatusMessage, {
            status: action.type
          })}
        </Link>
      )

      return {
        action: actionElement,
        date: format(
          new Date(action.createdAt),
          intl.formatMessage(messages.timeFormat)
        ),
        user: userElement,
        role: intl.formatMessage(messages.role, { role: action.createdByRole }),
        location: (
          <Link
            font="bold14"
            onClick={() => {
              navigate({
                pathname: routes.TEAM_USER_LIST,
                search: stringify({
                  locationId: action.createdAtLocation
                })
              })
            }}
          >
            {location?.name}
          </Link>
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
