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
import { Pagination } from '../DataTable/Pagination'
import { LoadMore } from '../GridTable/LoadMore'
import { IColumn, IDynamicValues, IFooterFColumn } from '../GridTable/types'

const Wrapper = styled.div<{
  hideBoxShadow?: boolean
}>`
  width: 100%;
  background: ${({ theme }) => theme.colors.white};
  ${({ hideBoxShadow, theme }) =>
    hideBoxShadow
      ? `padding: 24px 0;`
      : `padding: 24px;
    ${theme.shadows.mistyShadow};`}
`
const TableTitleLoading = styled.span`
  background: ${({ theme }) => theme.colors.background};
  width: 176px;
  height: 32px;
  display: block;
  margin-bottom: 10px;
`
const TableHeader = styled.div<{
  isSortable?: boolean
}>`
  color: ${({ theme }) => theme.colors.copy};
  padding: 10px 0px;
  display: flex;
  align-items: flex-end;

  & span:first-child {
    padding-left: 12px;
  }

  & span:last-child {
    text-align: right;
    padding-right: 12px;
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`
const Line = styled.div<{ width: number }>`
  width: ${({ width }) => (Boolean(width) ? width : 100)}%;
  background: ${({ theme }) => theme.colors.disabled};
  height: 1px;
`
const TableHeaderText = styled.div<{
  isSortable?: boolean
}>`
  ${({ isSortable, theme }) =>
    isSortable ? theme.fonts.bodyBoldStyle : theme.fonts.bodyStyle}
`

const TableBody = styled.div<{ footerColumns: boolean }>`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.bodyStyle};
  & div:last-of-type {
    ${({ footerColumns }) => (footerColumns ? 'border-bottom: none;' : '')};
  }
`
const RowWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  min-height: 48px;

  & span:first-child {
    padding-left: 12px;
  }

  & span:last-child {
    text-align: right;
    padding-right: 12px;
    display: inline-block;
  }
`
const TableFooter = styled(RowWrapper)`
  padding-right: 10px;
  background: ${({ theme }) => theme.colors.background};
  border-top: 2px solid ${({ theme }) => theme.colors.disabled};
  border-bottom: none;
  & span {
    color: ${({ theme }) => theme.colors.copy};
    ${({ theme }) => theme.fonts.bodyBoldStyle};
  }
`

const ContentWrapper = styled.span<{
  width: number
  alignment?: string
  sortable?: boolean
}>`
  width: ${({ width }) => width}%;
  flex-shrink: 0;
  text-align: ${({ alignment }) => (alignment ? alignment.toString() : 'left')};
  padding-right: 10px;
  cursor: ${({ sortable }) => (sortable ? 'pointer' : 'default')};
  color: ${({ theme }) => theme.colors.tertiary};
`
const ValueWrapper = styled.span<{
  width: number
  alignment?: string
  color?: string
}>`
  width: ${({ width }) => width}%;
  display: flex;
  flex-shrink: 0;
  margin: auto 0;
  text-align: ${({ alignment }) => (alignment ? alignment.toString() : 'left')};
  padding-right: 10px;
  ${({ color }) => color && `color: ${color};`}
`
const Error = styled.span`
  color: ${({ theme }) => theme.colors.error};
`
const ErrorText = styled.div`
  ${({ theme }) => theme.fonts.h5Style};
  text-align: left;
  margin-left: 10px;
  color: ${({ theme }) => theme.colors.copy};
`
const H3 = styled.div`
  padding-left: 12px;
  margin-bottom: 30px;
  ${({ theme }) => theme.fonts.bigBodyBoldStyle};
`
const LoadingGrey = styled.span<{
  width?: number
}>`
  background: ${({ theme }) => theme.colors.background};
  display: inline-block;
  height: 24px;
  width: ${({ width }) => (width ? `${width}%` : '100%')};
`
const TableScroller = styled.div<{
  height?: number
}>`
  height: ${({ height }) => (height ? `${height}px` : 'auto')};
  overflow-x: auto;
  padding-right: 10px;

  &::-webkit-scrollbar {
    height: 5px;
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.lightScrollBarGrey};
  }
`
const TableHeaderWrapper = styled.div`
  padding-right: 10px;
`
const ToggleSortIcon = styled.div<{
  toggle?: boolean
}>`
  margin-left: 5px;
  display: inline;
  svg {
    transform: ${({ toggle }) => (toggle ? 'rotate(180deg)' : 'none')};
  }
