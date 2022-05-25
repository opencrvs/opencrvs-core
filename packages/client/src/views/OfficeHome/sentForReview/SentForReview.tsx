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
import { IDeclaration, DOWNLOAD_STATUS } from '@client/declarations'
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
import {
  GridTable,
  COLUMNS,
  SORT_ORDER,
  ColumnContentAlignment,
  IAction
} from '@opencrvs/components/lib/interface'
import { GQLEventSearchResultSet } from '@opencrvs/gateway/src/graphql/schema'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import ReactTooltip from 'react-tooltip'
import { withTheme } from 'styled-components'
import { formattedDuration } from '@client/utils/date-formatting'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import {
  changeSortedColumn,
  getSortedItems
} from '@client/views/OfficeHome/utils'
import {
  IconWithName,
  IconWithNameEvent,
  NoNameContainer
} from '@client/views/OfficeHome/components'
import { WQContentWrapper } from '@client/views/OfficeHome/WQContentWrapper'
import { LinkButton } from '@opencrvs/components/lib/buttons/LinkButton'
import { Scope } from '@client/utils/authUtils'
import { DownloadButton } from '@client/components/interface/DownloadButton'
import { Action } from '@client/forms'
import { Downloaded } from '@opencrvs/components/lib/icons/Downloaded'
const ToolTipContainer = styled.span`
  text-align: center;
`
interface IBaseApprovalTabProps {
  theme: ITheme
  goToPage: typeof goToPage
  goToDeclarationRecordAudit: typeof goToDeclarationRecordAudit
  outboxDeclarations: IDeclaration[]
  scope: Scope | null
  queryData: {
    data: GQLEventSearchResultSet
  }
  paginationId: number
  pageSize: number
  onPageChange: (newPageNumber: number) => void
  loading?: boolean
  error?: boolean
}

interface IApprovalTabState {
  width: number
  sortedCol: COLUMNS
  sortOrder: SORT_ORDER
}

type IApprovalTabProps = IntlShapeProps & IBaseApprovalTabProps

class SentForReviewComponent extends React.Component<
  IApprovalTabProps,
  IApprovalTabState
> {
  pageSize = 10
  isFieldAgent = this.props.scope?.includes('declare')

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
          label: this.props.intl.formatMessage(constantsMessages.eventDate),
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

  transformValidatedContent = (data: GQLEventSearchResultSet) => {
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

      if (downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED) {
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
      const sentForApproval =
        (reg.modifiedAt && Number.isNaN(Number(reg.modifiedAt))
          ? new Date(reg.modifiedAt)
          : new Date(Number(reg.modifiedAt))) || ''
      const dateOfEvent =
        reg.dateOfEvent &&
        reg.dateOfEvent.length > 0 &&
        new Date(reg.dateOfEvent)
      const NameComponent = reg.name ? (
        <LinkButton
          id={`name_${index}`}
          isBoldLink={true}
          onClick={() =>
            this.isFieldAgent
              ? this.props.goToDeclarationRecordAudit('reviewTab', reg.id)
              : this.props.goToDeclarationRecordAudit('approvalTab', reg.id)
          }
        >
          {reg.name}
        </LinkButton>
      ) : (
        <NoNameContainer
          id={`name_${index}`}
          onClick={() =>
            this.isFieldAgent
              ? this.props.goToDeclarationRecordAudit('reviewTab', reg.id)
              : this.props.goToDeclarationRecordAudit('approvalTab', reg.id)
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
        eventTimeElapsed:
          (reg.dateOfEvent?.length &&
            formattedDuration(new Date(reg.dateOfEvent))) ||
          '',
        dateOfEvent,
        sentForApproval,
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
        sentForApproval:
          item.sentForApproval &&
          formattedDuration(item.sentForApproval as Date)
      }
    })
  }

  render() {
    // Approval tab for registration clerk and registrar
    // Review tab for field agent
    const { intl, queryData, paginationId, pageSize, onPageChange } = this.props
    const { data } = queryData
    const totalPages = this.props.queryData.data.totalItems
      ? Math.ceil(this.props.queryData.data.totalItems / pageSize)
      : 0
    const isShowPagination =
      this.props.queryData.data.totalItems &&
      this.props.queryData.data.totalItems > pageSize
        ? true
        : false
    const noResultText = this.isFieldAgent
      ? intl.formatMessage(constantsMessages.noRecords, {
          tab: 'sent for review'
        })
      : intl.formatMessage(constantsMessages.noRecords, {
          tab: 'sent for approval'
        })
    const title = this.isFieldAgent
      ? intl.formatMessage(navigationMessages.sentForReview)
      : intl.formatMessage(navigationMessages.approvals)
    return (
      <WQContentWrapper
        title={title}
        isMobileSize={this.state.width < this.props.theme.grid.breakpoints.lg}
        isShowPagination={isShowPagination}
        paginationId={paginationId}
        totalPages={totalPages}
        onPageChange={onPageChange}
        noResultText={noResultText}
        loading={this.props.loading}
        error={this.props.error}
        noContent={this.transformValidatedContent(data).length <= 0}
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
    scope: getScope(state),
    outboxDeclarations: state.declarationsState.declarations
  }
}

export const SentForReview = connect(mapStateToProps, {
  goToPage,
  goToDeclarationRecordAudit
})(injectIntl(withTheme(SentForReviewComponent)))
