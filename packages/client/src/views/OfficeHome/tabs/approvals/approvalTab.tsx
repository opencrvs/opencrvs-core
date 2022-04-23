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
import { IDeclaration } from '@client/declarations'
import {
  constantsMessages,
  dynamicConstantsMessages
} from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/registrarHome'
import { goToDeclarationRecordAudit, goToPage } from '@client/navigation'
import { getScope } from '@client/profile/profileSelectors'
import { transformData } from '@client/search/transformer'
import { IStoreState } from '@client/store'
import styled, { ITheme } from '@client/styledComponents'
import { Validate } from '@opencrvs/components/lib/icons'
import {
  ColumnContentAlignment,
  GridTable,
  COLUMNS,
  SORT_ORDER
} from '@opencrvs/components/lib/interface'
import { GQLEventSearchResultSet } from '@opencrvs/gateway/src/graphql/schema'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import ReactTooltip from 'react-tooltip'
import { withTheme } from 'styled-components'
import { LoadingIndicator } from '@client/views/OfficeHome/LoadingIndicator'
import { formattedDuration } from '@client/utils/date-formatting'
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
import { WQContentWrapper } from '@client/views/OfficeHome/tabs/WQContentWrapper'

const ToolTipContainer = styled.span`
  text-align: center;
`
interface IBaseApprovalTabProps {
  theme: ITheme
  goToPage: typeof goToPage
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

interface IApprovalTabState {
  width: number
  sortedCol: COLUMNS
  sortOrder: SORT_ORDER
}

type IApprovalTabProps = IntlShapeProps & IBaseApprovalTabProps

class ApprovalTabComponent extends React.Component<
  IApprovalTabProps,
  IApprovalTabState
> {
  pageSize = 10
  constructor(props: IApprovalTabProps) {
    super(props)
    this.state = {
      width: window.innerWidth,
      sortedCol: COLUMNS.NAME,
      sortOrder: SORT_ORDER.ASCENDING
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
            constantsMessages.sentForApproval
          ),
          width: 18,
          key: COLUMNS.SENT_FOR_APPROVAL,
          isSorted: this.state.sortedCol === COLUMNS.SENT_FOR_APPROVAL,
          sortFunction: this.onColumnClick
        }
      ]
    } else {
      return [
        {
          label: this.props.intl.formatMessage(constantsMessages.name),
          width: 90,
          key: COLUMNS.ICON_WITH_NAME_EVENT
        }
      ]
    }
  }

  transformValidatedContent = (data: GQLEventSearchResultSet) => {
    const { intl } = this.props
    if (!data || !data.results) {
      return []
    }
    const transformedData = transformData(data, this.props.intl)

    const items = transformedData.map((reg) => {
      const event =
        (reg.event &&
          intl.formatMessage(
            dynamicConstantsMessages[reg.event.toLowerCase()]
          )) ||
        ''
      const sentForApproval =
        (reg.modifiedAt && Number.isNaN(Number(reg.modifiedAt))
          ? new Date(reg.modifiedAt)
          : new Date(Number(reg.modifiedAt))) || ''
      const dateOfEvent = reg.dateOfEvent && new Date(reg.dateOfEvent)
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
        eventTimeElapsed:
          (reg.dateOfEvent && formattedDuration(new Date(reg.dateOfEvent))) ||
          '',
        dateOfEvent,
        sentForApproval,
        rowClickHandler: [
          {
            label: 'rowClickHandler',
            handler: () =>
              this.props.goToDeclarationRecordAudit('approvalTab', reg.id)
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
        sentForApproval:
          item.sentForApproval &&
          formattedDuration(item.sentForApproval as Date)
      }
    })
  }

  render() {
    const { intl, queryData, page, onPageChange } = this.props
    const { data } = queryData

    return (
      <WQContentWrapper
        title={intl.formatMessage(navigationMessages.approvals)}
        isMobileSize={this.state.width < this.props.theme.grid.breakpoints.lg}
      >
        <ReactTooltip id="validatedTooltip">
          <ToolTipContainer>
            {this.props.intl.formatMessage(
              messages.validatedDeclarationTooltipForRegistrationAgent
            )}
          </ToolTipContainer>
        </ReactTooltip>
        <GridTable
          content={this.transformValidatedContent(data)}
          columns={this.getColumns()}
          noResultText={intl.formatMessage(officeHomeMessages.approvals)}
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
      </WQContentWrapper>
    )
  }
}

function mapStateToProps(state: IStoreState) {
  return {
    scope: getScope(state),
    outboxDeclarations: state.declarationsState.declarations
  }
}

export const ApprovalTab = connect(mapStateToProps, {
  goToPage,
  goToDeclarationRecordAudit
})(injectIntl(withTheme(ApprovalTabComponent)))
