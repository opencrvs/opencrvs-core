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
import { formatUrl, generateGoToPageUrl } from '@client/navigation'
import { REVIEW_EVENT_PARENT_FORM_PAGE } from '@client/navigation/routes'
import { getScope } from '@client/profile/profileSelectors'
import { transformData } from '@client/search/transformer'
import { IStoreState } from '@client/store'
import { ITheme } from '@opencrvs/components/lib/theme'

import {
  ColumnContentAlignment,
  Workqueue,
  COLUMNS,
  SORT_ORDER
} from '@opencrvs/components/lib/Workqueue'
import { IAction } from '@opencrvs/components/lib/common-types'
import type { GQLEventSearchResultSet } from '@client/utils/gateway-deprecated-do-not-use'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { withTheme } from 'styled-components'
import {
  buttonMessages,
  constantsMessages,
  dynamicConstantsMessages,
  wqMessages
} from '@client/i18n/messages'
import {
  IDeclaration,
  DOWNLOAD_STATUS,
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
  getPreviousOperationDateByOperationType,
  getSortedItems
} from '@client/views/OfficeHome/utils'
import {
  IconWithName,
  IconWithNameEvent,
  NoNameContainer,
  NameContainer
} from '@client/views/OfficeHome/components'
import { WQContentWrapper } from '@client/views/OfficeHome/WQContentWrapper'
import { Scope, SCOPES } from '@opencrvs/commons/client'
import { RegStatus } from '@client/utils/gateway'
import { useState } from 'react'
import { useWindowSize } from '@opencrvs/components/lib/hooks'
import * as routes from '@client/navigation/routes'
import { useNavigate } from 'react-router-dom'

interface IBaseRejectTabProps {
  theme: ITheme
  outboxDeclarations: IDeclaration[]
  queryData: {
    data: GQLEventSearchResultSet
  }
  scope: Scope[] | null
  paginationId: number
  pageSize: number
  onPageChange: (newPageNumber: number) => void
  loading?: boolean
  error?: boolean
}

type IRejectTabProps = IntlShapeProps & IBaseRejectTabProps

