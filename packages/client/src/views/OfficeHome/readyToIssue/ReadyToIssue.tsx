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

import { formatUrl, generateIssueCertificateUrl } from '@client/navigation'
import { transformData } from '@client/search/transformer'
import {
  ColumnContentAlignment,
  Workqueue,
  SORT_ORDER,
  COLUMNS,
  IAction
} from '@opencrvs/components/lib/Workqueue'
import type { GQLEventSearchResultSet } from '@client/utils/gateway-deprecated-do-not-use'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import {
  buttonMessages,
  constantsMessages,
  wqMessages
} from '@client/i18n/messages'
import { IStoreState } from '@client/store'
import {
  DOWNLOAD_STATUS,
  clearCorrectionAndPrintChanges,
  SUBMISSION_STATUS
} from '@client/declarations'
import { DownloadAction } from '@client/forms'
import { DownloadButton } from '@client/components/interface/DownloadButton'
import {
  formattedDuration,
  plainDateToLocalDate
} from '@client/utils/date-formatting'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import {
  changeSortedColumn,
  getSortedItems
} from '@client/views/OfficeHome/utils'
import {
  IconWithName,
  NoNameContainer,
  NameContainer,
  IconWithNameEvent
} from '@client/views/OfficeHome/components'
import { WQContentWrapper } from '@client/views/OfficeHome/WQContentWrapper'
import { useState } from 'react'
import { useTheme } from 'styled-components'
import { issueMessages } from '@client/i18n/messages/issueCertificate'
import { useWindowSize } from '@opencrvs/components/lib/hooks'
import * as routes from '@client/navigation/routes'
import { useNavigate } from 'react-router-dom'

interface IBasePrintTabProps {
  queryData: {
    data: GQLEventSearchResultSet
  }
  paginationId: number
  onPageChange: (newPageNumber: number) => void
  loading?: boolean
  error?: boolean
  pageSize: number
}

