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
import styled, { withTheme } from 'styled-components'
import { Pagination } from '..'
import { ListItemAction } from '../../buttons'
import { grid } from '../../grid'
import { IDynamicValues, IActionObject, IAction, IColumn } from './types'
import { LoadMore } from './LoadMore'
import { GridTableRowDesktop } from './GridTableRowDeskop'
import { ITheme } from 'src/components/theme'
import { SortIcon } from '../../icons/SortIcon'
import { connect } from 'react-redux'
import { orderBy } from 'lodash'
import { GridTableRowMobile } from './GridTableRowMobile'

const Wrapper = styled.div`
  width: 100%;
`
const TableHeader = styled.div`
  color: ${({ theme }) => theme.colors.grey600};
  background-color: ${({ theme }) => theme.colors.grey100};
  ${({ theme }) => theme.fonts.bold12};
  height: 36px;
  display: flex;
  align-items: center;
  padding: 0 25px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.grey600};
  ${({ theme }) => theme.fonts.bold16}
  text-align: left;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    position: fixed;
    left: 0;
    right: 0;
    top: 50%;
    text-align: center;
  }
`

const RowWrapper = styled.div<{
  expandable?: boolean
  clickable?: boolean
}>`
  width: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  min-height: 64px;
  cursor: ${({ expandable, clickable }) =>
    expandable || clickable ? 'pointer' : 'default'};
`

const ContentWrapper = styled.span<{
  width: number
  alignment?: string
  color?: string
  paddingRight?: number | null
}>`
  width: ${({ width }) => width}%;
  display: inline-block;
  text-align: ${({ alignment }) => (alignment ? alignment.toString() : 'left')};
  padding-right: ${({ paddingRight }) => (paddingRight ? paddingRight : 10)}px;
  ${({ color }) => color && `color: ${color};`}
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ColumnContainer = styled.div<{
  width: number
}>`
  width: ${({ width }) => width}%;
  display: flex;
  cursor: pointer;
`

const ColumnTitleWrapper = styled.div<{ alignment?: string }>`
  align-self: ${({ alignment }) => (alignment ? alignment.toString() : 'left')};
  width: 100%;
  display: flex;
  gap: 8px;
  align-items: center;
`

const ActionWrapper = styled(ContentWrapper)`
  padding-right: 0px;
`

export enum ColumnContentAlignment {
  LEFT = 'left',
  RIGHT = 'right',
  CENTER = 'center'
}

export enum COLUMNS {
  ICON_WITH_NAME = 'iconWithName',
  ICON_WITH_NAME_EVENT = 'iconWithNameEvent',
  EVENT = 'event',
  DATE_OF_EVENT = 'dateOfEvent',
  SENT_FOR_REVIEW = 'sentForReview',
  SENT_FOR_UPDATES = 'sentForUpdates',
  SENT_FOR_APPROVAL = 'sentForApproval',
  REGISTERED = 'registered',
  STATUS_INDICATOR = 'statusIndicator',
  LAST_UPDATED = 'lastUpdated',
  ACTIONS = 'actions',
  NOTIFICATION_SENT = 'notificationSent',
  NAME = 'name'
}

export enum SORT_ORDER {
  ASCENDING = 'asc',
  DESCENDING = 'desc'
}

interface IGridTableProps {
  theme: ITheme
  content: IDynamicValues[]
  columns: IColumn[]
  renderExpandedComponent?: (eventId: string) => React.ReactNode
  noResultText: string
  hideTableHeader?: boolean
  onPageChange?: (currentPage: number) => void
  pageSize?: number
  totalItems: number
  currentPage?: number
  expandable?: boolean
  clickable?: boolean
  showPaginated?: boolean
  loading?: boolean
  loadMoreText: string
  sortedCol?: COLUMNS
  sortOrder?: SORT_ORDER
  formattedDuration?: (fromDate: Date | number) => string
}

interface IGridTableState {
  width: number
  expanded: string[]
}

export class GridTableComp extends React.Component<
  IGridTableProps,
  IGridTableState
> {
  state = {
    width: window.innerWidth,
    expanded: []
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

  renderActionBlock = (
    itemId: string,
    actions: IAction[],
    width: number,
    key: number,
    idKey: number,
    alignment?: ColumnContentAlignment
  ) => {
    if (this.props.expandable) {
      return (
        <ActionWrapper
          key={idKey}
          width={width}
          alignment={alignment}
          id="ActionWrapper"
        >
          <ListItemAction
            actions={actions}
            expanded={
              this.state.expanded.findIndex((id) => id === itemId) >= 0 || false
            }
            alignment={alignment}
            arrowExpansion={true}
            id={`ListItemAction-${key}`}
            onExpand={() => this.toggleExpanded(itemId)}
          />
        </ActionWrapper>
      )
    } else {
      return (
        <ActionWrapper key={idKey} width={width} alignment={alignment}>
          <ListItemAction id={`ListItemAction-${key}`} actions={actions} />
        </ActionWrapper>
      )
    }
  }

  toggleExpanded = (itemId: string) => {
    if (!this.props.expandable) {
      return
    }
    const toggledExpandedList = [] as string[]
    const { expanded } = this.state
    const index = expanded.findIndex((id) => id === itemId)
    if (index < 0) {
      toggledExpandedList.push(itemId)
    }
    expanded.forEach((id) => {
      if (itemId !== id) {
        toggledExpandedList.push(id)
      }
    })
    this.setState({ expanded: toggledExpandedList })
  }

  showExpandedSection = (itemId: string) => {
    return this.state.expanded.findIndex((id) => id === itemId) >= 0
  }

  onPageChange = (currentPage: number) => {
    if (this.props.onPageChange) {
      this.props.onPageChange(currentPage)
    }
  }

  getRowClickHandler = (itemRowClickHandler: IActionObject[]) => {
    return itemRowClickHandler[0].handler
  }

  render() {
    const { columns, content, noResultText, hideTableHeader, sortOrder } =
      this.props
    const { width } = this.state
    const isMobileView = this.state.width < this.props.theme.grid.breakpoints.lg
    return (
      <Wrapper>
        {content.length > 0 && width > grid.breakpoints.lg && !hideTableHeader && (
          <TableHeader>
            {columns.map((preference, index) => (
              <ColumnContainer
                key={index}
                width={preference.width}
                onClick={
                  preference.sortFunction
                    ? () => preference.sortFunction!(preference.key)
                    : undefined
                }
              >
                <ColumnTitleWrapper>
                  {preference.label && preference.label}
                  {preference.sortFunction && (
                    <SortIcon
                      isSorted={Boolean(preference.isSorted)}
                      isDescending={sortOrder === SORT_ORDER.DESCENDING}
                    />
                  )}
                </ColumnTitleWrapper>
              </ColumnContainer>
            ))}
          </TableHeader>
        )}
        {!isMobileView ? (
          <GridTableRowDesktop
            columns={this.props.columns}
            displayItems={content}
            clickable={this.props.clickable}
            getRowClickHandler={this.getRowClickHandler}
            renderActionBlock={this.renderActionBlock}
          />
        ) : (
          <GridTableRowMobile
            columns={this.props.columns}
            displayItems={content}
            clickable={this.props.clickable}
            getRowClickHandler={this.getRowClickHandler}
            renderActionBlock={this.renderActionBlock}
          />
        )}
        {!this.props.loading && content.length <= 0 && (
          <ErrorText id="no-record">{noResultText}</ErrorText>
        )}
      </Wrapper>
    )
  }
}

export const GridTable = connect(null, {})(withTheme(GridTableComp))
