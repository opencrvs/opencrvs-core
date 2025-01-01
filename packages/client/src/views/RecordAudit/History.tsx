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
import { AvatarSmall } from '@client/components/Avatar'
import { DOWNLOAD_STATUS, SUBMISSION_STATUS } from '@client/declarations'
import { usePermissions } from '@client/hooks/useAuthorization'
import { constantsMessages, userMessages } from '@client/i18n/messages'
import { integrationMessages } from '@client/i18n/messages/views/integrations'
import { ILocation } from '@client/offline/reducer'
import { formatLongDate } from '@client/utils/date-formatting'
import { Avatar, History, RegStatus, SystemType } from '@client/utils/gateway'
import type { GQLHumanName } from '@client/utils/gateway-deprecated-do-not-use'
import { getLocalizedLocationName } from '@client/utils/locationUtils'
import { getIndividualNameObj } from '@client/utils/userUtils'
import { Link } from '@opencrvs/components'
import { ColumnContentAlignment } from '@opencrvs/components/lib/common-types'
import { Divider } from '@opencrvs/components/lib/Divider'
import { Box } from '@opencrvs/components/lib/icons/Box'
import { Pagination } from '@opencrvs/components/lib/Pagination'
import { Table } from '@opencrvs/components/lib/Table'
import { Text } from '@opencrvs/components/lib/Text'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import { CMethodParams } from './ActionButtons'
import {
  getPageItems,
  getStatusLabel,
  isFlaggedAsPotentialDuplicate,
  isSystemInitiated,
  isVerifiedAction
} from './utils'
import { useSelector } from 'react-redux'
import { getScope } from '@client/profile/profileSelectors'
import { useNavigate } from 'react-router-dom'
import { formatUrl } from '@client/navigation'
import * as routes from '@client/navigation/routes'
import { stringify } from 'query-string'

const TableDiv = styled.div`
  overflow: auto;
`

const LargeGreyedInfo = styled.div`
  height: 231px;
  background-color: ${({ theme }) => theme.colors.grey200};
  max-width: 100%;
  border-radius: 4px;
  margin: 15px 0px;
`

const NameAvatar = styled.div`
  display: flex;
  align-items: center;
  img {
    margin-right: 10px;
  }
`

const HealthSystemLogo = styled.div`
  border-radius: 100%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  margin-right: 10px;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.grey200};
`

function SystemUser({ name }: { name?: string }) {
  const intl = useIntl()
  return (
    <NameAvatar>
      <HealthSystemLogo />
      <span>
        {Boolean(name) ? name : intl.formatMessage(userMessages.system)}
      </span>
    </NameAvatar>
  )
}

function HealthSystemUser({ name }: { name?: string }) {
  const intl = useIntl()
  return (
    <NameAvatar>
      <HealthSystemLogo>
        <Box />
      </HealthSystemLogo>
      <span>{name ?? intl.formatMessage(userMessages.healthSystem)}</span>
    </NameAvatar>
  )
}

