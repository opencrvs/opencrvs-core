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
import { Pagination } from './DataTable/Pagination'
import { LoadMore } from './GridTable/LoadMore'
import { IColumn, IDynamicValues, IFooterFColumn } from './GridTable/types'
import { ColumnContentAlignment } from './GridTable'

const Wrapper = styled.div<{
  hideBoxShadow?: boolean
  isFullPage?: boolean
  fixedWidth: number | undefined
}>`
  ${({ fixedWidth }) =>
    fixedWidth ? `width: ${fixedWidth}px;` : `width: 100%`}

  @media (max-width: ${({ fixedWidth, theme }) => fixedWidth}px) {
    width: 100%;
  }
  background: ${({ theme }) => theme.colors.white};
  ${({ hideBoxShadow, isFullPage, theme }) =>
    isFullPage
      ? `padding-bottom: 24px;`
      : hideBoxShadow
      ? `padding: 24px 0;`
      : `padding: 24px;
    ${theme.shadows.light};`}
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
  totalWidth?: number
  fixedWidth?: number
}>`
  ${({ fixedWidth, totalWidth }) =>
    fixedWidth ? `width: ${fixedWidth}px;` : `width: ${totalWidth || 100}%;`}
  background: ${({ theme }) => theme.colors.grey100};
  padding: 10px 0px;
  display: flex;
  align-items: flex-start;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  border-radius: 2px 2px 0 0;

  & span:first-child {
    padding-left: 8px;
  }

  & span:last-child {
    padding-right: 8px;
  }
`

const TableHeaderText = styled.div<{
  isSorted?: boolean
}>`
  ${({ theme }) => theme.fonts.bold14};
  color: ${({ theme }) => theme.colors.grey600};
`

const TableBody = styled.div<{
  footerColumns: boolean
  columns: IColumn[]
}>`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme, columns }) =>
    columns.length > 3 && columns.length <= 5
      ? theme.fonts.reg14
      : theme.fonts.reg16};

  & div:last-of-type {
    ${({ footerColumns }) => (footerColumns ? 'border-bottom: none;' : '')};
  }
  & span:first-child {
    padding-left: 8px;
  }

  & span:last-child {
    padding-right: 8px;
  }
`
const RowWrapper = styled.div<{
  totalWidth: number
  highlight?: boolean
  height?: IBreakpoint
  horizontalPadding?: IBreakpoint
  hideTableBottomBorder?: boolean
  alignItemCenter?: boolean
  columns: IColumn[]
}>`
  width: 100%;
  min-height: 48px;
  padding-top: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid
    ${({ theme, columns }) =>
      columns.length > 5 ? theme.colors.grey100 : theme.colors.grey200};

  &:last-child {
    ${({ hideTableBottomBorder }) =>
      hideTableBottomBorder && `border-bottom: 0`};
  }

  display: flex;
  ${({ alignItemCenter }) =>
    alignItemCenter ? `align-items: center` : `align-items: start`};
  ${({ height }) =>
    height ? `min-height:${height.lg}px;` : `min-height: 48px)`};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    ${({ height }) =>
      height ? `min-height:${height.md}px` : `min-height: 48px)`};
  }
  ${({ highlight, theme }) =>
    highlight && `:hover { background-color: ${theme.colors.grey100};}`}

  & span:first-child {
    ${({ horizontalPadding }) =>
      horizontalPadding
        ? `padding-left:${horizontalPadding.lg}px;`
        : `padding-left: 8px;`}
  }

  & span:last-child {
    ${({ horizontalPadding }) =>
      horizontalPadding
        ? `padding-right:${horizontalPadding.lg}px;`
        : `padding-right: 8px;`}
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    & span:first-child {
      text-align: right;
      ${({ horizontalPadding }) =>
        horizontalPadding
          ? `padding-left:${horizontalPadding.md}px;`
          : `padding-left: 8px;`}
    }

    & span:last-child {
      ${({ horizontalPadding }) =>
        horizontalPadding
          ? `padding-right:${horizontalPadding.md}px;`
          : `padding-right: 8px;`}
    }
  }
`
const TableFooter = styled(RowWrapper)`
  padding-right: 10px;
  background: ${({ theme }) => theme.colors.grey200};
  border-top: 2px solid ${({ theme }) => theme.colors.grey500};
  border-bottom: none;
  & span {
    color: ${({ theme }) => theme.colors.copy};
    ${({ theme }) => theme.fonts.bold16};
  }
`

const ContentWrapper = styled.span<{
  width: number
  alignment?: string
  sortable?: boolean
  totalWidth?: number
}>`
  width: ${({ width, totalWidth }) =>
    totalWidth && totalWidth > 100 ? (width * 100) / totalWidth : width}%;
  flex-shrink: 0;
  text-align: ${({ alignment }) => (alignment ? alignment.toString() : 'left')};
  padding-right: 10px;
  cursor: ${({ sortable }) => (sortable ? 'pointer' : 'default')};
  color: ${({ theme }) => theme.colors.tertiary};
