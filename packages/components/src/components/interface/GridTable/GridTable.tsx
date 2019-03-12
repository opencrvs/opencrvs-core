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
const ContentBlock = (
  content: string,
  width: number,
  key: number,
  alignment?: ColumnContentAlignment
) => {
  const ContentWrapper = styled.span`
    width: ${width}%;
    display: inline-block;
    text-align: ${alignment ? alignment.toString() : 'left'};
  `
  return <ContentWrapper key={key}>{content}</ContentWrapper>
}

const ActionBlock = (
  actions: IAction[],
  width: number,
  key: number,
  alignment?: ColumnContentAlignment
) => {
  const ContentWrapper = styled.span`
    width: ${width}%;
    display: inline-block;
    text-align: ${alignment ? alignment.toString() : 'left'};
  `
  return (
    <ContentWrapper key={key}>
      <ListItemAction actions={actions} />
    </ContentWrapper>
  )
}

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
}

interface IGridTableState {
  currentPage: number
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
    currentPage: this.props.initialPage || defaultConfiguration.initialPage
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
              ContentBlock(
                preference.label,
                preference.width,
                index,
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
                    return ActionBlock(
                      item[preference.key] as IAction[],
                      preference.width,
                      indx,
                      preference.alignment
                    )
                  } else {
                    return ContentBlock(
                      item[preference.key] as string,
                      preference.width,
                      indx,
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
