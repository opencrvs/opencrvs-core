/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import React from 'react'
import { TableView } from '@opencrvs/components/lib/interface/TableView'
import { Divider } from '@opencrvs/components/lib/interface/Divider'
import styled from '@client/styledComponents'
import {
  ISearchLocation,
  ColumnContentAlignment
} from '@opencrvs/components/lib/interface'
import { constantsMessages, userMessages } from '@client/i18n/messages'
import { getFormattedDate, getDisplayItems, getStatusLabel } from './utils'
import { PaginationModified } from '@opencrvs/components/lib/interface/PaginationModified'
import {
  PaginationWrapper,
  MobileWrapper,
  DesktopWrapper
} from '@opencrvs/components/lib/styleForPagination'
import { CMethodParams } from './ActionButtons'
import { LinkButton } from '@opencrvs/components/lib/buttons/LinkButton'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'
import { IAvatar, getIndividualNameObj } from '@client/utils/userUtils'
import { goToUserProfile } from '@client/navigation'
import { AvatarSmall } from '@client/components/Avatar'
import { DOWNLOAD_STATUS, SUBMISSION_STATUS } from '@client/declarations'

const Heading = styled.h3`
  ${({ theme }) => theme.fonts.h3}
  margin-bottom: 0px !important;
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

export interface IActionDetailsData {
  [key: string]: any
}

export const GetLink = ({
  status,
  onClick
}: {
  status: string
  onClick: () => void
}) => {
  return (
    <LinkButton style={{ textAlign: 'left' }} onClick={onClick}>
      {status}
    </LinkButton>
  )
}

export const GetNameWithAvatar = ({
  id,
  nameObject,
  avatar,
  language,
  goToUser
}: {
  id: string
  nameObject: Array<GQLHumanName | null>
  avatar: IAvatar
  language: string
  goToUser?: typeof goToUserProfile
}) => {
  const nameObj = getIndividualNameObj(nameObject, language)
  const userName = nameObj
    ? `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
    : ''

  return (
    <NameAvatar>
      <AvatarSmall avatar={avatar} name={userName} />
      <span>
        <LinkButton
          id={'username-link'}
          onClick={() => {
            goToUser && goToUser(id)
          }}
        >
          {userName}
        </LinkButton>
      </span>
    </NameAvatar>
  )
}

export const GetHistory = ({
  intl,
  draft,
  userDetails,
  goToUserProfile,
  goToTeamUserList,
  toggleActionDetails
}: CMethodParams & {
  toggleActionDetails: (actionItem: IActionDetailsData) => void
}) => {
  const [currentPageNumber, setCurrentPageNumber] = React.useState(1)
  const DEFAULT_HISTORY_RECORD_PAGE_SIZE = 10

  const onPageChange = (currentPageNumber: number) =>
    setCurrentPageNumber(currentPageNumber)
  if (
    !(draft?.downloadStatus === DOWNLOAD_STATUS.DOWNLOADED) &&
    !(draft?.submissionStatus === SUBMISSION_STATUS.DRAFT)
  )
    return (
      <>
        <Divider />
        <Heading>{intl.formatMessage(constantsMessages.history)}</Heading>
        <LargeGreyedInfo />
      </>
    )
  const allHistoryData = (draft.data.history || []) as unknown as {
    [key: string]: any
  }[]
  if (!allHistoryData.length && userDetails) {
    allHistoryData.unshift({
      date: new Date(draft.savedOn || Date.now()).toString(),
      action: 'CREATED',
      user: {
        id: userDetails.userMgntUserID,
        name: userDetails.name,
        avatar: userDetails.avatar,
        role: userDetails.role
      },
      office: userDetails.primaryOffice,
      comments: [],
      input: [],
      output: []
    })
  }
  const historiesForDisplay = getDisplayItems(
    currentPageNumber,
    DEFAULT_HISTORY_RECORD_PAGE_SIZE,
    allHistoryData
  )
  const historyData = (
    historiesForDisplay as unknown as { [key: string]: any }[]
  )
    // TODO: We need to figure out a way to sort the history in backend
    .sort((fe, se) => {
      return new Date(fe.date).getTime() - new Date(se.date).getTime()
    })
    .map((item) => ({
      date: getFormattedDate(item?.date),
      action: (
        <GetLink
          status={getStatusLabel(item?.action, item.reinstated, intl)}
          onClick={() => toggleActionDetails(item)}
        />
      ),
      user: (
        <GetNameWithAvatar
          id={item.user.id}
          nameObject={item.user.name}
          avatar={item.user?.avatar}
          language={window.config.LANGUAGES}
          goToUser={goToUserProfile}
        />
      ),
      type: intl.formatMessage(userMessages[item.user.role as string]),
      location: (
        <GetLink
          status={item.office.name}
          onClick={() => {
            goToTeamUserList &&
              goToTeamUserList({
                id: item.office.id,
                searchableText: item.office.name,
                displayLabel: item.office.name
              } as ISearchLocation)
          }}
        />
      )
    }))

  const columns = [
    {
      label: 'Action',
      width: 22,
      key: 'action'
    },
    {
      label: 'Date',
      width: 22,
      key: 'date'
    },
    {
      label: 'By',
      width: 22,
      key: 'user',
      isIconColumn: true,
      ICON_ALIGNMENT: ColumnContentAlignment.LEFT
    },
    { label: 'Type', width: 15, key: 'type' },
    { label: 'Location', width: 20, key: 'location' }
  ]
  return (
    <>
      <Divider />
      <Heading>{intl.formatMessage(constantsMessages.history)}</Heading>
      <TableView
        id="task-history"
        fixedWidth={1065}
        noResultText=""
        hideBoxShadow={true}
        columns={columns}
        content={historyData}
        alignItemCenter={true}
        pageSize={DEFAULT_HISTORY_RECORD_PAGE_SIZE}
      />
      {allHistoryData.length > DEFAULT_HISTORY_RECORD_PAGE_SIZE && (
        <PaginationWrapper>
          <DesktopWrapper>
            <PaginationModified
              size="small"
              initialPage={currentPageNumber}
              totalPages={Math.ceil(
                allHistoryData.length / DEFAULT_HISTORY_RECORD_PAGE_SIZE
              )}
              onPageChange={onPageChange}
            />
          </DesktopWrapper>
          <MobileWrapper>
            <PaginationModified
              size="large"
              initialPage={currentPageNumber}
              totalPages={Math.ceil(
                allHistoryData.length / DEFAULT_HISTORY_RECORD_PAGE_SIZE
              )}
              onPageChange={onPageChange}
            />
          </MobileWrapper>
        </PaginationWrapper>
      )}
    </>
  )
}
