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
import { Table } from '@opencrvs/components/lib/Table'
import { Text } from '@opencrvs/components/lib/Text'
import { Divider } from '@opencrvs/components/lib/Divider'
import styled from 'styled-components'
import { ColumnContentAlignment } from '@opencrvs/components/lib/common-types'
import { useIntl } from 'react-intl'
import { Link } from '@opencrvs/components'
import { formatLongDate } from '@client/utils/date-formatting'
import { useNavigate } from 'react-router-dom'
import { formatUrl } from '@client/navigation'
import * as routes from '@client/navigation/routes'
import { constantsMessages } from '@client/v2-events/messages'
// eslint-disable-next-line no-restricted-imports
import { ProfileState } from '@client/profile/profileReducer'
import { ActionDocument } from '@opencrvs/commons/client'

/**
 * Based on packages/client/src/views/RecordAudit/History.tsx
 */

const TableDiv = styled.div`
  overflow: auto;
`

const NameAvatar = styled.div`
  display: flex;
  align-items: center;
  img {
    margin-right: 10px;
  }
`

const GetNameWithAvatar = () => {
  const userName = 'Unknown registar'

  return (
    <NameAvatar>
      <span>{userName}</span>
    </NameAvatar>
  )
}

export const EventHistory = ({
  history,
  user
}: {
  history: ActionDocument[]
  user: ProfileState['userDetails']
}) => {
  const intl = useIntl()
  const navigate = useNavigate()

  const DEFAULT_HISTORY_RECORD_PAGE_SIZE = 10

  const historyRows = history.map((item) => ({
    date: formatLongDate(
      item?.createdAt.toLocaleString(),
      intl.locale,
      'MMMM dd, yyyy · hh.mm a'
    ),

    action: (
      <Link
        font="bold14"
        onClick={() => {
          window.alert('not implemented')
        }}
      >
        {item.type}
      </Link>
    ),
    user: (
      <Link
        id="profile-link"
        font="bold14"
        onClick={() =>
          navigate(
            formatUrl(routes.USER_PROFILE, {
              userId: item.createdBy
            })
          )
        }
      >
        <GetNameWithAvatar />
      </Link>
    )
  }))

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
      <Text variant="h3" element="h3" color="copy">
        {intl.formatMessage(constantsMessages.history)}
      </Text>
      <TableDiv>
        <Table
          id="task-history"
          fixedWidth={1088}
          noResultText=""
          columns={columns}
          content={historyRows}
          highlightRowOnMouseOver
          pageSize={DEFAULT_HISTORY_RECORD_PAGE_SIZE}
        />
      </TableDiv>
    </>
  )
}
