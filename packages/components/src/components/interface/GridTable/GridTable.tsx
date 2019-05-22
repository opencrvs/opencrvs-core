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
`
const TableHeader = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.captionStyle};
  margin: 60px 0 25px;
  padding: 0 25px;
`

const StyledBox = styled(Box)`
  margin: 15px 10px;
  padding: 17px 0px 10px 0px;
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
`

const ContentWrapper = styled.span.attrs<{ width: number; alignment?: string }>(
  {}
)`
  width: ${({ width }) => width}%;
  display: inline-block;
  text-align: ${({ alignment }) => (alignment ? alignment.toString() : 'left')};
  padding-right: 10px;
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
}

interface IGridTableState {
  currentPage: number
  width: number
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
    const { currentPage, width } = this.state
    const totalPages = this.props.totalPages
      ? this.props.totalPages
      : getTotalPageNumber(
          content.length,
          this.props.pageSize || defaultConfiguration.pageSize
        )
    return (
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
        {this.getDisplayItems(currentPage, pageSize, content).map(
          (item, index) => {
            const expanded = this.showExpandedSection(item.id as string)
            return (
              <StyledBox key={index}>
                <RowWrapper
                  expandable={this.props.expandable}
                  onClick={() => this.toggleExpanded(item.id as string)}
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
                        >
                          {(item[preference.key] as string) || (
                            <Error>{preference.errorValue}</Error>
                          )}
                        </ContentWrapper>
                      )
                    }
                  })}
                </RowWrapper>

                <ExpandedSectionContainer expanded={expanded}>
                  {expanded && (
                    <ExpansionContentInfo
                      data={item}
                      preference={this.props.expandedContentRows}
                    />
                  )}
                </ExpandedSectionContainer>
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
