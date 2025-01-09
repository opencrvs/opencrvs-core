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
import styled from 'styled-components'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { stringify } from 'query-string'
import { Button, Link, ResponsiveModal, Stack } from '@opencrvs/components'
import { ColumnContentAlignment } from '@opencrvs/components/lib/common-types'
import { Divider } from '@opencrvs/components/lib/Divider'
import { Text } from '@opencrvs/components/lib/Text'
import { Table } from '@opencrvs/components/lib/Table'
import { ResolvedActionDocument, ResolvedUser } from '@opencrvs/commons/client'
import { useModal } from '@client/v2-events/hooks/useModal'
import { Avatar, Maybe } from '@client/utils/gateway'
import { AvatarSmall } from '@client/components/Avatar'
import { constantsMessages } from '@client/v2-events/messages'
import * as routes from '@client/navigation/routes'
import { formatUrl } from '@client/navigation'
import { formatLongDate } from '@client/utils/date-formatting'
import { getNameOfUser } from '@client/v2-events/features/workqueues/utils'

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

function UserAvatar({
  names,
  avatar,
  locale
}: {
  names: ResolvedUser['name']
  avatar?: Maybe<Avatar>
  locale: string
}) {
  const name = getNameOfUser(names, locale)

  return (
    <NameAvatar>
      <AvatarSmall avatar={avatar} name={name} />
      <span>{name}</span>
    </NameAvatar>
  )
}

function DetailedHistoryModal({
  history,
  close
}: {
  history: ResolvedActionDocument
  close: (result: boolean | null) => void
}) {
  const intl = useIntl()

  const name = getNameOfUser(history.createdBy.name, intl.locale)
  return (
    <ResponsiveModal
      autoHeight
      actions={[]}
      handleClose={() => close(null)}
      responsive={false}
      show={true}
      title={history.type}
      width={1024}
    >
      <Stack>
        <Text color="grey500" element="p" variant="reg19">
          {name} {'—'}{' '}
          {formatLongDate(
            history.createdAt.toLocaleString(),
            intl.locale,
            'MMMM dd, yyyy · hh.mm a'
          )}
        </Text>
      </Stack>
    </ResponsiveModal>
  )
}

export function EventHistory({
  history
}: {
  history: ResolvedActionDocument[]
}) {
  const intl = useIntl()
  const navigate = useNavigate()
  const [modal, openModal] = useModal()

  const onHistoryRowClick = (item: ResolvedActionDocument) => {
    void openModal<boolean | null>((close) => (
      <DetailedHistoryModal close={close} history={item} />
    ))
  }
  const DEFAULT_HISTORY_RECORD_PAGE_SIZE = 10

  const historyRows = history.map((item) => ({
    date: formatLongDate(
      item.createdAt.toLocaleString(),
      intl.locale,
      'MMMM dd, yyyy · hh.mm a'
    ),
    action: (
      <Link
        font="bold14"
        onClick={() => {
          onHistoryRowClick(item)
        }}
      >
        {item.type}
      </Link>
    ),
    user: (
      <Link
        font="bold14"
        id="profile-link"
        onClick={() =>
          navigate(
            formatUrl(routes.USER_PROFILE, {
              userId: item.createdBy.id
            })
          )
        }
      >
        <UserAvatar
          avatar={undefined}
          locale={intl.locale}
          names={item.createdBy.name}
        />
      </Link>
    ),
    role: item.createdBy.systemRole,
    location: (
      <Link
        font="bold14"
        onClick={() => {
          navigate({
            pathname: routes.TEAM_USER_LIST,
            search: stringify({
              locationId: item.createdAtLocation.id
            })
          })
        }}
      >
        {item.createdAtLocation.name}
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
      <Text color="copy" element="h3" variant="h3">
        {intl.formatMessage(constantsMessages.history)}
      </Text>
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
      </TableDiv>
      {modal}
    </>
  )
}