`

const defaultConfiguration = {
  pageSize: 10,
  currentPage: 1
}

interface IListTableProps {
  id?: string
  content: IDynamicValues[]
  columns: IColumn[]
  footerColumns?: IFooterFColumn[]
  noResultText: string
  tableHeight?: number
  onPageChange?: (currentPage: number) => void
  pageSize?: number
  totalItems?: number
  currentPage?: number
  isLoading?: boolean
  tableTitle?: string
  hideBoxShadow?: boolean
  loadMoreText?: string
}

interface IListTableState {
  sortIconInverted: boolean
  sortKey: string | null
}

export class ListTable extends React.Component<
  IListTableProps,
  IListTableState
> {
  state = {
    sortIconInverted: false,
    sortKey: null
  }

  headerRef = React.createRef<HTMLDivElement>()
  tableScrollerRef = React.createRef<HTMLDivElement>()

  onPageChange = (currentPage: number) => {
    if (this.props.onPageChange) {
      this.props.onPageChange(currentPage)
    }
  }

  getDisplayItems = (
    currentPage: number,
    pageSize: number,
    allItems: IDynamicValues[]
  ) => {
    if (allItems.length <= pageSize) {
      // expect that allItem is already sliced correctly externally
      return allItems
    }

    // perform internal pagination
    const offset = (currentPage - 1) * pageSize
    const displayItems = allItems.slice(offset, offset + pageSize)
    return displayItems
  }

  invertSortIcon = (sortKey: string) => {
    let sortIconInverted: boolean

    if (this.state.sortKey === sortKey || this.state.sortKey === null) {
      sortIconInverted = !this.state.sortIconInverted
    } else {
      sortIconInverted = true
    }
    this.setState({ sortIconInverted, sortKey })
    return true
  }

  onScrollRowWrapper = (event: React.UIEvent<HTMLDivElement>) => {
    if (this.headerRef.current) {
      this.headerRef.current.scrollLeft =
        (this.tableScrollerRef.current &&
          this.tableScrollerRef.current.scrollLeft) ||
        0
    }
  }

  render() {
    const {
      id,
      columns,
      content,
      noResultText,
      pageSize = defaultConfiguration.pageSize,
      currentPage = defaultConfiguration.currentPage,
      isLoading = false,
      tableTitle,
      tableHeight,
      hideBoxShadow,
      footerColumns,
      loadMoreText
    } = this.props
    const totalItems = this.props.totalItems || 0
    const totalWidth = columns.reduce((total, col) => (total += col.width), 0)

    return (
      <>
        {!isLoading && (
          <Wrapper id={`listTable-${id}`} hideBoxShadow={hideBoxShadow}>
            <TableScroller
              height={tableHeight}
              ref={this.tableScrollerRef}
              onScroll={this.onScrollRowWrapper}
            >
              {tableTitle && <H3>{tableTitle}</H3>}
              {content.length > 0 && (
                <TableHeaderWrapper ref={this.headerRef}>
                  <TableHeader>
                    {columns.map((preference, index) => (
                      <ContentWrapper
                        key={index}
                        id={`${preference.key}-label`}
                        width={preference.width}
                        alignment={preference.alignment}
                        sortable={preference.isSortable}
                        onClick={() =>
                          preference.isSortable &&
                          preference.sortFunction &&
                          this.invertSortIcon(preference.key) &&
                          preference.sortFunction(preference.key)
                        }
                      >
                        <TableHeaderText isSortable={preference.isSortable}>
                          {preference.label}
                          <ToggleSortIcon
                            toggle={
                              this.state.sortIconInverted &&
                              this.state.sortKey === preference.key
                            }
                          >
                            {preference.icon}
                          </ToggleSortIcon>
                        </TableHeaderText>
                      </ContentWrapper>
                    ))}
                  </TableHeader>
                  <Line width={totalWidth} />
                </TableHeaderWrapper>
              )}

              <TableBody
                footerColumns={
                  (footerColumns && footerColumns.length > 0) || false
                }
              >
                {this.getDisplayItems(currentPage, pageSize, content).map(
                  (item, index) => {
                    return (
                      <div key={index}>
                        <RowWrapper id={'row_' + index}>
                          {columns.map((preference, indx) => {
                            return (
                              <ValueWrapper
                                key={indx}
                                width={preference.width}
                                alignment={preference.alignment}
                                color={preference.color}
                              >
                                {item[preference.key] || (
                                  <Error>{preference.errorValue}</Error>
                                )}
                              </ValueWrapper>
                            )
                          })}
                        </RowWrapper>
                        <Line width={totalWidth} />
                      </div>
                    )
                  }
                )}
              </TableBody>

              {footerColumns && content.length > 1 && (
                <TableFooter id={'listTable-' + id + '-footer'}>
                  {footerColumns.map((preference, index) => (
                    <ContentWrapper key={index} width={preference.width}>
                      {preference.label || ''}
                    </ContentWrapper>
                  ))}
                </TableFooter>
              )}
            </TableScroller>
            {content.length <= 0 && (
              <ErrorText id="no-record">{noResultText}</ErrorText>
            )}
          </Wrapper>
        )}
        {isLoading && (
          <>
            {tableTitle && <TableTitleLoading />}
            <TableHeader>
              {columns.map((preference, index) => (
                <ContentWrapper
                  key={index}
                  width={preference.width}
                  alignment={preference.alignment}
                  sortable={preference.isSortable}
                >
                  <LoadingGrey />
                </ContentWrapper>
              ))}
            </TableHeader>
            <TableHeader>
              {columns.map((preference, index) => (
                <ContentWrapper
                  key={index}
                  width={preference.width}
                  alignment={preference.alignment}
                  sortable={preference.isSortable}
                >
                  <LoadingGrey width={30} />
                </ContentWrapper>
              ))}
            </TableHeader>
          </>
        )}
        {totalItems > pageSize && (
          <>
            {!loadMoreText && (
              <Pagination
                initialPage={currentPage}
                totalPages={Math.ceil(totalItems / pageSize)}
                onPageChange={this.onPageChange}
              />
            )}
            {loadMoreText && (
              <LoadMore
                initialPage={currentPage}
                loadMoreText={loadMoreText}
                onLoadMore={this.onPageChange}
                usageTableType={'list'}
              />
            )}
          </>
        )}
      </>
    )
  }
}
