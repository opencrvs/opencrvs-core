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
import { LinkButton } from '@opencrvs/components/lib/buttons/LinkButton'

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
}

interface IReviewTabState {
  width: number
  sortedCol: COLUMNS
  sortOrder: SORT_ORDER
}

type IReviewTabProps = IntlShapeProps & IBaseReviewTabProps

class ReadyForReviewComponent extends React.Component<
  IReviewTabProps,
  IReviewTabState
> {
  pageSize = 10
  constructor(props: IReviewTabProps) {
    super(props)
    this.state = {
      width: window.innerWidth,
      sortedCol: COLUMNS.SENT_FOR_REVIEW,
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

  userHasRegisterScope() {
    return this.props.scope && hasRegisterScope(this.props.scope)
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

  transformDeclaredContent = (data: GQLEventSearchResultSet) => {
    const { intl } = this.props
    if (!data || !data.results) {
      return []
    }
    const transformedData = transformData(data, this.props.intl)
    const items: IDynamicValues[] = transformedData.map((reg, index) => {
      const actions = [] as IAction[]
      const foundDeclaration = this.props.outboxDeclarations.find(
        (declaration) => declaration.id === reg.id
      )
      const downloadStatus = foundDeclaration?.downloadStatus
      const isDuplicate = reg.duplicates && reg.duplicates.length > 0

      if (downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED) {
        if (this.state.width > this.props.theme.grid.breakpoints.lg) {
          actions.push({
            label: this.props.intl.formatMessage(constantsMessages.review),
            handler: () => {},
            disabled: true
          })
        }
      } else {
        if (this.state.width > this.props.theme.grid.breakpoints.lg) {
          actions.push({
            label: this.props.intl.formatMessage(constantsMessages.review),
            handler: (
              e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined
            ) => {
              e && e.stopPropagation()
              this.props.goToPage(
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
        this.userHasRegisterScope()
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
          onClick={() =>
            this.props.goToDeclarationRecordAudit('reviewTab', reg.id)
          }
        >
          {reg.name}
        </NameContainer>
      ) : (
        <NoNameContainer
          id={`name_${index}`}
          onClick={() =>
            this.props.goToDeclarationRecordAudit('reviewTab', reg.id)
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
        sentForReview:
          item.sentForReview && formattedDuration(item.sentForReview as number)
      }
    })
  }

  getColumns = () => {
    if (this.state.width > this.props.theme.grid.breakpoints.lg) {
      return [
        {
          label: this.props.intl.formatMessage(constantsMessages.name),
          width: 30,
          key: COLUMNS.ICON_WITH_NAME,
          sortFunction: this.onColumnClick,
          isSorted: this.state.sortedCol === COLUMNS.NAME
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.event),
          width: 16,
          key: COLUMNS.EVENT,
          sortFunction: this.onColumnClick,
          isSorted: this.state.sortedCol === COLUMNS.EVENT
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.eventDate),
          width: 18,
          key: COLUMNS.DATE_OF_EVENT,
          sortFunction: this.onColumnClick,
          isSorted: this.state.sortedCol === COLUMNS.DATE_OF_EVENT
        },
        {
          label: this.props.intl.formatMessage(constantsMessages.sentForReview),
          width: 18,
          key: COLUMNS.SENT_FOR_REVIEW,
          sortFunction: this.onColumnClick,
          isSorted: this.state.sortedCol === COLUMNS.SENT_FOR_REVIEW
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

  render() {
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
    return (
      <WQContentWrapper
        title={intl.formatMessage(navigationMessages.readyForReview)}
        isMobileSize={
          this.state.width < this.props.theme.grid.breakpoints.lg ? true : false
        }
        isShowPagination={isShowPagination}
        paginationId={paginationId}
        totalPages={totalPages}
        onPageChange={onPageChange}
        loading={this.props.loading}
        error={this.props.error}
        noResultText={intl.formatMessage(wqMessages.noRecordsReadyForReview)}
        noContent={this.transformDeclaredContent(data).length <= 0}
      >
        <ReactTooltip id="validateTooltip">
          <ToolTipContainer>
            {this.props.intl.formatMessage(
              messages.validatedDeclarationTooltipForRegistrar
            )}
          </ToolTipContainer>
        </ReactTooltip>
        <GridTable
          content={this.transformDeclaredContent(data)}
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

export const ReadyForReview = connect(mapStateToProps, {
  goToPage,
  goToDeclarationRecordAudit
})(injectIntl(withTheme(ReadyForReviewComponent)))
