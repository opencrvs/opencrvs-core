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

import {
  goToDeclarationRecordAudit,
  goToPrintCertificate
} from '@client/navigation'
import { transformData } from '@client/search/transformer'
import { ITheme } from '@client/styledComponents'
import {
  ColumnContentAlignment,
  GridTable,
  IAction,
  SORT_ORDER,
  COLUMNS
} from '@opencrvs/components/lib/interface'
import { GQLEventSearchResultSet } from '@opencrvs/gateway/src/graphql/schema'
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
import { IStoreState } from '@client/store'
import { IDeclaration, DOWNLOAD_STATUS } from '@client/declarations'
import { DownloadAction } from '@client/forms'
import { DownloadButton } from '@client/components/interface/DownloadButton'
import { formattedDuration } from '@client/utils/date-formatting'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import {
  changeSortedColumn,
  getDownloadStatus,
  getSortedItems
} from '@client/views/OfficeHome/utils'
import {
  IconWithName,
  IconWithNameEvent,
  NoNameContainer,
  NameContainer
} from '@client/views/OfficeHome/components'
import { WQContentWrapper } from '@client/views/OfficeHome/WQContentWrapper'

interface IBasePrintTabProps {
  theme: ITheme
  goToPrintCertificate: typeof goToPrintCertificate
  goToDeclarationRecordAudit: typeof goToDeclarationRecordAudit
  outboxDeclarations: IDeclaration[]
  queryData: {
    data: GQLEventSearchResultSet
  }
  paginationId: number
  onPageChange: (newPageNumber: number) => void
  loading?: boolean
  error?: boolean
  pageSize: number
  userId?: string
}

interface IPrintTabState {
  width: number
  sortedCol: COLUMNS
  sortOrder: SORT_ORDER
}

type IPrintTabProps = IntlShapeProps & IBasePrintTabProps

class ReadyToPrintComponent extends React.Component<
  IPrintTabProps,
  IPrintTabState