`
const ValueWrapper = styled.span<{
  width: number
  totalWidth: number
  alignment?: string
  color?: string
}>`
  width: ${({ width, totalWidth }) =>
    totalWidth > 100 ? (width * 100) / totalWidth : width}%;

  justify-content: ${({ alignment }) =>
    alignment === ColumnContentAlignment.RIGHT ? 'flex-end' : 'flex-start'};
  text-align: ${({ alignment }) => (alignment ? alignment.toString() : 'left')};
  padding-right: 8px;
  ${({ color }) => color && `color: ${color};`}
`
const Error = styled.span`
  color: ${({ theme }) => theme.colors.negative};
`
const ErrorText = styled.div<{ isFullPage?: boolean }>`
  ${({ theme }) => theme.fonts.h3};
  text-align: left;
  margin-left: ${({ isFullPage }) => (isFullPage ? `40px` : `10px`)};
  color: ${({ theme }) => theme.colors.copy};
`
const H3 = styled.div`
  padding-left: 12px;
  margin-bottom: 8px;
  ${({ theme }) => theme.fonts.h4};
  color: ${({ theme }) => theme.colors.copy};
`
export const LoadingTableGrey = styled.span<{
  width?: number
}>`
  background: ${({ theme }) => theme.colors.background};
  display: inline-block;
  height: 24px;
  width: ${({ width }) => (width ? `${width}%` : '100%')};
`
const TableScrollerHorizontal = styled.div<{
  disableScrollOnOverflow?: boolean
}>`
  ${({ disableScrollOnOverflow }) =>
    !disableScrollOnOverflow && `overflow: auto`};
  padding-bottom: 8px;
  padding-right: 10px;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: ${({ theme }) => theme.colors.grey400};
  }
`
const TableScroller = styled.div<{
  height?: number
  totalWidth: number
  isFullPage?: boolean
  offsetTop: number
  fixedWidth: number | undefined
}>`
  display: block;
  max-height: ${({ height, isFullPage, offsetTop }) =>
    isFullPage
      ? `calc(100vh - ${offsetTop}px - 180px)`
      : height
      ? `${height}px`
      : 'auto'};

  ${({ fixedWidth, totalWidth }) =>
    fixedWidth
      ? `width: ${fixedWidth}px;`
      : `width: ${(totalWidth >= 100 && totalWidth) || 100}%;`}
`

const TableHeaderWrapper = styled.div`
  padding-right: 0;
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
const LoadingContainer = styled.div<{
  totalWidth: number
  fixedWidth: number | undefined
}>`
  ${({ fixedWidth, totalWidth }) =>
    fixedWidth
      ? `width: ${fixedWidth}px;`
      : `width: ${(totalWidth >= 100 && totalWidth) || 100}%;`}
  overflow: hidden;
`
const defaultConfiguration = {
  pageSize: 10,
  currentPage: 1
}

interface ITableViewProps {
  id?: string
  content: IDynamicValues[]
  columns: IColumn[]
  footerColumns?: IFooterFColumn[]
  noResultText: string
  tableHeight?: number
  rowStyle?: {
    height: IBreakpoint
    horizontalPadding: IBreakpoint
  }
  onPageChange?: (currentPage: number) => void
  disableScrollOnOverflow?: boolean
  pageSize?: number
  totalItems?: number
  currentPage?: number
  isLoading?: boolean
  tableTitle?: string
  hideBoxShadow?: boolean
  hideTableHeader?: boolean
  hideTableBottomBorder?: boolean
  alignItemCenter?: boolean
  loadMoreText?: string
  highlightRowOnMouseOver?: boolean
  isFullPage?: boolean
  fixedWidth?: number
  noPagination?: boolean
}

interface ITableViewState {
  sortIconInverted: boolean
  sortKey: string | null
  tableOffsetTop: number
}

interface IBreakpoint {
  lg: number
  md: number
}

export class TableView extends React.Component<
  ITableViewProps,
  ITableViewState
