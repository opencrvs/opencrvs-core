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
import {
  IDeclaration,
  DOWNLOAD_STATUS,
  SUBMISSION_STATUS
} from '@client/declarations'
import {
  constantsMessages,
  dynamicConstantsMessages,
  wqMessages
} from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/registrarHome'
import { formatUrl } from '@client/navigation'
import { getScope } from '@client/profile/profileSelectors'
import { transformData } from '@client/search/transformer'
import { IStoreState } from '@client/store'
import styled, { withTheme } from 'styled-components'
import { ITheme } from '@opencrvs/components/lib/theme'
import {
  Workqueue,
  COLUMNS,
  SORT_ORDER,
  ColumnContentAlignment,
  IAction
} from '@opencrvs/components/lib/Workqueue'
import type { GQLEventSearchResultSet } from '@client/utils/gateway-deprecated-do-not-use'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import ReactTooltip from 'react-tooltip'
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
import { DownloadButton } from '@client/components/interface/DownloadButton'
import { DownloadAction } from '@client/forms'
import { Scope, SCOPES } from '@opencrvs/commons/client'
import { RegStatus } from '@client/utils/gateway'
import { useState } from 'react'
import { useWindowSize } from '@opencrvs/components/src/hooks'
import * as routes from '@client/navigation/routes'
import { useNavigate } from 'react-router-dom'

const ToolTipContainer = styled.span`
  text-align: center;
`
interface IBaseApprovalTabProps {
  theme: ITheme
  outboxDeclarations: IDeclaration[]
  scope: Scope[] | null
  queryData: {
    data: GQLEventSearchResultSet
  }
  paginationId: number
  pageSize: number
  onPageChange: (newPageNumber: number) => void
  loading?: boolean
  error?: boolean
}

type IApprovalTabProps = IntlShapeProps & IBaseApprovalTabProps

function SentForReviewComponent(props: IApprovalTabProps) {
  const navigate = useNavigate()
  const { width } = useWindowSize()
  const [sortedCol, setSortedCol] = useState(COLUMNS.SENT_FOR_APPROVAL)
  const [sortOrder, setSortOrder] = useState(SORT_ORDER.DESCENDING)

  const canSendForApproval = props.scope?.includes(
    SCOPES.RECORD_SUBMIT_FOR_APPROVAL
  )

  const onColumnClick = (columnName: string) => {
    const { newSortedCol, newSortOrder } = changeSortedColumn(
      columnName,
      sortedCol,
      sortOrder
    )
    setSortOrder(newSortOrder)
    setSortedCol(newSortedCol)
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
          label: canSendForApproval
            ? props.intl.formatMessage(navigationMessages.approvals)
            : props.intl.formatMessage(navigationMessages.sentForReview),
          width: 18,
          key: COLUMNS.SENT_FOR_APPROVAL,
          isSorted: sortedCol === COLUMNS.SENT_FOR_APPROVAL,
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

  const transformValidatedContent = (data: GQLEventSearchResultSet) => {
    const { intl } = props
    if (!data || !data.results) {
      return []
    }
    const transformedData = transformData(data, props.intl)
    const items = transformedData.map((reg, index) => {
      const actions = [] as IAction[]
      const foundDeclaration = props.outboxDeclarations.find(
        (declaration) => declaration.id === reg.id
      )
      const downloadStatus =
        (foundDeclaration && foundDeclaration.downloadStatus) || undefined

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

      let sentForApproval
      if (!canSendForApproval) {
        sentForApproval =
          getPreviousOperationDateByOperationType(
            reg.operationHistories,
            RegStatus.CorrectionRequested
          ) ||
          getPreviousOperationDateByOperationType(
            reg.operationHistories,
            RegStatus.Declared
          ) ||
          getPreviousOperationDateByOperationType(
            reg.operationHistories,
            RegStatus.InProgress
          ) ||
          ''
      } else {
        sentForApproval =
          getPreviousOperationDateByOperationType(
            reg.operationHistories,
            RegStatus.Validated
          ) ||
          getPreviousOperationDateByOperationType(
            reg.operationHistories,
            RegStatus.CorrectionRequested
          ) ||
          ''
      }

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
                tab: canSendForApproval ? 'approvalTab' : 'reviewTab',
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
                tab: canSendForApproval ? 'approvalTab' : 'reviewTab',
                declarationId: reg.id
              })
            )
          }
        >
          {intl.formatMessage(constantsMessages.noNameProvided)}
        </NoNameContainer>
      )
      const isDuplicate = reg.duplicates && reg.duplicates.length > 0

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
            event={event}
            isDuplicate={isDuplicate}
          />
        ),
        eventTimeElapsed:
          (reg.dateOfEvent?.length &&
            formattedDuration(new Date(reg.dateOfEvent))) ||
          '',
        dateOfEvent,
        sentForApproval,
        actions
      }
    })
    const sortedItems = getSortedItems(items, sortedCol, sortOrder)
    return sortedItems.map((item) => {
      return {
        ...item,
        dateOfEvent:
          item.dateOfEvent && formattedDuration(item.dateOfEvent as Date),
        sentForApproval:
          item.sentForApproval &&
          formattedDuration(item.sentForApproval as Date)
      }
    })
  }

  // Approval tab for registration clerk and registrar
  // Review tab for field agent
  const { intl, queryData, paginationId, pageSize, onPageChange } = props
  const { data } = queryData
  const totalPages = props.queryData.data.totalItems
    ? Math.ceil(props.queryData.data.totalItems / pageSize)
    : 0
  const isShowPagination =
    props.queryData.data.totalItems &&
    props.queryData.data.totalItems > pageSize
      ? true
      : false
  const noResultText = canSendForApproval
    ? intl.formatMessage(wqMessages.noRecordsSentForApproval)
    : intl.formatMessage(wqMessages.noRecordsSentForReview)
  const title = canSendForApproval
    ? intl.formatMessage(navigationMessages.approvals)
    : intl.formatMessage(navigationMessages.sentForReview)
  return (
    <WQContentWrapper
      title={title}
      isMobileSize={width < props.theme.grid.breakpoints.lg}
      isShowPagination={isShowPagination}
      paginationId={paginationId}
      totalPages={totalPages}
      onPageChange={onPageChange}
      noResultText={noResultText}
      loading={props.loading}
      error={props.error}
      noContent={transformValidatedContent(data).length <= 0}
    >
      <ReactTooltip id="validatedTooltip">
        <ToolTipContainer>
          {props.intl.formatMessage(
            messages.validatedDeclarationTooltipForRegistrationAgent
          )}
        </ToolTipContainer>
      </ReactTooltip>
      <Workqueue
        content={transformValidatedContent(data)}
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

export const SentForReview = connect(mapStateToProps)(
  injectIntl(withTheme(SentForReviewComponent))
)
