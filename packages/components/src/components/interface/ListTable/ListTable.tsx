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
import { ColumnContentAlignment } from '../GridTable'
import CustomScroll from 'react-custom-scroll'

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
      ? `padding-bottom:24px;`
      : hideBoxShadow
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
  totalWidth?: number
  fixedWidth?: number
}>`

${({ fixedWidth, totalWidth }) =>
  fixedWidth ? `width: ${fixedWidth}px;` : `width: ${totalWidth || 100}%;`}
  border-bottom: 1px solid ${({ theme }) => theme.colors.disabled};
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
const RowWrapper = styled.div<{ totalWidth: number; highlight?: boolean }>`
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.colors.disabled};
  display: flex;
  align-items: center;
  min-height: 48px;
  ${({ highlight, theme }) =>
    highlight && `:hover { background-color: ${theme.colors.dropdownHover};}`}
  & span:first-child {
    padding-left: 12px;
  }

  & span:last-child {
    text-align: right;
    padding-right: 12px;
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

  display: flex;
  justify-content: ${({ alignment }) =>
    alignment === ColumnContentAlignment.RIGHT ? 'flex-end' : 'flex-start'};
  align-items: stretch;
  flex-shrink: 0;
  margin: auto 0;
  text-align: ${({ alignment }) => (alignment ? alignment.toString() : 'left')};
  padding-right: 10px;
  ${({ color }) => color && `color: ${color};`}
`
const Error = styled.span`
  color: ${({ theme }) => theme.colors.error};
`
const ErrorText = styled.div<{ isFullPage?: boolean }>`
  ${({ theme }) => theme.fonts.h5Style};
  text-align: left;
  margin-left: ${({ isFullPage }) => (isFullPage ? `40px` : `10px`)};
  color: ${({ theme }) => theme.colors.copy};
`
const H3 = styled.div`
  padding-left: 12px;
  margin-bottom: 8px;
  ${({ theme }) => theme.fonts.bigBodyBoldStyle};
  color: ${({ theme }) => theme.colors.copy};
`
export const LoadingGrey = styled.span<{
  width?: number
}>`
  background: ${({ theme }) => theme.colors.background};
  display: inline-block;
  height: 24px;
  width: ${({ width }) => (width ? `${width}%` : '100%')};
`
const TableScrollerHorizontal = styled.div<{ scrolling: boolean }>`
  overflow: auto;
  padding-bottom: 8px;
  padding-right: 10px;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  @keyframes showScrollBar {
    from {
      background: ${({ theme }) => theme.colors.lightScrollBarGrey};
    }
    to {
      background: ${({ theme }) => theme.colors.white};
    }
  }
  @keyframes hideScrollBar {
    from {
      background: ${({ theme }) => theme.colors.white};
    }
    to {
      background: ${({ theme }) => theme.colors.lightScrollBarGrey};
    }
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    animation: ${({ scrolling }) =>
        scrolling ? 'showScrollBar' : 'hideScrollBar'}
      1500ms cubic-bezier(0.65, 0.05, 0.36, 1);
    :hover {
      animation: showScrollBar 1500ms cubic-bezier(0.65, 0.05, 0.36, 1);
    }
  }
`
const TableScroller = styled.div<{
  height?: number
  totalWidth: number
  isFullPage?: boolean
  fixedWidth: number | undefined
}>`
  display: block;
  max-height: ${({ height, isFullPage }) =>
    isFullPage ? '65vh' : height ? `${height}px` : 'auto'};

  ${({ fixedWidth, totalWidth }) =>
    fixedWidth
      ? `width: ${fixedWidth}px;`
      : `width: ${(totalWidth >= 100 && totalWidth) || 100}%;`}
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
  hideTableHeader?: boolean
  loadMoreText?: string
  highlightRowOnMouseOver?: boolean
  isFullPage?: boolean
  fixedWidth?: number
}

interface IListTableState {
  sortIconInverted: boolean
  sortKey: string | null
  isScrolling: boolean
}

export class ListTable extends React.Component<
  IListTableProps,
  IListTableState
> {
  state = {
    sortIconInverted: false,
    sortKey: null,
    isScrolling: false
  }
  private scrollerRef: React.RefObject<HTMLDivElement> = React.createRef()

  componentDidUpdate() {
    if (this.scrollerRef.current) {
      this.scrollerRef.current.addEventListener('scroll', this.onScroll)
    }
  }

  onScroll = () => {
    if (!this.state.isScrolling) {
      this.setState({ isScrolling: true })
      setTimeout(() => {
        this.setState({ isScrolling: false })
      }, 1500)
    }
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
      hideTableHeader,
      footerColumns,
      loadMoreText,
      highlightRowOnMouseOver,
      isFullPage,
      fixedWidth
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
          >
            {tableTitle && <H3>{tableTitle}</H3>}

            <TableScrollerHorizontal
              ref={this.scrollerRef}
              scrolling={this.state.isScrolling}
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
                </TableHeaderWrapper>
              )}
              <TableScroller
                height={tableHeight}
                isFullPage={isFullPage}
                totalWidth={totalWidth}
                fixedWidth={fixedWidth}
              >
                <TableBody
                  footerColumns={
                    (footerColumns && footerColumns.length > 0) || false
                  }
                >
                  {this.getDisplayItems(currentPage, pageSize, content).map(
                    (item, index) => {
                      return (
                        <RowWrapper
                          id={'row_' + index}
                          key={index}
                          totalWidth={totalWidth}
                          highlight={highlightRowOnMouseOver}
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
                  id={'listTable-' + id + '-footer'}
                  totalWidth={totalWidth}
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
                  <LoadingGrey />
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
                  <LoadingGrey width={30} />
                </ContentWrapper>
              ))}
            </TableHeader>
          </LoadingContainer>
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