> {
  tableRef = React.createRef<HTMLDivElement>()
  state = {
    sortIconInverted: false,
    sortKey: null,
    tableOffsetTop: 0
  }

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

  componentDidUpdate(prevProps: ITableViewProps) {
    if (prevProps.isLoading && !this.props.isLoading) {
      this.setState({
        tableOffsetTop:
          (this.tableRef.current &&
            this.tableRef.current.getBoundingClientRect().top) ||
          0
      })
    }
  }

  render() {
    const defaultPageSize = this.props.noPagination
      ? this.props.content.length
      : defaultConfiguration.pageSize
    const {
      id,
      columns,
      content,
      noResultText,
      pageSize = defaultPageSize,
      currentPage = defaultConfiguration.currentPage,
      isLoading = false,
      tableTitle,
      tableHeight,
      rowStyle,
      hideBoxShadow,
      hideTableHeader,
      hideTableBottomBorder,
      alignItemCenter,
      footerColumns,
      loadMoreText,
      highlightRowOnMouseOver,
      isFullPage,
      fixedWidth,
      noPagination
    } = this.props
    const totalItems = this.props.totalItems || 0
    const totalWidth = columns.reduce((total, col) => (total += col.width), 0)

    return (
      <>
        {!isLoading && (
          <Wrapper
            id={`listTable-${id}`}
            hideBoxShadow={hideBoxShadow}
            isFullPage={isFullPage}
            fixedWidth={fixedWidth}
            ref={this.tableRef}
          >
            {tableTitle && <H3>{tableTitle}</H3>}

            <TableScrollerHorizontal
              disableScrollOnOverflow={this.props.disableScrollOnOverflow}
            >
              {!hideTableHeader && content.length > 0 && (
                <TableHeaderWrapper>
                  <TableHeader totalWidth={totalWidth} fixedWidth={fixedWidth}>
                    {columns.map((preference, index) => (
                      <ContentWrapper
                        key={index}
                        id={`${preference.key}-label`}
                        width={preference.width}
                        totalWidth={totalWidth}
                        alignment={preference.alignment}
                        sortable={preference.isSortable}
                        onClick={() =>
                          preference.isSortable &&
                          preference.sortFunction &&
                          this.invertSortIcon(preference.key) &&
                          preference.sortFunction(preference.key)
                        }
                      >
                        <TableHeaderText isSorted={preference.isSorted}>
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
                </TableHeaderWrapper>
              )}
              <TableScroller
                height={tableHeight}
                isFullPage={isFullPage}
                totalWidth={totalWidth}
                fixedWidth={fixedWidth}
                offsetTop={this.state.tableOffsetTop}
              >
                <TableBody
                  footerColumns={
                    (footerColumns && footerColumns.length > 0) || false
                  }
                  columns={columns}
                >
                  {this.getDisplayItems(currentPage, pageSize, content).map(
                    (item, index) => {
                      return (
                        <RowWrapper
                          id={'row_' + index}
                          key={index}
                          totalWidth={totalWidth}
                          highlight={highlightRowOnMouseOver}
                          height={rowStyle?.height}
                          horizontalPadding={rowStyle?.horizontalPadding}
                          hideTableBottomBorder={hideTableBottomBorder}
                          alignItemCenter={alignItemCenter}
                          columns={columns}
                        >
                          {columns.map((preference, indx) => {
                            return (
                              <ValueWrapper
                                key={indx}
                                width={preference.width}
                                alignment={preference.alignment}
                                color={preference.color}
                                totalWidth={totalWidth}
                              >
                                {item[preference.key] || (
                                  <Error>{preference.errorValue}</Error>
                                )}
                              </ValueWrapper>
                            )
                          })}
                        </RowWrapper>
                      )
                    }
                  )}
                </TableBody>
              </TableScroller>
              {footerColumns && content.length > 1 && (
                <TableFooter
                  id={'TableView-' + id + '-footer'}
                  totalWidth={totalWidth}
                  columns={columns}
                >
                  {footerColumns.map((preference, index) => (
                    <ContentWrapper key={index} width={preference.width}>
                      {preference.label || ''}
                    </ContentWrapper>
                  ))}
                </TableFooter>
              )}
            </TableScrollerHorizontal>
            {content.length <= 0 && (
              <ErrorText id="no-record" isFullPage={isFullPage}>
                {noResultText}
              </ErrorText>
            )}
          </Wrapper>
        )}
        {isLoading && (
          <LoadingContainer totalWidth={totalWidth} fixedWidth={fixedWidth}>
            {tableTitle && <TableTitleLoading />}
            <TableHeader totalWidth={totalWidth} fixedWidth={fixedWidth}>
              {columns.map((preference, index) => (
                <ContentWrapper
                  key={index}
                  width={preference.width}
                  alignment={preference.alignment}
                  sortable={preference.isSortable}
                >
                  <LoadingTableGrey />
                </ContentWrapper>
              ))}
            </TableHeader>
            <TableHeader totalWidth={totalWidth} fixedWidth={fixedWidth}>
              {columns.map((preference, index) => (
                <ContentWrapper
                  key={index}
                  width={preference.width}
                  alignment={preference.alignment}
                  sortable={preference.isSortable}
                >
                  <LoadingTableGrey width={30} />
                </ContentWrapper>
              ))}
            </TableHeader>
          </LoadingContainer>
        )}
        {totalItems > pageSize && (
          <>
            {!loadMoreText && !noPagination && (
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
