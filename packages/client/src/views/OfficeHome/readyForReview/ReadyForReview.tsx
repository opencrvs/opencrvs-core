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
import { goToDeclarationRecordAudit, goToPage } from '@client/navigation'
import { REVIEW_EVENT_PARENT_FORM_PAGE } from '@client/navigation/routes'
import { getScope } from '@client/profile/profileSelectors'
import { transformData } from '@client/search/transformer'
import { IStoreState } from '@client/store'
import styled, { ITheme } from '@client/styledComponents'
import { Scope, hasRegisterScope } from '@client/utils/authUtils'
import {
  ColumnContentAlignment,
  GridTable,
  IAction,
  COLUMNS,
  SORT_ORDER
} from '@opencrvs/components/lib/interface'
import { GQLEventSearchResultSet } from '@opencrvs/gateway/src/graphql/schema'
import * as React from 'react'
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
import { Action } from '@client/forms'
import { DownloadButton } from '@client/components/interface/DownloadButton'
import { withTheme } from 'styled-components'
import { formattedDuration } from '@client/utils/date-formatting'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import {
  IconWithName,
  IconWithNameEvent,
  NoNameContainer,
  NameContainer
} from '@client/views/OfficeHome/components'
import {
  changeSortedColumn,
  getSortedItems
} from '@client/views/OfficeHome/utils'
import { WQContentWrapper } from '@client/views/OfficeHome/WQContentWrapper'
import { IDynamicValues } from '@opencrvs/components/lib/interface/GridTable/types'
import { useState } from 'react'

const ToolTipContainer = styled.span`
  text-align: center;
`
interface IBaseReviewTabProps {
  theme: ITheme
  scope: Scope | null
  goToPage: typeof goToPage
  goToDeclarationRecordAudit: typeof goToDeclarationRecordAudit
  outboxDeclarations: IDeclaration[]
  queryData: {
    data: GQLEventSearchResultSet
  }
  paginationId: number
  pageSize: number
  onPageChange: (newPageNumber: number) => void
  loading?: boolean
  error?: boolean
  viewPortWidth: number
}

type IReviewTabProps = IntlShapeProps & IBaseReviewTabProps

const ReadyForReviewComponent = (props: IReviewTabProps) => {
  const [sortedCol, setSortedCol] = useState<COLUMNS>(COLUMNS.SENT_FOR_REVIEW)
  const [sortOrder, setSortOrder] = useState<SORT_ORDER>(SORT_ORDER.DESCENDING)

  const userHasRegisterScope = () => {
    return props.scope && hasRegisterScope(props.scope)
  }

  const onColumnClick = (columnName: string) => {
    const { newSortedCol, newSortOrder } = changeSortedColumn(
      columnName,
      sortedCol,
      sortOrder
    )
    setSortOrder(newSortOrder)
    setSortedCol(newSortedCol)
  }

  const transformDeclaredContent = (data: GQLEventSearchResultSet) => {
    const { intl } = props
    if (!data || !data.results) {
      return []
    }
    const transformedData = transformData(data, props.intl)
    const items: IDynamicValues[] = transformedData.map((reg, index) => {
      const actions = [] as IAction[]
      const foundDeclaration = props.outboxDeclarations.find(
        (declaration) => declaration.id === reg.id
      )
      const downloadStatus = foundDeclaration?.downloadStatus
      const isDuplicate = reg.duplicates && reg.duplicates.length > 0

      if (downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED) {
        if (props.viewPortWidth > props.theme.grid.breakpoints.lg) {
          actions.push({
            label: props.intl.formatMessage(constantsMessages.review),
            handler: () => {},
            disabled: true
          })
        }
      } else {
        if (props.viewPortWidth > props.theme.grid.breakpoints.lg) {
          actions.push({
            label: props.intl.formatMessage(constantsMessages.review),
            handler: (
              e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined
            ) => {
              e && e.stopPropagation()
              props.goToPage(
                REVIEW_EVENT_PARENT_FORM_PAGE,
                reg.id,
                'review',
                reg.event ? reg.event.toLowerCase() : ''
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
              action: Action.LOAD_REVIEW_DECLARATION,
              assignment: reg.assignment
            }}
            key={`DownloadButton-${index}`}
            status={downloadStatus as DOWNLOAD_STATUS}
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
        userHasRegisterScope()
          ? true
          : false
      const dateOfEvent =
        (reg.dateOfEvent &&
          reg.dateOfEvent.length > 0 &&
          new Date(reg.dateOfEvent)) ||
        ''
      const createdAt = (reg.createdAt && parseInt(reg.createdAt)) || ''
      const NameComponent = reg.name ? (
        <NameContainer
          id={`name_${index}`}
          isBoldLink={true}
          onClick={() => props.goToDeclarationRecordAudit('reviewTab', reg.id)}
        >
          {reg.name}
        </NameContainer>
      ) : (
        <NoNameContainer
          id={`name_${index}`}
          onClick={() => props.goToDeclarationRecordAudit('reviewTab', reg.id)}
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
          item.sentForReview && formattedDuration(item.sentForReview as number)
      }
    })
  }

  const getColumns = () => {
    if (props.viewPortWidth > props.theme.grid.breakpoints.lg) {
      return [
        {
          label: props.intl.formatMessage(constantsMessages.name),
          width: 30,
          key: COLUMNS.ICON_WITH_NAME,
          sortFunction: onColumnClick,
          isSorted: sortedCol === COLUMNS.NAME
        },
        {
          label: props.intl.formatMessage(constantsMessages.event),
          width: 16,
          key: COLUMNS.EVENT,
          sortFunction: onColumnClick,
          isSorted: sortedCol === COLUMNS.EVENT
        },
        {
          label: props.intl.formatMessage(constantsMessages.eventDate),
          width: 18,
          key: COLUMNS.DATE_OF_EVENT,
          sortFunction: onColumnClick,
          isSorted: sortedCol === COLUMNS.DATE_OF_EVENT
        },
        {
          label: props.intl.formatMessage(constantsMessages.sentForReview),
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

  const { intl, queryData, paginationId, pageSize, onPageChange } = props
  const { data } = queryData
  const totalPages = props.queryData?.data?.totalItems
    ? Math.ceil(props.queryData.data.totalItems / pageSize)
    : 0
  const isShowPagination =
    props.queryData?.data?.totalItems &&
    props.queryData.data.totalItems > pageSize
      ? true
      : false
  return (
    <WQContentWrapper
      title={intl.formatMessage(navigationMessages.readyForReview)}
      isMobileSize={
        props.viewPortWidth < props.theme.grid.breakpoints.lg ? true : false
      }
      isShowPagination={isShowPagination}
      paginationId={paginationId}
      totalPages={totalPages}
      onPageChange={onPageChange}
      loading={props.loading}
      error={props.error}
      noResultText={intl.formatMessage(wqMessages.noRecordsReadyForReview)}
      noContent={transformDeclaredContent(data).length <= 0}
    >
      <ReactTooltip id="validateTooltip">
        <ToolTipContainer>
          {props.intl.formatMessage(
            messages.validatedDeclarationTooltipForRegistrar
          )}
        </ToolTipContainer>
      </ReactTooltip>
      <GridTable
        content={transformDeclaredContent(data)}
        columns={getColumns()}
        loading={props.loading}
        sortOrder={sortOrder}
        sortedCol={sortedCol}
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

export const ReadyForReview = connect(mapStateToProps, {
  goToPage,
  goToDeclarationRecordAudit
})(injectIntl(withTheme(ReadyForReviewComponent)))