const GetNameWithAvatar = ({
  nameObject,
  avatar,
  language
}: {
  id: string
  nameObject: Array<GQLHumanName | null>
  avatar: Avatar
  language: string
}) => {
  const nameObj = getIndividualNameObj(nameObject, language)
  const userName = nameObj
    ? `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
    : ''

  return (
    <NameAvatar>
      <AvatarSmall avatar={avatar} name={userName} />
      <span>{userName}</span>
    </NameAvatar>
  )
}

function getSystemType(type: string | undefined) {
  if (type === SystemType.RecordSearch) {
    return integrationMessages.recordSearch
  }
  return integrationMessages.healthSystem
}

const getIndexByAction = (histories: any, index: number): number => {
  const newHistories = [...histories]
  if (
    newHistories[index].action ||
    !['ISSUED', 'CERTIFIED'].includes(newHistories[index].regStatus)
  ) {
    return -1
  }

  newHistories.map((item) => {
    item.uuid = uuid()
    return item
  })

  const uid = newHistories[index].uuid
  const actionIndex = newHistories
    .filter(
      (item) =>
        item.action === newHistories[index].action &&
        (item.regStatus === 'ISSUED' || item.regStatus === 'CERTIFIED')
    )
    .findIndex((item) => item.uuid === uid)

  return actionIndex
}

export const GetHistory = ({
  intl,
  draft,
  toggleActionDetails,
  userDetails
}: CMethodParams & {
  toggleActionDetails: (actionItem: History, index?: number) => void
}) => {
  const navigate = useNavigate()

  const [currentPageNumber, setCurrentPageNumber] = React.useState(1)
  const DEFAULT_HISTORY_RECORD_PAGE_SIZE = 10
  const { canReadUser, canAccessOffice } = usePermissions()
  const scopes = useSelector(getScope)

  const onPageChange = (currentPageNumber: number) =>
    setCurrentPageNumber(currentPageNumber)
  if (
    !(draft?.downloadStatus === DOWNLOAD_STATUS.DOWNLOADED) &&
    !(draft?.submissionStatus === SUBMISSION_STATUS.DRAFT)
  )
    return (
      <>
        <Divider />
        <Text variant="h3" element="h3" color="copy">
          {intl.formatMessage(constantsMessages.history)}
        </Text>
        <LargeGreyedInfo />
      </>
    )
  let allHistoryData = (draft.data.history || []) as unknown as {
    [key: string]: any
  }[]
  if (!allHistoryData.length && userDetails) {
    allHistoryData.unshift({
      date: new Date(draft.savedOn || Date.now()).toISOString(),
      regStatus: 'STARTED',
      user: {
        id: userDetails.userMgntUserID,
        name: userDetails.name,
        avatar: userDetails.avatar,
        role: userDetails.role,
        primaryOffice: userDetails.primaryOffice
      },
      office: userDetails.primaryOffice,
      comments: [],
      input: [],
      output: []
    })
  }

  if (!window.config.FEATURES.EXTERNAL_VALIDATION_WORKQUEUE) {
    allHistoryData = allHistoryData.filter(
      ({ regStatus }: Partial<History>) => {
        return regStatus !== RegStatus.WaitingValidation
      }
    )
  }

  // TODO: We need to figure out a way to sort the history in backend
  const sortedHistory = allHistoryData.sort((fe, se) => {
    return new Date(fe.date).getTime() - new Date(se.date).getTime()
  })

  const historiesForDisplay = getPageItems(
    currentPageNumber,
    DEFAULT_HISTORY_RECORD_PAGE_SIZE,
    sortedHistory
  )
  const historyData = (historiesForDisplay as History[]).map((item, index) => ({
    date: formatLongDate(
      item?.date.toLocaleString(),
      intl.locale,
      'MMMM dd, yyyy · hh.mm a'
    ),

    action: (
      <Link
        font="bold14"
        onClick={() => {
          const actionIndex = getIndexByAction(
            sortedHistory,
            index + (currentPageNumber - 1) * DEFAULT_HISTORY_RECORD_PAGE_SIZE
          )
          toggleActionDetails(item, actionIndex)
        }}
      >
        {getStatusLabel(
          item.action,
          item.regStatus,
          intl,
          item.user,
          userDetails,
          scopes
        )}
      </Link>
    ),
    user: (
      <>
        {isFlaggedAsPotentialDuplicate(item) ? (
          <SystemUser name={item.system?.name || ''} />
        ) : isVerifiedAction(item) ? (
          <div />
        ) : isSystemInitiated(item) ? (
          <HealthSystemUser name={item.system?.name || ''} />
        ) : !canReadUser(item.user!) ? (
          <GetNameWithAvatar
            id={item?.user?.id as string}
            nameObject={item?.user?.name as (GQLHumanName | null)[]}
            avatar={item.user?.avatar as Avatar}
            language={window.config.LANGUAGES}
          />
        ) : (
          <Link
            id="profile-link"
            font="bold14"
            onClick={() =>
              navigate(
                formatUrl(routes.USER_PROFILE, {
                  userId: String(item?.user?.id)
                })
              )
            }
          >
            <GetNameWithAvatar
              id={item?.user?.id as string}
              nameObject={item?.user?.name as (GQLHumanName | null)[]}
              avatar={item.user?.avatar as Avatar}
              language={window.config.LANGUAGES}
            />
          </Link>
        )}
      </>
    ),
    role: isFlaggedAsPotentialDuplicate(item) ? (
      <div />
    ) : isVerifiedAction(item) ? (
      <div />
    ) : isSystemInitiated(item) ? (
      intl.formatMessage(getSystemType(item.system?.type || ''))
    ) : (
      item.user && intl.formatMessage(item.user.role.label)
    ),

    location:
      isFlaggedAsPotentialDuplicate(item) ||
      isVerifiedAction(item) ||
      isSystemInitiated(item) ? (
        <div />
      ) : item.office && canAccessOffice(item.office) ? (
        <Link
          font="bold14"
          onClick={() => {
            navigate({
              pathname: routes.TEAM_USER_LIST,
              search: stringify({
                locationId: item?.office?.id as string
              })
            })
          }}
        >
          {item.office
            ? getLocalizedLocationName(
                intl,
                item.office as unknown as ILocation
              )
            : ''}
        </Link>
      ) : (
        <>{item.office?.name}</>
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
          content={historyData}
          highlightRowOnMouseOver
          pageSize={DEFAULT_HISTORY_RECORD_PAGE_SIZE}
        />
        {allHistoryData.length > DEFAULT_HISTORY_RECORD_PAGE_SIZE && (
          <Pagination
            currentPage={currentPageNumber}
            totalPages={Math.ceil(
              allHistoryData.length / DEFAULT_HISTORY_RECORD_PAGE_SIZE
            )}
            onPageChange={onPageChange}
          />
        )}
      </TableDiv>
    </>
  )
}
