import * as React from 'react'
import styled from 'styled-components'
import { Next, Previous } from '../icons'
import { Button } from '../buttons/Button'

export interface IPaginationCustomProps {
  className?: string
  pageSize: number
  initialPage: number
  totalItemCount: number
  totalPages: number
  onPageChange: (page: number) => void
}

interface IButtonProps {
  disabled: boolean
}

const PaginationContainer = styled.div`
  width: 100%;
  height: 60px;
  padding: 0 ${({ theme }) => theme.grid.margin}px;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`
const Icon = styled(Button)`
  cursor: pointer;
  opacity: ${(props: IButtonProps) => (props.disabled ? 0.5 : 1)};
  border: none;
  outline: none;
`
const PaginationLabel = styled.div`
  span:nth-child(1) {
    padding-right: 2px;
  }
`
const PageNumber = styled.span`
  ${({ theme }) => theme.fonts.heavyFontStyle};
  color: ${({ theme }) => theme.colors.primary};
`
const PaginationText = styled.span`
  margin: 0 5px;
  ${({ theme }) => theme.fonts.capsFontStyle};
`
interface IState {
  canPrevious: boolean
  canNext: boolean
  currentPage: number
}

export class Pagination extends React.Component<
  IPaginationCustomProps,
  IState
> {
  constructor(props: IPaginationCustomProps, {}) {
    super(props)

    const { initialPage, totalItemCount, pageSize, totalPages } = props
    this.state = {
      canPrevious: false,
      canNext: false,
      currentPage:
        totalPages > 0 ? (initialPage && initialPage > 0 ? initialPage : 1) : 0
    }
  }

  canGoToPreviousPage = () => this.state.currentPage > 1

  canGoToNextPage = () => this.state.currentPage + 1 <= this.props.totalPages

  changePage = (page: number) =>
    this.setState(
      () => ({ currentPage: page }),
      () => this.props.onPageChange(page)
    )

  render() {
    const {
      initialPage,
      totalPages,
      totalItemCount,
      pageSize,
      className,
      ...props
    } = this.props
    const { currentPage } = this.state

    return (
      <PaginationContainer className={className}>
        <Icon
          onClick={() => {
            this.changePage(currentPage - 1)
          }}
          disabled={!this.canGoToPreviousPage()}
        >
          <Previous />
        </Icon>
        <PaginationLabel>
          <PageNumber>{currentPage}</PageNumber>
          <PaginationText>/</PaginationText>
          <PageNumber>{totalPages}</PageNumber>
        </PaginationLabel>
        <Icon
          onClick={() => {
            this.changePage(currentPage + 1)
          }}
          disabled={!this.canGoToNextPage()}
        >
          <Next />
        </Icon>
      </PaginationContainer>
    )
  }
}