> {
  constructor(props: IPrintTabProps) {
    super(props)
    this.state = {
      width: window.innerWidth,
      sortedCol: COLUMNS.REGISTERED,
      sortOrder: SORT_ORDER.DESCENDING
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.recordWindowWidth)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.recordWindowWidth)
  }

  recordWindowWidth = () => {
    this.setState({ width: window.innerWidth })
  }

  getExpandable = () => {
    return this.state.width > this.props.theme.grid.breakpoints.lg
      ? true
      : false
  }

  onColumnClick = (columnName: string) => {
    const { newSortedCol, newSortOrder } = changeSortedColumn(
      columnName,
      this.state.sortedCol,
      this.state.sortOrder
    )
    this.setState({
      sortOrder: newSortOrder,
      sortedCol: newSortedCol
    })
  }

  getColumns = () => {
    if (this.state.width > this.props.theme.grid.breakpoints.lg) {
      return [
        {
          width: 30,
          label: this.props.intl.formatMessage(constantsMessages.name),
          key: COLUMNS.ICON_WITH_NAME,
          isSorted: this.state.sortedCol === COLUMNS.NAME,
          sortFunction: this.onColumnClick
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.event),
          width: 16,
          key: COLUMNS.EVENT,
          isSorted: this.state.sortedCol === COLUMNS.EVENT,
          sortFunction: this.onColumnClick
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.eventDate),
          width: 18,
          key: COLUMNS.DATE_OF_EVENT,
          isSorted: this.state.sortedCol === COLUMNS.DATE_OF_EVENT,
          sortFunction: this.onColumnClick
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.registered),
          width: 18,
          key: COLUMNS.REGISTERED,
          isSorted: this.state.sortedCol === COLUMNS.REGISTERED,
          sortFunction: this.onColumnClick
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
          label: this.props.intl.formatMessage(constantsMessages.name),
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

  transformRegisteredContent = (data: GQLEventSearchResultSet) => {
    const { intl, userId } = this.props
    if (!data || !data.results) {
      return []
    }

    const transformedData = transformData(data, this.props.intl)
    const items = transformedData.map((reg, index) => {
      const foundDeclaration = this.props.outboxDeclarations.find(
        (declaration) => declaration.id === reg.id
      )
      const actions: IAction[] = []
      const downloadStatus = getDownloadStatus(
        reg.assignment?.userId as string,
        foundDeclaration,
        userId
      )

      if (this.state.width > this.props.theme.grid.breakpoints.lg) {
        actions.push({
          label: this.props.intl.formatMessage(buttonMessages.print),
          disabled: downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED,
          handler: (
            e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined
          ) => {
            e && e.stopPropagation()
            if (downloadStatus === DOWNLOAD_STATUS.DOWNLOADED) {
              this.props.goToPrintCertificate(
                reg.id,
                reg.event.toLocaleLowerCase() || ''
              )
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
              assignment: reg.assignment
            }}
            key={`DownloadButton-${index}`}
            status={downloadStatus}
          />
        )
      })
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
      const registered =
        (reg.modifiedAt && Number.isNaN(Number(reg.modifiedAt))
          ? new Date(reg.modifiedAt)
          : new Date(Number(reg.modifiedAt))) || ''
      const NameComponent = reg.name ? (
        <NameContainer
          id={`name_${index}`}
          isBoldLink={true}
          onClick={() =>
            this.props.goToDeclarationRecordAudit('printTab', reg.id)
          }
        >
          {reg.name}
        </NameContainer>
      ) : (
        <NoNameContainer
          id={`name_${index}`}
          onClick={() =>
            this.props.goToDeclarationRecordAudit('printTab', reg.id)
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
          <IconWithName status={reg.declarationStatus} name={NameComponent} />
        ),
        iconWithNameEvent: (
          <IconWithNameEvent
            status={reg.declarationStatus}
            name={NameComponent}
            event={event}
          />
        ),
        dateOfEvent,
        registered,
        actions
      }
    })
    const sortedItems = getSortedItems(
      items,
      this.state.sortedCol,
      this.state.sortOrder
    )

    return sortedItems.map((item) => {
      return {
        ...item,
        dateOfEvent:
          item.dateOfEvent && formattedDuration(item.dateOfEvent as Date),
        registered:
          item.registered && formattedDuration(item.registered as Date)
      }
    })
  }

  render() {
    const { intl, queryData, paginationId, onPageChange, pageSize } = this.props
    const { data } = queryData
    const totalPages = this.props.queryData.data.totalItems
      ? Math.ceil(this.props.queryData.data.totalItems / pageSize)
      : 0
    const isShowPagination =
      this.props.queryData.data.totalItems &&
      this.props.queryData.data.totalItems > pageSize
        ? true
        : false
    return (
      <WQContentWrapper
        title={intl.formatMessage(navigationMessages.print)}
        isMobileSize={this.state.width < this.props.theme.grid.breakpoints.lg}
        isShowPagination={isShowPagination}
        paginationId={paginationId}
        totalPages={totalPages}
        onPageChange={onPageChange}
        loading={this.props.loading}
        error={this.props.error}
        noResultText={intl.formatMessage(wqMessages.noRecordsReadyToPrint)}
        noContent={this.transformRegisteredContent(data).length <= 0}
      >
        <GridTable
          content={this.transformRegisteredContent(data)}
          columns={this.getColumns()}
          loading={this.props.loading}
          sortOrder={this.state.sortOrder}
          sortedCol={this.state.sortedCol}
          hideLastBorder={!isShowPagination}
        />
      </WQContentWrapper>
    )
  }
}

function mapStateToProps(state: IStoreState) {
  return {
    outboxDeclarations: state.declarationsState.declarations,
    userId: state.profile.userDetails?.userMgntUserID
  }
}

export const ReadyToPrint = connect(mapStateToProps, {
  goToPrintCertificate,
  goToDeclarationRecordAudit
})(injectIntl(withTheme(ReadyToPrintComponent)))
