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
  goToPage,
  goToReviewDuplicate
} from '@client/navigation'
import { REVIEW_EVENT_PARENT_FORM_PAGE } from '@client/navigation/routes'
import { getScope } from '@client/profile/profileSelectors'
import { transformData } from '@client/search/transformer'
import { IStoreState } from '@client/store'
import { ITheme } from '@client/styledComponents'
import { Scope } from '@client/utils/authUtils'
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
import { withTheme } from 'styled-components'
import { LoadingIndicator } from '@client/views/OfficeHome/LoadingIndicator'
import {
  buttonMessages,
  constantsMessages,
  dynamicConstantsMessages
} from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/registrarHome'
import { IDeclaration, DOWNLOAD_STATUS } from '@client/declarations'
import { Action } from '@client/forms'
import { DownloadButton } from '@client/components/interface/DownloadButton'
import { formattedDuration } from '@client/utils/date-formatting'
import {
  Content,
  ContentSize
} from '@opencrvs/components/lib/interface/Content'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { officeHomeMessages } from '@client/i18n/messages/views/officeHome'
import {
  changeSortedColumn,
  getSortedItems
} from '@client/views/OfficeHome/tabs/utils'
import {
  IconWithName,
  IconWithNameEvent
} from '@client/views/OfficeHome/tabs/components'
import { Downloaded } from '@opencrvs/components/lib/icons/Downloaded'

interface IBaseRejectTabProps {
  theme: ITheme
  scope: Scope | null
  goToPage: typeof goToPage
  goToReviewDuplicate: typeof goToReviewDuplicate
  goToDeclarationRecordAudit: typeof goToDeclarationRecordAudit
  outboxDeclarations: IDeclaration[]
  queryData: {
    data: GQLEventSearchResultSet
  }
  page: number
  onPageChange: (newPageNumber: number) => void
  showPaginated?: boolean
  loading?: boolean
  error?: boolean
}

interface IRejectTabState {
  width: number
  sortedCol: COLUMNS
  sortOrder: SORT_ORDER
}

type IRejectTabProps = IntlShapeProps & IBaseRejectTabProps

class RejectTabComponent extends React.Component<
  IRejectTabProps,
  IRejectTabState
> {
  pageSize = 10
  constructor(props: IRejectTabProps) {
    super(props)
    this.state = {
      width: window.innerWidth,
      sortedCol: COLUMNS.NAME,
      sortOrder: SORT_ORDER.ASCENDING
    }
  }

  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
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
          label: this.props.intl.formatMessage(constantsMessages.dateOfEvent),
          width: 18,
          key: COLUMNS.DATE_OF_EVENT,
          isSorted: this.state.sortedCol === COLUMNS.DATE_OF_EVENT,
          sortFunction: this.onColumnClick
        },
        {
          label: this.props.intl.formatMessage(
            constantsMessages.sentForUpdates
          ),
          width: 18,
          key: COLUMNS.SENT_FOR_UPDATES,
          isSorted: this.state.sortedCol === COLUMNS.SENT_FOR_UPDATES,
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

  transformRejectedContent = (data: GQLEventSearchResultSet) => {
    const { intl } = this.props
    if (!data || !data.results) {
      return []
    }
    const transformedData = transformData(data, this.props.intl)
    const items = transformedData.map((reg, index) => {
      const actions = [] as IAction[]
      const foundDeclaration = this.props.outboxDeclarations.find(
        (declaration) => declaration.id === reg.id
      )
      const downloadStatus =
        (foundDeclaration && foundDeclaration.downloadStatus) || undefined
      const isDuplicate = reg.duplicates && reg.duplicates.length > 0

      if (downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED) {
        if (this.state.width > this.props.theme.grid.breakpoints.lg) {
          actions.push({
            label: this.props.intl.formatMessage(buttonMessages.update),
            handler: () => {},
            disabled: true
          })
        }
        actions.push({
          actionComponent: (
            <DownloadButton
              downloadConfigs={{
                event: reg.event,
                compositionId: reg.id,
                action: Action.LOAD_REVIEW_DECLARATION
              }}
              key={`DownloadButton-${index}`}
              status={downloadStatus as DOWNLOAD_STATUS}
            />
          )
        })
      } else {
        if (this.state.width > this.props.theme.grid.breakpoints.lg) {
          actions.push({
            label: this.props.intl.formatMessage(buttonMessages.update),
            handler: (
              e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined
            ) => {
              e && e.stopPropagation()
              isDuplicate
                ? this.props.goToReviewDuplicate(reg.id)
                : this.props.goToPage(
                    REVIEW_EVENT_PARENT_FORM_PAGE,
                    reg.id,
                    'review',
                    reg.event ? reg.event.toLowerCase() : ''
                  )
            }
          })
        }
        actions.push({
          actionComponent: <Downloaded />
        })
      }
      const event =
        (reg.event &&
          intl.formatMessage(
            dynamicConstantsMessages[reg.event.toLowerCase()]
          )) ||
        ''
      const sentForUpdates =
        (reg.modifiedAt && Number.isNaN(Number(reg.modifiedAt))
          ? new Date(reg.modifiedAt)
          : new Date(Number(reg.modifiedAt))) || ''
      const dateOfEvent = reg.dateOfEvent && new Date(reg.dateOfEvent)
      return {
        ...reg,
        event,
        name: reg.name && reg.name.toLowerCase(),
        iconWithName: (
          <IconWithName
            status={reg.declarationStatus}
            name={reg.name}
            isDuplicate={isDuplicate}
          />
        ),
        iconWithNameEvent: (
          <IconWithNameEvent
            status={reg.declarationStatus}
            name={reg.name}
            event={reg.event}
            isDuplicate={isDuplicate}
          />
        ),
        sentForUpdates,
        dateOfEvent,
        actions,
        rowClickHandler: [
          {
            label: 'rowClickHandler',
            handler: () =>
              this.props.goToDeclarationRecordAudit('rejectTab', reg.id)
          }
        ]
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
        sentForUpdates:
          item.sentForUpdates && formattedDuration(item.sentForUpdates as Date)
      }
    })
  }

  render() {
    const { intl, queryData, page, onPageChange } = this.props
    const { data } = queryData

    return (
      <Content
        size={ContentSize.LARGE}
        title={intl.formatMessage(navigationMessages.sentForUpdates)}
        hideBackground={true}
      >
        <GridTable
          content={this.transformRejectedContent(data)}
          columns={this.getColumns()}
          noResultText={intl.formatMessage(officeHomeMessages.sentForUpdates)}
          onPageChange={onPageChange}
          clickable={true}
          loading={this.props.loading}
          sortOrder={this.state.sortOrder}
          sortedCol={this.state.sortedCol}
        />
        <LoadingIndicator
          loading={this.props.loading ? true : false}
          hasError={this.props.error ? true : false}
        />
      </Content>
    )
  }
}

function mapStateToProps(state: IStoreState) {
  return {
    scope: getScope(state),
    outboxDeclarations: state.declarationsState.declarations
  }
}

export const RejectTab = connect(mapStateToProps, {
  goToPage,
  goToReviewDuplicate,
  goToDeclarationRecordAudit
})(injectIntl(withTheme(RejectTabComponent)))
