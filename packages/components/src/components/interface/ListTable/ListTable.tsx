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
import { grid } from '../../grid'
import { Pagination } from '../DataTable/Pagination'
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
const TableHeader = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.captionStyle};
  padding: 10px 0px;
  box-shadow: rgba(53, 67, 93, 0.32) 0 2px 2px -2px;

  & span:last-child {
    text-align: right;
    padding-right: 0px;
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`
const TableFooter = styled(TableHeader)`
  background: ${({ theme }) => theme.colors.background};
  border-top: 2px solid ${({ theme }) => theme.colors.disabled};
  border-bottom: 1px solid ${({ theme }) => theme.colors.disabled};

  & span {
    color: ${({ theme }) => theme.colors.copy};
    ${({ theme }) => theme.fonts.bodyBoldStyle};
  }
  & span:last-child {
    padding-right: 10px;
  }

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: block;
  }
`
const TableBody = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.bodyStyle};
`
const RowWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  min-height: 50px;
  box-shadow: rgba(53, 67, 93, 0.32) 0 2px 2px -2px;

  & span:last-child {
    text-align: right;
    padding-right: 0px;
    display: inline-block;
  }
`
const ContentWrapper = styled.span<{
  width: number
  alignment?: string
  sortable?: boolean
}>`
  width: ${({ width }) => width}%;
  display: inline-block;
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
  margin: auto 0;
  text-align: ${({ alignment }) => (alignment ? alignment.toString() : 'left')};
  padding-right: 10px;
  ${({ color }) => color && `color: ${color};`}
`
const Error = styled.span`
  color: ${({ theme }) => theme.colors.error};
`
const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  ${({ theme }) => theme.fonts.bodyStyle};
  text-align: center;
  margin-top: 100px;
`
const H3 = styled.div`
  ${({ theme }) => theme.fonts.h5Style};
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
  overflow: auto;
  padding-right: 10px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.scrollBarGrey};
    border-radius: 10px;
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
}

interface IListTableState {
  width: number
  sortIconInverted: boolean
  sortKey: string | null
}

export class ListTable extends React.Component<
  IListTableProps,
  IListTableState
> {
  state = {
    width: window.innerWidth,
    sortIconInverted: false,
    sortKey: null
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
      footerColumns
    } = this.props
    const { width } = this.state
    const totalItems = this.props.totalItems || 0

    return (
      <>
        <Wrapper id={`listTable-${id}`} hideBoxShadow={hideBoxShadow}>
          {!isLoading && tableTitle && <H3>{tableTitle}</H3>}
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
          {!isLoading && content.length > 0 && width > grid.breakpoints.lg && (
            <TableHeaderWrapper>
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
                    {preference.label}
                    <ToggleSortIcon
                      toggle={
                        this.state.sortIconInverted &&
                        this.state.sortKey === preference.key
                      }
                    >
                      {preference.icon}
                    </ToggleSortIcon>
                  </ContentWrapper>
                ))}
              </TableHeader>
            </TableHeaderWrapper>
          )}
          {!isLoading && (
            <TableScroller height={tableHeight}>
              <TableBody>
                {this.getDisplayItems(currentPage, pageSize, content).map(
                  (item, index) => {
                    return (
                      <RowWrapper key={index} id={'row_' + index}>
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
                    )
                  }
                )}
              </TableBody>
            </TableScroller>
          )}
          {!isLoading && footerColumns && content.length > 1 && (
            <TableFooter id={'listTable-' + id + '-footer'}>
              {footerColumns.map((preference, index) => (
                <ContentWrapper key={index} width={preference.width}>
                  {preference.label || ''}
                </ContentWrapper>
              ))}
            </TableFooter>
          )}
        </Wrapper>

        {totalItems > pageSize && (
          <Pagination
            initialPage={currentPage}
            totalPages={Math.ceil(totalItems / pageSize)}
            onPageChange={this.onPageChange}
          />
        )}
        {!isLoading && content.length <= 0 && (
          <ErrorText id="no-record">{noResultText}</ErrorText>
        )}
      </>
    )
  }
}
