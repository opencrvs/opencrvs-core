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
import * as React from 'react'
import {
  GridTable,
  COLUMNS,
  SORT_ORDER
} from '@opencrvs/components/lib/interface'
import { ITheme, withTheme } from '@client/styledComponents'
import { GQLEventSearchResultSet } from '@opencrvs/gateway/src/graphql/schema'
import { transformData } from '@client/search/transformer'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import {
  dynamicConstantsMessages,
  constantsMessages
} from '@client/i18n/messages'
import { connect } from 'react-redux'
import { goToPage, goToDeclarationRecordAudit } from '@client/navigation'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { formattedDuration } from '@client/utils/date-formatting'
import {
  getSortedItems,
  changeSortedColumn
} from '@client/views/OfficeHome/utils'
import {
  IconWithName,
  IconWithNameEvent
} from '@client/views/OfficeHome/components'
import { WQContentWrapper } from '@client/views/OfficeHome/WQContentWrapper'

const { useState, useEffect } = React

interface IBaseProps {
  theme: ITheme
  queryData: {
    data: GQLEventSearchResultSet
  }
  paginationId: number
  pageSize: number
  onPageChange: (newPageNumber: number) => void
  loading?: boolean
  error?: boolean
}

interface IDispatchProps {
  goToPage: typeof goToPage
  goToDeclarationRecordAudit: typeof goToDeclarationRecordAudit
}

type IProps = IBaseProps & IntlShapeProps & IDispatchProps

function InExternalValidationComponent(props: IProps) {
  const [sortedCol, setSortedCOl] = React.useState<COLUMNS>(COLUMNS.NAME)
  const [sortOrder, setSortOrder] = React.useState<SORT_ORDER>(
    SORT_ORDER.ASCENDING
  )
  const [viewportWidth, setViewportWidth] = useState<number>(window.innerWidth)
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

  useEffect(() => {
    function recordWindowWidth() {
      setViewportWidth(window.innerWidth)
    }

    window.addEventListener('resize', recordWindowWidth)

    return () => window.removeEventListener('resize', recordWindowWidth)
  }, [])

  const onColumnClick = (columnName: string) => {
    const { newSortedCol, newSortOrder } = changeSortedColumn(
      columnName,
      sortedCol,
      sortOrder
    )
    setSortedCOl(newSortedCol)
    setSortOrder(newSortOrder)
  }

  const transformWaitingValidationContent = (data: GQLEventSearchResultSet) => {
    const { intl } = props
    if (!data || !data.results) {
      return []
    }
    const transformedData = transformData(data, props.intl)

    const items = transformedData.map((reg) => {
      const event =
        (reg.event &&
          intl.formatMessage(
            dynamicConstantsMessages[reg.event.toLowerCase()]
          )) ||
        ''
      const dateOfEvent =
        reg.dateOfEvent &&
        reg.dateOfEvent.length > 0 &&
        new Date(reg.dateOfEvent)
      const sentForValidation =
        (reg.modifiedAt && Number.isNaN(Number(reg.modifiedAt))
          ? new Date(reg.modifiedAt)
          : new Date(Number(reg.modifiedAt))) || ''
      return {
        ...reg,
        event,
        name: reg.name && reg.name.toLowerCase(),
        iconWithName: (
          <IconWithName status={reg.declarationStatus} name={reg.name} />
        ),
        iconWithNameEvent: (
          <IconWithNameEvent
            status={reg.declarationStatus}
            name={reg.name}
            event={event}
          />
        ),
        actions: [],
        dateOfEvent,
        sentForValidation,
        rowClickHandler: [
          {
            label: 'rowClickHandler',
            handler: () =>
              props.goToDeclarationRecordAudit('externalValidationTab', reg.id)
          }
        ]
      }
    })
    const sortedItems = getSortedItems(items, sortedCol, sortOrder)
    return sortedItems.map((item) => {
      return {
        ...item,
        dateOfEvent:
          item.dateOfEvent && formattedDuration(item.dateOfEvent as Date),
        sentForValidation:
          item.sentForValidation &&
          formattedDuration(item.sentForValidation as Date)
      }
    })
  }

  const columns =
    viewportWidth > props.theme.grid.breakpoints.lg
      ? [
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
            label: props.intl.formatMessage(constantsMessages.sentForReview),
            width: 18,
            key: COLUMNS.SENT_FOR_VALIDATION,
            isSorted: sortedCol === COLUMNS.SENT_FOR_VALIDATION,
            sortFunction: onColumnClick
          }
        ]
      : [
          {
            label: props.intl.formatMessage(constantsMessages.name),
            width: 90,
            key: COLUMNS.ICON_WITH_NAME_EVENT
          }
        ]

  return (
    <WQContentWrapper
      title={intl.formatMessage(navigationMessages.waitingValidation)}
      isMobileSize={viewportWidth < props.theme.grid.breakpoints.lg}
      isShowPagination={isShowPagination}
      paginationId={paginationId}
      totalPages={totalPages}
      onPageChange={onPageChange}
      noResultText={intl.formatMessage(constantsMessages.noRecords, {
        tab: 'in external validation '
      })}
      loading={props.loading}
      error={props.error}
      noContent={transformWaitingValidationContent(data).length <= 0}
    >
      <GridTable
        content={transformWaitingValidationContent(data)}
        clickable={true}
        loading={props.loading}
        columns={columns}
        sortOrder={sortOrder}
        sortedCol={sortedCol}
        hideLastBorder={!isShowPagination}
      />
    </WQContentWrapper>
  )
}

export const InExternalValidationTab = connect(null, {
  goToPage,
  goToDeclarationRecordAudit
})(injectIntl(withTheme(InExternalValidationComponent)))
