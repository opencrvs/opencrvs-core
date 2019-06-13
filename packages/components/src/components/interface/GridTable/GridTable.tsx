import * as React from 'react'
import styled from 'styled-components'
import { Box } from '../../interface'
import { ListItemAction } from '../../buttons'
import { Pagination } from '..'
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

const RowWrapper = styled.div.attrs<{
  expandable?: boolean
  clickable?: boolean
}>({})`
  width: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  min-height: 64px;
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
const ActionWrapper = styled(ContentWrapper)`
  padding-right: 0px;
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
  renderExpandedComponent?: (eventId: string) => React.ReactNode
  noResultText: string
  hideTableHeader?: boolean
  onPageChange?: (currentPage: number) => void
  pageSize?: number
  totalItems: number
  currentPage?: number
  expandable?: boolean
  clickable?: boolean
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
      hideTableHeader,
      pageSize = defaultConfiguration.pageSize,
      currentPage = defaultConfiguration.currentPage
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
                  id={'row_' + index}
                  expandable={this.props.expandable}
                  clickable={this.props.clickable}
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
                    {expanded &&
                      this.props.renderExpandedComponent &&
                      this.props.renderExpandedComponent(item.id as string)}
                  </ExpandedSectionContainer>
                )}
              </StyledBox>
            )
          }
        )}

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
      </Wrapper>
    )
  }
}
