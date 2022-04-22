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
  ColumnContentAlignment,
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
import { messages } from '@client/i18n/messages/views/registrarHome'
import { connect } from 'react-redux'
import { goToPage, goToDeclarationRecordAudit } from '@client/navigation'
import { LoadingIndicator } from '@client/views/OfficeHome/LoadingIndicator'
import { formattedDuration } from '@client/utils/date-formatting'
import {
  Content,
  ContentSize
} from '@opencrvs/components/lib/interface/Content'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { officeHomeMessages } from '@client/i18n/messages/views/officeHome'
import {
  getSortedItems,
  changeSortedColumn
} from '@client/views/OfficeHome/tabs/utils'
import {
  IconWithName,
  IconWithNameEvent
} from '@client/views/OfficeHome/tabs/components'

const { useState, useEffect } = React

interface IBaseProps {
  theme: ITheme
  queryData: {
    data: GQLEventSearchResultSet
  }
  page: number
  onPageChange: (newPageNumber: number) => void
  showPaginated?: boolean
  loading?: boolean
  error?: boolean
}

interface IDispatchProps {
  goToPage: typeof goToPage
  goToDeclarationRecordAudit: typeof goToDeclarationRecordAudit
}

type IProps = IBaseProps & IntlShapeProps & IDispatchProps

function ExternalValidationTabComponent(props: IProps) {
  const pageSize = 10
  const [sortedCol, setSortedCOl] = React.useState<COLUMNS>(COLUMNS.NAME)
  const [sortOrder, setSortOrder] = React.useState<SORT_ORDER>(
    SORT_ORDER.ASCENDING
  )
  const [viewportWidth, setViewportWidth] = useState<number>(window.innerWidth)
  const { intl, queryData, page, onPageChange } = props
  const { data } = queryData

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
      const dateOfEvent = reg.dateOfEvent && new Date(reg.dateOfEvent)
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
            label: props.intl.formatMessage(constantsMessages.dateOfEvent),
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
    <Content
      size={ContentSize.LARGE}
      title={intl.formatMessage(navigationMessages.waitingValidation)}
    >
      <GridTable
        content={transformWaitingValidationContent(data)}
        noResultText={intl.formatMessage(constantsMessages.noResults)}
        onPageChange={onPageChange}
        clickable={true}
        loading={props.loading}
        columns={columns}
        sortOrder={sortOrder}
        sortedCol={sortedCol}
      />
      <LoadingIndicator
        loading={Boolean(props.loading)}
        hasError={Boolean(props.error)}
      />
    </Content>
  )
}

export const ExternalValidationTab = connect(null, {
  goToPage,
  goToDeclarationRecordAudit
})(injectIntl(withTheme(ExternalValidationTabComponent)))
