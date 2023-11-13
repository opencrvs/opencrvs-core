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
import { constantsMessages, userMessages } from '@client/i18n/messages'
import {
  getPageItems,
  getStatusLabel,
  isFlaggedAsPotentialDuplicate,
  isSystemInitiated,
  isVerifiedAction
} from './utils'
import { Pagination } from '@opencrvs/components/lib/Pagination'
import { CMethodParams } from './ActionButtons'
import type { GQLHumanName } from '@client/utils/gateway-deprecated-do-not-use'
import { getIndividualNameObj } from '@client/utils/userUtils'
import { AvatarSmall } from '@client/components/Avatar'
import { FIELD_AGENT_ROLES } from '@client/utils/constants'
import { DOWNLOAD_STATUS, SUBMISSION_STATUS } from '@client/declarations'
import { useIntl } from 'react-intl'
import { Box } from '@opencrvs/components/lib/icons/Box'
import { v4 as uuid } from 'uuid'
import { History, Avatar, RegStatus, SystemType } from '@client/utils/gateway'
import { Link } from '@opencrvs/components'
import { integrationMessages } from '@client/i18n/messages/views/integrations'
import { getUserRole } from '@client/views/SysAdmin/Config/UserRoles/utils'
import { getLanguage } from '@client/i18n/selectors'
import { useSelector } from 'react-redux'
import { formatLongDate } from '@client/utils/date-formatting'
import { getLocalizedLocationName } from '@client/utils/locationUtils'
import { ILocation } from '@client/offline/reducer'

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
    .reverse()
    .findIndex((item) => item.uuid === uid)

  return actionIndex
}

export const GetHistory = ({
  intl,
  draft,
  goToUserProfile,
  goToTeamUserList,
  toggleActionDetails,
  userDetails
}: CMethodParams & {
  toggleActionDetails: (actionItem: History, index?: number) => void
  goToUserProfile: (user: string) => void
}) => {
  const [currentPageNumber, setCurrentPageNumber] = React.useState(1)
  const isFieldAgent =
    userDetails?.systemRole &&
    FIELD_AGENT_ROLES.includes(userDetails.systemRole)
      ? true
      : false
  const DEFAULT_HISTORY_RECORD_PAGE_SIZE = 10
  const currentLanguage = useSelector(getLanguage)

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
        systemRole: userDetails.systemRole,
        role: userDetails.role
      },
      office: userDetails.primaryOffice,
      comments: [],
      input: [],
      output: []
    })
  }

  if (!window.config.EXTERNAL_VALIDATION_WORKQUEUE) {
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
          userDetails
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
        ) : isFieldAgent ? (
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
            onClick={() => goToUserProfile(String(item?.user?.id))}
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
    ) : isSystemInitiated(item) || !item.user?.systemRole ? (
      intl.formatMessage(getSystemType(item.system?.type || ''))
    ) : (
      getUserRole(currentLanguage, item.user?.role)
    ),

    location:
      isFlaggedAsPotentialDuplicate(item) ||
      isVerifiedAction(item) ||
      isSystemInitiated(item) ? (
        <div />
      ) : isFieldAgent ? (
        <>{item.office?.name}</>
      ) : (
        <Link
          font="bold14"
          onClick={() => {
            goToTeamUserList && goToTeamUserList(item?.office?.id as string)
          }}
        >
          {item.office
            ? getLocalizedLocationName(
                intl,
                item.office as unknown as ILocation
              )
            : ''}
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
