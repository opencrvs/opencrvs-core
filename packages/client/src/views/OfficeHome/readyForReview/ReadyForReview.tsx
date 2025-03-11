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
import {
  REVIEW_CORRECTION,
  REVIEW_EVENT_PARENT_FORM_PAGE
} from '@client/navigation/routes'
import { getScope } from '@client/profile/profileSelectors'
import { transformData } from '@client/search/transformer'
import { IStoreState } from '@client/store'
import { ITheme } from '@opencrvs/components/lib/theme'
import {
  ColumnContentAlignment,
  Workqueue,
  COLUMNS,
  SORT_ORDER,
  IAction
} from '@opencrvs/components/lib/Workqueue'
import type { GQLEventSearchResultSet } from '@client/utils/gateway-deprecated-do-not-use'
import React, { useState } from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import ReactTooltip from 'react-tooltip'
import {
  constantsMessages,
  dynamicConstantsMessages,
  wqMessages
} from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/registrarHome'
import {
  IDeclaration,
  DOWNLOAD_STATUS,
  SUBMISSION_STATUS
} from '@client/declarations'
import { DownloadAction } from '@client/forms'
import { DownloadButton } from '@client/components/interface/DownloadButton'
import styled, { withTheme } from 'styled-components'
import {
  formattedDuration,
  plainDateToLocalDate
} from '@client/utils/date-formatting'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import {
  IconWithName,
  IconWithNameEvent,
  NoNameContainer,
  NameContainer
} from '@client/views/OfficeHome/components'
import {
  changeSortedColumn,
  getPreviousOperationDateByOperationType,
  getSortedItems
} from '@client/views/OfficeHome/utils'
import { WQContentWrapper } from '@client/views/OfficeHome/WQContentWrapper'
import { SCOPES } from '@opencrvs/commons/client'
import { RegStatus } from '@client/utils/gateway'
import { useWindowSize } from '@opencrvs/components/lib/hooks'
import { usePermissions } from '@client/hooks/useAuthorization'
import * as routes from '@client/navigation/routes'
import { useNavigate } from 'react-router-dom'

const ToolTipContainer = styled.span`
  text-align: center;
`
interface IBaseReviewTabProps {
  theme: ITheme
  outboxDeclarations: IDeclaration[]
  queryData: {
    data: GQLEventSearchResultSet
  }
  paginationId: number
  pageSize: number
  onPageChange: (newPageNumber: number) => void
  loading?: boolean
  error?: boolean
}

type IReviewTabProps = IntlShapeProps & IBaseReviewTabProps

