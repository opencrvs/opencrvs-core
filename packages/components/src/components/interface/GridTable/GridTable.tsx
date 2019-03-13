import * as React from 'react'
import styled from 'styled-components'
import { Box } from '../../interface'
import { ListItemAction } from '../../buttons'
import { Pagination } from '..'

const Wrapper = styled.div`
  width: 100%;
`
const TableHeader = styled.div`
  color: ${({ theme }) => theme.colors.placeholder};
  font-family: ${({ theme }) => theme.fonts.boldFont};
  font-size: 16px;
  margin: 60px 0 25px;
  padding: 0 25px;
  line-height: 22px;
`

const StyledBox = styled(Box)`
  margin-top: 15px;
  padding: 12px 25px;
  color: ${({ theme }) => theme.colors.placeholder};
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 16px;
  line-height: 22px;
`

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-family: ${({ theme }) => theme.fonts.lightFont};
  text-align: center;
  margin-top: 100px;
`

const ContentWrapper = styled.span.attrs<{ width: number; alignment?: string }>(
  {}
)`
  width: ${({ width }) => width}%;
  display: inline-block;
  text-align: ${({ alignment }) => (alignment ? alignment.toString() : 'left')};
`
const ClickableContentWrapper = styled(ContentWrapper)`
  cursor: pointer;
`

export enum ColumnContentAlignment {
  LEFT = 'left',
  RIGHT = 'right',
  CENTER = 'center'
}

export interface IAction {
  label: string
  handler: () => void
}

interface IDynamicValues {
  [key: string]: string | IAction[] | Array<string | null>
}

interface IGridPreference {
  label: string
  width: number
  key: string
  alignment?: ColumnContentAlignment
  isActionColumn?: boolean
}

interface IGridTableProps {
  content: IDynamicValues[]
  columns: IGridPreference[]
  noResultText: string
  onPageChange?: (currentPage: number) => void
  pageSize?: number
  totalPages?: number
  initialPage?: number
  expandable?: boolean
}

interface IGridTableState {
  currentPage: number
  expanded: string[]
}

const defaultConfiguration = {
  pageSize: 10,
  initialPage: 1
}

const getTotalPageNumber = (totalItemCount: number, pageSize: number) => {
  return totalItemCount > 0 ? Math.ceil(totalItemCount / pageSize) : 0
}

export class GridTable extends React.Component<
  IGridTableProps,
  IGridTableState
> {
  state = {
    currentPage: this.props.initialPage || defaultConfiguration.initialPage,
    expanded: []
  }

  renderContentBlock = (
    content: string,
    width: number,
    key: number,
    clickableId: string = '',
    alignment?: ColumnContentAlignment
  ) => {
    if (clickableId === '' || !this.props.expandable) {
      return (
        <ContentWrapper key={key} width={width} alignment={alignment}>
          {content}
        </ContentWrapper>
      )
    } else {
      return (
        <ClickableContentWrapper
          key={key}
          width={width}
          alignment={alignment}
          onClick={() => this.toggleExpanded(clickableId)}
        >
          {content}
        </ClickableContentWrapper>
      )
    }
  }

  renderActionBlock = (
    itemId: string,
    actions: IAction[],
    width: number,
    key: number,
    alignment?: ColumnContentAlignment
  ) => {
    const { expandable } = this.props
    return (
      <ContentWrapper key={key} width={width} alignment={alignment}>
        <ListItemAction actions={actions} />
      </ContentWrapper>
    )
  }

  toggleExpanded = (itemId: string) => {
    const toggledExpandedList = []
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

  shouldExpand = (itemId: string) => {
    return true
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

  onPageChange = (currentPage: number) => {
    if (this.props.onPageChange) {
      this.props.onPageChange(currentPage)
    } else {
      this.setState({ currentPage })
    }
  }

  render() {
    const {
      columns,
      content,
      noResultText,
      pageSize = defaultConfiguration.pageSize,
      initialPage = defaultConfiguration.initialPage
    } = this.props
    const { currentPage } = this.state
    const totalPages = this.props.totalPages
      ? this.props.totalPages
      : getTotalPageNumber(
          content.length,
          this.props.pageSize || defaultConfiguration.pageSize
        )
    return (
      <Wrapper>
        {content.length > 0 && (
          <TableHeader>
            {columns.map((preference, index) =>
              this.renderContentBlock(
                preference.label,
                preference.width,
                index,
                '',
                preference.alignment
              )
            )}
          </TableHeader>
        )}
        {this.getDisplayItems(currentPage, pageSize, content).map(
          (item, index) => {
            return (
              <StyledBox key={index}>
                {columns.map((preference, indx) => {
                  if (preference.isActionColumn) {
                    return this.renderActionBlock(
                      item.id as string,
                      item[preference.key] as IAction[],
                      preference.width,
                      indx,
                      preference.alignment
                    )
                  } else {
                    return this.renderContentBlock(
                      item[preference.key] as string,
                      preference.width,
                      indx,
                      item.id as string,
                      preference.alignment
                    )
                  }
                })}
              </StyledBox>
            )
          }
        )}
        {content.length > 0 && (
          <Pagination
            initialPage={initialPage}
            totalPages={totalPages}
            onPageChange={this.onPageChange}
          />
        )}
        {content.length <= 0 && (
          <ErrorText id="no-record">{noResultText}</ErrorText>
        )}
      </Wrapper>
    )
  }
}
