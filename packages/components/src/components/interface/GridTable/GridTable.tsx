import * as React from 'react'
import styled, { keyframes } from 'styled-components'
import { Box } from '../../interface'
import { ListItemAction } from '../../buttons'
import { Pagination } from '..'
import { ExpansionContentInfo } from './ExpansionContentInfo'
import { IAction, IDynamicValues, IExpandedContentPreference } from './types'
import { grid } from '../../grid'
export { IAction } from './types'

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
  margin: 60px 0 25px;
  padding: 0 25px;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

const StyledBox = styled(Box)`
  margin-top: 8px;
  padding: 7px 0px 0px 0px;
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.bodyStyle};
`

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  ${({ theme }) => theme.fonts.bodyStyle};
  text-align: center;
  margin-top: 100px;
`

const RowWrapper = styled.div.attrs<{ expandable?: boolean }>({})`
  width: 100%;
  cursor: ${({ expandable }) => (expandable ? 'pointer' : 'default')};
  padding: 0 24px;
  display: flex;
  align-items: center;
  min-height: 56px;
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
const ActionWrapper = styled(ContentWrapper)`
  padding-right: 0px;
`
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`
const ExpandedSectionContainer = styled.div.attrs<{ expanded: boolean }>({})`
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

interface IGridPreference {
  label: string
  width: number
  key: string
  errorValue?: string
  alignment?: ColumnContentAlignment
  isActionColumn?: boolean
  color?: string
}

interface IGridTableProps {
  content: IDynamicValues[]
  columns: IGridPreference[]
  expandedContentRows?: IExpandedContentPreference[]
  noResultText: string
  onPageChange?: (currentPage: number) => void
  pageSize?: number
  totalPages?: number
  initialPage?: number
  expandable?: boolean
  clickable?: boolean
}

interface IGridTableState {
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
    expanded: []
  }

  renderActionBlock = (
    itemId: string,
    actions: IAction[],
    width: number,
    key: number,
    alignment?: ColumnContentAlignment
  ) => {
    if (this.props.expandable) {
      return (
        <ActionWrapper
          key={key}
          width={width}
          alignment={alignment}
          id="ActionWrapper"
        >
          <ListItemAction
            actions={actions}
            expanded={
              this.state.expanded.findIndex(id => id === itemId) >= 0 || false
            }
            id="ListItemAction"
            onExpand={() => this.toggleExpanded(itemId)}
          />
        </ActionWrapper>
      )
    } else {
      return (
        <ActionWrapper key={key} width={width} alignment={alignment}>
          <ListItemAction actions={actions} />
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
    }
  }

  getRowClickHandler = (itemRowClickHandler: IAction[]) => {
    return itemRowClickHandler[0].handler
  }

  render() {
    const {
      columns,
      content,
      noResultText,
      pageSize = defaultConfiguration.pageSize,
      initialPage = defaultConfiguration.initialPage
    } = this.props
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
        {this.getDisplayItems(initialPage, pageSize, content).map(
          (item, index) => {
            const expanded = this.showExpandedSection(item.id as string)
            return (
              <StyledBox key={index}>
                <RowWrapper
                  id={'row_' + index}
                  expandable={this.props.expandable}
                  onClick={() =>
                    (this.props.expandable &&
                      this.toggleExpanded(item.id as string)) ||
                    (this.props.clickable &&
                      this.getRowClickHandler(
                        item.rowClickHandler as IAction[]
                      )())
                  }
                >
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
                    {expanded && (
                      <ExpansionContentInfo
                        data={item}
                        preference={this.props.expandedContentRows}
                      />
                    )}
                  </ExpandedSectionContainer>
                )}
              </StyledBox>
            )
          }
        )}

        {totalPages > pageSize && (
          <Pagination
            initialPage={initialPage}
            totalPages={Math.ceil(totalPages / pageSize)}
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
