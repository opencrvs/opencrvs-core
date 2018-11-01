import * as React from 'react'
import styled from 'styled-components'
import { Next, Previous } from '../icons'

export interface IPaginationCustomProps {
  pageSize: number
  initialPage: number
  totalItemCount: number
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
const Icon = styled.div`
  cursor: pointer;
  opacity: ${(props: IButtonProps) => (props.disabled ? 0.5 : 1)};
`
const PaginationLabel = styled.div`
  margin: 0 10px;
  span:nth-child(1) {
    padding-right: 2px;
  }
`
const PageNumber = styled.span`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`
const PaginationText = styled.span`
  margin: 0 5px;
  text-transform: uppercase;
`
interface IState {
  canPrevious: boolean
  canNext: boolean
  currentPage: number
  totalPages: number
}

export class Pagination extends React.Component<
  IPaginationCustomProps,
  IState
> {
  constructor(props: IPaginationCustomProps, {}) {
    super(props)

    const { initialPage, totalItemCount, pageSize } = props
    this.state = {
      canPrevious: false,
      canNext: false,
      currentPage: initialPage && initialPage > 0 ? initialPage : 1,
      totalPages: Math.floor(totalItemCount / pageSize)
    }
  }

  canPrevious = () => this.state.currentPage > 1

  canNext = () => this.state.currentPage + 1 <= this.state.totalPages

  changePage = (page: number) =>
    this.setState({ currentPage: page }, () => this.props.onPageChange(page))

  render() {
    const { initialPage, totalItemCount, pageSize, ...props } = this.props
    const { currentPage, totalPages } = this.state

    return (
      <PaginationContainer>
        <Icon
          onClick={() => {
            if (this.canPrevious()) {
              this.changePage(currentPage - 1)
            }
          }}
          disabled={!this.canPrevious()}
        >
          <Previous />
        </Icon>
        <PaginationLabel>
          <PageNumber>{currentPage}</PageNumber>
          <PaginationText>of</PaginationText>
          <PageNumber>{totalPages}</PageNumber>
        </PaginationLabel>
        <Icon
          onClick={() => {
            if (this.canNext()) {
              this.changePage(currentPage + 1)
            }
          }}
          disabled={!this.canNext()}
        >
          <Next />
        </Icon>
      </PaginationContainer>
    )
  }
}
