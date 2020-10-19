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
import styled from 'styled-components'
import { Pagination } from '..'
import { ListItemAction } from '../../buttons'
import { grid } from '../../grid'
import { Box } from '../../interface'
import { IAction, IColumn, IDynamicValues, IActionObject } from './types'
export { IAction } from './types'
import { LoadMore } from './LoadMore'

const Wrapper = styled.div`
  width: 100%;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin: 24px 16px 0 16px;
    width: calc(100% - 32px);
  }
`
const TableHeader = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.captionStyle};
  margin: 40px 0 25px;
  padding: 0 25px;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

const StyledBox = styled(Box)`
  margin-top: 8px;
  padding: 0;
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.bodyStyle};
`

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  ${({ theme }) => theme.fonts.bodyStyle};
  text-align: center;
  margin-top: 100px;
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
const ActionWrapper = styled(ContentWrapper)`
  padding-right: 0px;
`

const IconWrapper = styled(ContentWrapper)`
  padding-top: 5px;
`

const ExpandedSectionContainer = styled.div<{ expanded: boolean }>`
  margin-top: 5px;
  overflow: hidden;
  transition-property: all;
  transition-duration: 0.5s;
  max-height: ${({ expanded }) => (expanded ? '1000px' : '0px')};
`

const Error = styled.span`
  color: ${({ theme }) => theme.colors.error};
`

export enum ColumnContentAlignment {
  LEFT = 'left',
  RIGHT = 'right',
  CENTER = 'center'
}

interface IGridTableProps {
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
}

interface IGridTableState {
  width: number
  expanded: string[]
}

const defaultConfiguration = {
  pageSize: 10,
  currentPage: 1
}

export class GridTable extends React.Component<
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
              this.state.expanded.findIndex(id => id === itemId) >= 0 || false
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
        <ActionWrapper key={key} width={width} alignment={alignment}>
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
    const index = expanded.findIndex(id => id === itemId)
    if (index < 0) {
      toggledExpandedList.push(itemId)
    }
    expanded.forEach(id => {
      if (itemId !== id) {
        toggledExpandedList.push(id)
      }
    })
    this.setState({ expanded: toggledExpandedList })
  }

  showExpandedSection = (itemId: string) => {
    return this.state.expanded.findIndex(id => id === itemId) >= 0
  }

  getDisplayItems = (
    currentPage: number,
    pageSize: number,
    allItems: IDynamicValues[]
  ) => {
    const { showPaginated = false } = this.props
    let displayItems
    let offset
    if (allItems.length <= pageSize) {
      // expect that allItem is already sliced correctly externally
      return allItems
    }

    // perform internal pagination
    if (showPaginated === false) {
      offset = 0
      displayItems = allItems.slice(offset, currentPage * pageSize)
    } else {
      offset = (currentPage - 1) * pageSize
      displayItems = allItems.slice(offset, offset + pageSize)
    }

    return displayItems
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
    const {
      columns,
      content,
      noResultText,
      hideTableHeader,
      pageSize = defaultConfiguration.pageSize,
      currentPage = defaultConfiguration.currentPage,
      showPaginated = false
    } = this.props
    const { width } = this.state
    const totalItems = this.props.totalItems || 0
    return (
      <Wrapper>
        {content.length > 0 && width > grid.breakpoints.lg && !hideTableHeader && (
          <TableHeader>
            {columns.map((preference, index) => (
              <ContentWrapper
                key={index}
                width={preference.width}
                alignment={preference.alignment}
                paddingRight={
                  preference.isActionColumn && this.props.expandable ? 40 : null
                }
              >
                {preference.label && preference.label}
              </ContentWrapper>
            ))}
          </TableHeader>
        )}
        {this.getDisplayItems(currentPage, pageSize, content).map(
          (item, index) => {
            const expanded = this.showExpandedSection(item.id as string)
            const clickable = this.props.clickable || Boolean(item.rowClickable)
            return (
              <StyledBox key={index}>
                <RowWrapper
                  id={'row_' + index}
                  expandable={this.props.expandable}
                  clickable={clickable}
                  onClick={() =>
                    (this.props.expandable &&
                      this.toggleExpanded(item.id as string)) ||
                    (clickable &&
                      this.getRowClickHandler(
                        item.rowClickHandler as IActionObject[]
                      )())
                  }
                >
                  {columns.map((preference, indx) => {
                    if (preference.isActionColumn) {
                      return this.renderActionBlock(
                        item.id as string,
                        item[preference.key] as IAction[],
                        preference.width,
                        index,
                        indx,
                        preference.alignment
                      )
                    } else if (preference.isIconColumn) {
                      return (
                        <IconWrapper
                          key={indx}
                          width={preference.width}
                          alignment={preference.alignment}
                          color={preference.color}
                        >
                          {(item.icon as JSX.Element) || (
                            <Error>{preference.errorValue}</Error>
                          )}
                        </IconWrapper>
                      )
                    } else {
                      return (
                        <ContentWrapper
                          key={indx}
                          width={preference.width}
                          alignment={preference.alignment}
                          color={preference.color}
                        >
                          {(item[preference.key] as string) || (
                            <Error>{preference.errorValue}</Error>
                          )}
                        </ContentWrapper>
                      )
                    }
                  })}
                </RowWrapper>

                {this.props.expandable && (
                  <ExpandedSectionContainer expanded={expanded}>
                    {expanded &&
                      this.props.renderExpandedComponent &&
                      this.props.renderExpandedComponent(item.id as string)}
                  </ExpandedSectionContainer>
                )}
              </StyledBox>
            )
          }
        )}

        {showPaginated && totalItems > pageSize && (
          <Pagination
            initialPage={currentPage}
            totalPages={Math.ceil(totalItems / pageSize)}
            onPageChange={this.onPageChange}
          />
        )}
        {!showPaginated &&
          !this.props.loading &&
          totalItems > pageSize * currentPage && (
            <LoadMore
              initialPage={currentPage}
              onLoadMore={this.onPageChange}
              loadMoreText={this.props.loadMoreText}
            />
          )}

        {!this.props.loading && content.length <= 0 && (
          <ErrorText id="no-record">{noResultText}</ErrorText>
        )}
      </Wrapper>
    )
  }
}
