import * as React from 'react'
import { grid } from '../../grid'
import styled from 'styled-components'
import {
  IColumn,
  IDynamicValues,
  IExpandedContentPreference
} from '../GridTable/types'
import { Pagination } from '../DataTable/Pagination'

const Wrapper = styled.div`
  width: 100%;
  padding: 25px;
  background: ${({ theme }) => theme.colors.white};
  box-shadow: rgba(53, 67, 93, 0.32) 0px 2px 6px;
`
const TableHeader = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.captionStyle};
  padding: 0 24px;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`
const TableBody = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.bodyStyle};
`
const RowWrapper = styled.div.attrs<{
  expandable?: boolean
  clickable?: boolean
}>({})`
  width: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  min-height: 64px;
  box-shadow: rgba(53, 67, 93, 0.32) 0 2px 2px -2px;
  cursor: ${({ expandable, clickable }) =>
    expandable || clickable ? 'pointer' : 'default'};
`
const ContentWrapper = styled.span.attrs<{
  width: number
  alignment?: string
  color?: string
}>({})`
  width: ${({ width }) => width}%;
  display: inline-block;
  text-align: ${({ alignment }) => (alignment ? alignment.toString() : 'left')};
  padding-right: 10px;
  ${({ color }) => color && `color: ${color};`}
`
const ValueWrapper = styled.span.attrs<{
  width: number
  alignment?: string
  color?: string
}>({})`
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

const defaultConfiguration = {
  pageSize: 10,
  currentPage: 1
}

interface IListTableProps {
  content: IDynamicValues[]
  columns: IColumn[]
  expandedContentRows?: IExpandedContentPreference[]
  noResultText: string
  onPageChange?: (currentPage: number) => void
  pageSize?: number
  totalItems?: number
  currentPage?: number
  expandable?: boolean
  clickable?: boolean
}

interface IListTableState {
  width: number
}

export class ListTable extends React.Component<
  IListTableProps,
  IListTableState
> {
  state = {
    width: window.innerWidth
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

  render() {
    const {
      columns,
      content,
      noResultText,
      pageSize = defaultConfiguration.pageSize,
      currentPage = defaultConfiguration.currentPage
    } = this.props
    const { width } = this.state
    const totalItems = this.props.totalItems || 0

    return (
      <>
        <Wrapper>
          {content.length > 0 && width > grid.breakpoints.lg && (
            <TableHeader>
              {columns.map((preference, index) => (
                <ContentWrapper
                  key={index}
                  width={preference.width}
                  alignment={preference.alignment}
                >
                  {preference.label}
                </ContentWrapper>
              ))}
            </TableHeader>
          )}
          <TableBody>
            {this.getDisplayItems(currentPage, pageSize, content).map(
              (item, index) => {
                return (
                  <RowWrapper
                    key={index}
                    id={'row_' + index}
                    expandable={this.props.expandable}
                    clickable={this.props.clickable}
                  >
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
        </Wrapper>

        {totalItems > pageSize && (
          <Pagination
            initialPage={currentPage}
            totalPages={Math.ceil(totalItems / pageSize)}
            onPageChange={this.onPageChange}
          />
        )}
        {content.length <= 0 && (
          <ErrorText id="no-record">{noResultText}</ErrorText>
        )}
      </>
    )
  }
}