export const ReadyToIssue = ({
  queryData,
  paginationId,
  onPageChange,
  pageSize,
  loading,
  error
}: IBasePrintTabProps) => {
  const navigate = useNavigate()
  const { width } = useWindowSize()
  const [sortedCol, setSortedCol] = useState(COLUMNS.REGISTERED)
  const [sortOrder, setSortOrder] = useState(SORT_ORDER.DESCENDING)
  const dispatch = useDispatch()
  const intl = useIntl()
  const data = queryData.data
  const totalPages = data.totalItems ? Math.ceil(data.totalItems / pageSize) : 0
  const isShowPagination = Boolean(
    data.totalItems && data.totalItems > pageSize
  )
  const outboxDeclarations = useSelector(
    (store: IStoreState) => store.declarationsState.declarations
  )

  const theme = useTheme()

  const onColumnClick = (columnName: string) => {
    const { newSortedCol, newSortOrder } = changeSortedColumn(
      columnName,
      sortedCol,
      sortOrder
    )
    setSortedCol(newSortedCol)
    setSortOrder(newSortOrder)
  }

  const getColumns = () => {
    if (width > theme.grid.breakpoints.lg) {
      return [
        {
          width: 30,
          label: intl.formatMessage(constantsMessages.record),
          key: COLUMNS.ICON_WITH_NAME,
          isSorted: sortedCol === COLUMNS.NAME,
          sortFunction: onColumnClick
        },
        {
          label: intl.formatMessage(constantsMessages.eventDate),
          width: 18,
          key: COLUMNS.DATE_OF_EVENT,
          isSorted: sortedCol === COLUMNS.DATE_OF_EVENT,
          sortFunction: onColumnClick
        },
        {
          label: intl.formatMessage(constantsMessages.trackingId),
          width: 18,
          key: COLUMNS.TRACKING_ID,
          isSorted: sortedCol === COLUMNS.TRACKING_ID,
          sortFunction: onColumnClick
        },
        {
          label: intl.formatMessage(issueMessages.regNumber),
          width: 18,
          key: COLUMNS.REGISTRATION_NO,
          isSorted: sortedCol === COLUMNS.REGISTRATION_NO,
          sortFunction: onColumnClick
        },
        {
          width: 18,
          alignment: ColumnContentAlignment.RIGHT,
          key: COLUMNS.ACTIONS,
          isActionColumn: true
        }
      ]
    } else {
      return [
        {
          label: intl.formatMessage(constantsMessages.record),
          width: 70,
          key: COLUMNS.ICON_WITH_NAME_EVENT
        },
        {
          width: 30,
          alignment: ColumnContentAlignment.RIGHT,
          key: COLUMNS.ACTIONS,
          isActionColumn: true
        }
      ]
    }
  }

  const transformCertifiedContent = (data: GQLEventSearchResultSet) => {
    if (!data || !data.results) {
      return []
    }

    const transformedData = transformData(data, intl)
    const items = transformedData.map((reg, index) => {
      const foundDeclaration = outboxDeclarations.find(
        (declaration) => declaration.id === reg.id
      )
      const actions: IAction[] = []
      const downloadStatus = foundDeclaration?.downloadStatus

      if (width > theme.grid.breakpoints.lg) {
        actions.push({
          label: intl.formatMessage(buttonMessages.issue),
          disabled: downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED,
          handler: (
            e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined
          ) => {
            e && e.stopPropagation()
            if (downloadStatus === DOWNLOAD_STATUS.DOWNLOADED) {
              dispatch(clearCorrectionAndPrintChanges(reg.id))

              navigate(generateIssueCertificateUrl({ registrationId: reg.id }))
            }
          }
        })
      }
      actions.push({
        actionComponent: (
          <DownloadButton
            downloadConfigs={{
              event: reg.event,
              compositionId: reg.id,
              action: DownloadAction.LOAD_REVIEW_DECLARATION,
              assignment: reg.assignment ?? undefined
            }}
            key={`DownloadButton-${index}`}
            status={downloadStatus}
            declarationStatus={reg.declarationStatus as SUBMISSION_STATUS}
          />
        )
      })

      const dateOfEvent =
        reg.dateOfEvent &&
        reg.dateOfEvent.length > 0 &&
        plainDateToLocalDate(reg.dateOfEvent)

      const NameComponent = reg.name ? (
        <NameContainer
          id={`name_${index}`}
          onClick={() =>
            navigate(
              formatUrl(routes.DECLARATION_RECORD_AUDIT, {
                tab: 'issueTab',
                declarationId: reg.id
              })
            )
          }
        >
          {reg.name}
        </NameContainer>
      ) : (
        <NoNameContainer
          id={`name_${index}`}
          onClick={() =>
            navigate(
              formatUrl(routes.DECLARATION_RECORD_AUDIT, {
                tab: 'issueTab',
                declarationId: reg.id
              })
            )
          }
        >
          {intl.formatMessage(constantsMessages.noNameProvided)}
        </NoNameContainer>
      )

      return {
        ...reg,
        name: reg.name && reg.name.toLowerCase(),
        iconWithName: (
          <IconWithName status={reg.declarationStatus} name={NameComponent} />
        ),
        iconWithNameEvent: (
          <IconWithNameEvent
            status={reg.declarationStatus}
            name={NameComponent}
            event={reg.event}
          />
        ),
        dateOfEvent,
        trackingId: reg.trackingId,
        registrationNumber: reg.registrationNumber,
        actions
      }
    })

    const sortedItems = getSortedItems(items, sortedCol, sortOrder)

    const finalContent = sortedItems.map((item) => {
      return {
        ...item,
        dateOfEvent:
          item.dateOfEvent && formattedDuration(item.dateOfEvent as Date)
      }
    })

    return finalContent
  }

  return (
    <WQContentWrapper
      title={intl.formatMessage(navigationMessages.readyToIssue)}
      isMobileSize={width < theme.grid.breakpoints.lg}
      isShowPagination={isShowPagination}
      paginationId={paginationId}
      totalPages={totalPages}
      onPageChange={onPageChange}
      loading={loading}
      error={error}
      noResultText={intl.formatMessage(wqMessages.noRecordReadyToIssue)}
      noContent={transformCertifiedContent(data).length <= 0}
    >
      <Workqueue
        content={transformCertifiedContent(data)}
        columns={getColumns()}
        loading={loading}
        sortOrder={sortOrder}
        hideLastBorder={!isShowPagination}
      />
    </WQContentWrapper>
  )
}