const ReadyForReviewComponent = ({
  theme,
  outboxDeclarations,
  queryData,
  paginationId,
  onPageChange,
  loading,
  pageSize = 10,
  error,
  intl
}: IReviewTabProps) => {
  const navigate = useNavigate()
  const { width } = useWindowSize()
  const [sortedCol, setSortedCol] = useState(COLUMNS.SENT_FOR_REVIEW)
  const [sortOrder, setSortOrder] = useState(SORT_ORDER.DESCENDING)
  const { hasScope } = usePermissions()

  const onColumnClick = (columnName: string) => {
    const { newSortedCol, newSortOrder } = changeSortedColumn(
      columnName,
      sortedCol,
      sortOrder
    )
    setSortedCol(newSortedCol)
    setSortOrder(newSortOrder)
  }

  const transformDeclaredContent = (data: GQLEventSearchResultSet) => {
    if (!data || !data.results) {
      return []
    }
    const transformedData = transformData(data, intl)
    const items = transformedData.map((reg, index) => {
      const actions = [] as IAction[]
      const foundDeclaration = outboxDeclarations.find(
        (declaration) => declaration.id === reg.id
      )
      const downloadStatus = foundDeclaration?.downloadStatus
      const isDuplicate = reg.duplicates && reg.duplicates.length > 0

      if (downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED) {
        if (width > theme.grid.breakpoints.lg) {
          actions.push({
            label: intl.formatMessage(constantsMessages.review),
            handler: () => {},
            disabled: true
          })
        }
      } else {
        if (width > theme.grid.breakpoints.lg) {
          actions.push({
            label: intl.formatMessage(constantsMessages.review),
            handler: (
              e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined
            ) => {
              if (e) {
                e.stopPropagation()
              }

              navigate(
                generateGoToPageUrl({
                  pageRoute:
                    reg.declarationStatus === 'CORRECTION_REQUESTED'
                      ? REVIEW_CORRECTION
                      : REVIEW_EVENT_PARENT_FORM_PAGE,
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
              assignment:
                foundDeclaration?.assignmentStatus ??
                reg.assignment ??
                undefined
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
      const isValidatedOnReview =
        reg.declarationStatus === SUBMISSION_STATUS.VALIDATED &&
        hasScope(SCOPES.RECORD_REGISTER)
      const dateOfEvent =
        (reg.dateOfEvent &&
          reg.dateOfEvent.length > 0 &&
          plainDateToLocalDate(reg.dateOfEvent)) ||
        ''
      const createdAt =
        getPreviousOperationDateByOperationType(
          reg.operationHistories,
          RegStatus.Declared
        ) ||
        getPreviousOperationDateByOperationType(
          reg.operationHistories,
          RegStatus.Validated
        ) ||
        getPreviousOperationDateByOperationType(
          reg.operationHistories,
          RegStatus.CorrectionRequested
        ) ||
        ''
      const NameComponent = reg.name ? (
        <NameContainer
          id={`name_${index}`}
          onClick={() =>
            navigate(
              formatUrl(routes.DECLARATION_RECORD_AUDIT, {
                tab: 'reviewTab',
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
                tab: 'reviewTab',
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
        dateOfEvent,
        sentForReview: createdAt,
        name: reg.name && reg.name.toLowerCase(),
        iconWithName: (
          <IconWithName
            status={reg.declarationStatus}
            name={NameComponent}
            isDuplicate={isDuplicate}
            isValidatedOnReview={isValidatedOnReview}
          />
        ),
        iconWithNameEvent: (
          <IconWithNameEvent
            status={reg.declarationStatus}
            name={NameComponent}
            event={event}
            isValidatedOnReview={isValidatedOnReview}
            isDuplicate={isDuplicate}
          />
        ),
        actions
      }
    })
    const sortedItems = getSortedItems(items, sortedCol, sortOrder)
    return sortedItems.map((item) => {
      return {
        ...item,
        dateOfEvent:
          item.dateOfEvent && formattedDuration(item.dateOfEvent as Date),
        sentForReview:
          item.sentForReview && formattedDuration(item.sentForReview as any)
      }
    })
  }

  const getColumns = () => {
    if (width > theme.grid.breakpoints.lg) {
      return [
        {
          label: intl.formatMessage(constantsMessages.name),
          width: 30,
          key: COLUMNS.ICON_WITH_NAME,
          sortFunction: onColumnClick,
          isSorted: sortedCol === COLUMNS.NAME
        },
        {
          label: intl.formatMessage(constantsMessages.event),
          width: 16,
          key: COLUMNS.EVENT,
          sortFunction: onColumnClick,
          isSorted: sortedCol === COLUMNS.EVENT
        },
        {
          label: intl.formatMessage(constantsMessages.eventDate),
          width: 18,
          key: COLUMNS.DATE_OF_EVENT,
          sortFunction: onColumnClick,
          isSorted: sortedCol === COLUMNS.DATE_OF_EVENT
        },
        {
          label: intl.formatMessage(constantsMessages.sentForReview),
          width: 18,
          key: COLUMNS.SENT_FOR_REVIEW,
          sortFunction: onColumnClick,
          isSorted: sortedCol === COLUMNS.SENT_FOR_REVIEW
        },
        {
          width: 18,
          key: COLUMNS.ACTIONS,
          isActionColumn: true,
          alignment: ColumnContentAlignment.RIGHT
        }
      ]
    } else {
      return [
        {
          label: intl.formatMessage(constantsMessages.name),
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

  const { data } = queryData
  const totalPages = queryData.data.totalItems
    ? Math.ceil(queryData.data.totalItems / pageSize)
    : 0
  const isShowPagination =
    queryData.data.totalItems && queryData.data.totalItems > pageSize
      ? true
      : false
  return (
    <WQContentWrapper
      title={intl.formatMessage(navigationMessages.readyForReview)}
      isMobileSize={width < theme.grid.breakpoints.lg ? true : false}
      isShowPagination={isShowPagination}
      paginationId={paginationId}
      totalPages={totalPages}
      onPageChange={onPageChange}
      loading={loading}
      error={error}
      noResultText={intl.formatMessage(wqMessages.noRecordsReadyForReview)}
      noContent={transformDeclaredContent(data).length <= 0}
    >
      <ReactTooltip id="validateTooltip">
        <ToolTipContainer>
          {intl.formatMessage(messages.validatedDeclarationTooltipForRegistrar)}
        </ToolTipContainer>
      </ReactTooltip>
      <Workqueue
        content={transformDeclaredContent(data)}
        columns={getColumns()}
        loading={loading}
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

export const ReadyForReview = connect(mapStateToProps)(
  injectIntl(withTheme(ReadyForReviewComponent))
)