function RequiresUpdateComponent(props: IRejectTabProps) {
  const navigate = useNavigate()

  const { width } = useWindowSize()
  const [sortedCol, setSortedCol] = useState<COLUMNS>(COLUMNS.SENT_FOR_UPDATES)
  const [sortOrder, setSortOrder] = useState<SORT_ORDER>(SORT_ORDER.ASCENDING)

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
    if (width > props.theme.grid.breakpoints.lg) {
      return [
        {
          width: 30,
          label: props.intl.formatMessage(constantsMessages.name),
          key: COLUMNS.ICON_WITH_NAME,
          isSorted: sortedCol === COLUMNS.NAME,
          sortFunction: onColumnClick
        },
        {
          label: props.intl.formatMessage(constantsMessages.event),
          width: 16,
          key: COLUMNS.EVENT,
          isSorted: sortedCol === COLUMNS.EVENT,
          sortFunction: onColumnClick
        },
        {
          label: props.intl.formatMessage(constantsMessages.eventDate),
          width: 18,
          key: COLUMNS.DATE_OF_EVENT,
          isSorted: sortedCol === COLUMNS.DATE_OF_EVENT,
          sortFunction: onColumnClick
        },
        {
          label: props.intl.formatMessage(constantsMessages.sentForUpdates),
          width: 18,
          key: COLUMNS.SENT_FOR_UPDATES,
          isSorted: sortedCol === COLUMNS.SENT_FOR_UPDATES,
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
          label: props.intl.formatMessage(constantsMessages.name),
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

  const transformRejectedContent = (data: GQLEventSearchResultSet) => {
    const { intl } = props
    if (!data || !data.results) {
      return []
    }

    const validateScopes = [
      SCOPES.RECORD_REGISTER,
      SCOPES.RECORD_SUBMIT_FOR_APPROVAL,
      SCOPES.RECORD_SUBMIT_FOR_UPDATES
    ] as Scope[]

    const isReviewer = props.scope?.some((x) => validateScopes.includes(x))

    const transformedData = transformData(data, props.intl)
    const items = transformedData.map((reg, index) => {
      const actions = [] as IAction[]
      const foundDeclaration = props.outboxDeclarations.find(
        (declaration) => declaration.id === reg.id
      )
      const downloadStatus = foundDeclaration?.downloadStatus
      const isDuplicate = reg.duplicates && reg.duplicates.length > 0

      if (downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED) {
        if (width > props.theme.grid.breakpoints.lg && isReviewer) {
          actions.push({
            label: props.intl.formatMessage(buttonMessages.update),
            handler: () => {},
            disabled: true
          })
        }
      } else {
        if (width > props.theme.grid.breakpoints.lg && isReviewer) {
          actions.push({
            label: props.intl.formatMessage(buttonMessages.update),
            handler: (
              e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined
            ) => {
              if (e) {
                e.stopPropagation()
              }

              navigate(
                generateGoToPageUrl({
                  pageRoute: REVIEW_EVENT_PARENT_FORM_PAGE,
                  declarationId: reg.id,
                  pageId: 'review',
                  event: reg.event ? reg.event.toLowerCase() : ''
                })
              )
            }
          })
        }
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
            status={downloadStatus as DOWNLOAD_STATUS}
            declarationStatus={reg.declarationStatus as SUBMISSION_STATUS}
          />
        )
      })
      const event =
        (reg.event &&
          intl.formatMessage(
            dynamicConstantsMessages[reg.event.toLowerCase()]
          )) ||
        ''
      const sentForUpdates =
        getPreviousOperationDateByOperationType(
          reg.operationHistories,
          RegStatus.Rejected
        ) || ''

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
                tab: 'rejectTab',
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
                tab: 'rejectTab',
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
        event,
        name: reg.name && reg.name.toLowerCase(),
        iconWithName: (
          <IconWithName
            status={reg.declarationStatus}
            name={NameComponent}
            isDuplicate={isDuplicate}
          />
        ),
        iconWithNameEvent: (
          <IconWithNameEvent
            status={reg.declarationStatus}
            name={NameComponent}
            event={reg.event}
            isDuplicate={isDuplicate}
          />
        ),
        sentForUpdates,
        dateOfEvent,
        actions
      }
    })
    const sortedItems = getSortedItems(items, sortedCol, sortOrder)
    return sortedItems.map((item) => {
      return {
        ...item,
        dateOfEvent:
          item.dateOfEvent && formattedDuration(item.dateOfEvent as Date),
        sentForUpdates:
          item.sentForUpdates && formattedDuration(item.sentForUpdates as Date)
      }
    })
  }

  const totalPages = props.queryData.data.totalItems
    ? Math.ceil(props.queryData.data.totalItems / props.pageSize)
    : 0
  const isShowPagination =
    props.queryData.data.totalItems &&
    props.queryData.data.totalItems > props.pageSize
      ? true
      : false
  return (
    <WQContentWrapper
      title={props.intl.formatMessage(navigationMessages.requiresUpdate)}
      isMobileSize={width < props.theme.grid.breakpoints.lg}
      isShowPagination={isShowPagination}
      paginationId={props.paginationId}
      totalPages={totalPages}
      onPageChange={props.onPageChange}
      loading={props.loading}
      error={props.error}
      noResultText={props.intl.formatMessage(
        wqMessages.noRecordsRequireUpdates
      )}
      noContent={transformRejectedContent(props.queryData.data).length <= 0}
    >
      <Workqueue
        content={transformRejectedContent(props.queryData.data)}
        columns={getColumns()}
        loading={props.loading}
        sortOrder={sortOrder}
        hideLastBorder={!isShowPagination}
      />
    </WQContentWrapper>
  )
}

function mapStateToProps(state: IStoreState) {
  return {
    scope: getScope(state),
    outboxDeclarations: state.declarationsState.declarations
  }
}

export const RequiresUpdate = connect(mapStateToProps)(
  injectIntl(withTheme(RequiresUpdateComponent))
)
