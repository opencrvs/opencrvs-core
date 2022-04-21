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
import { Next, Previous } from '../icons'
import { Button } from '../buttons/Button'
import { CircleButton } from '../buttons'
import { PreviousLarge, NextLarge } from '../icons'

export type IPaginationVariant = 'small' | 'large' // small for desktop and large for mobile

export interface IPaginationProps {
  initialPage: number
  totalPages: number
  onPageChange: (page: number) => void
  siblingCount?: number
  size?: IPaginationVariant
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
  margin-top: 20px;
`
const Icon = styled(Button)`
  cursor: pointer;
  opacity: ${(props: IButtonProps) => (props.disabled ? 0.5 : 1)};
  border: none;
  outline: none;
  &:disabled {
    background: none;
  }
`
const StyledPagination = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: 2px;
  margin-right: 2px;
`
const StyledPageNumber = styled.span<{ isCurrentPage: boolean; size?: string }>`
  ${({ theme, size }) =>
    size && size === 'large' ? theme.fonts.h3 : theme.fonts.bold14};
  color: ${({ theme, isCurrentPage }) =>
    isCurrentPage ? theme.colors.grey600 : theme.colors.grey400};
`
interface IState {
  canPrevious: boolean
  canNext: boolean
  currentPage: number
}

export class PaginationModified extends React.Component<
  IPaginationProps,
  IState
> {
  constructor(props: IPaginationProps, {}) {
    super(props)

    const { initialPage, totalPages } = props
    this.state = {
      canPrevious: false,
      canNext: false,
      currentPage:
        totalPages > 0 ? (initialPage && initialPage > 0 ? initialPage : 1) : 0
    }
  }

  pageRange = (start: number, end: number) => {
    const length = end - start + 1
    return Array.from({ length }, (_, idx) => idx + start)
  }

  paginationRow = (
    currentPage: number,
    totalPages: number,
    siblingCount: number
  ) => {
    if (totalPages <= 6) {
      return this.pageRange(1, totalPages)
    }
    const DOTs = '...'
    const leftRangeIndex = Math.max(currentPage - siblingCount, 1)
    const rightRangeIndex = Math.min(currentPage + siblingCount, totalPages)

    const showLeftDots = leftRangeIndex > 3
    const showRightDots = rightRangeIndex < totalPages - 2

    if (showLeftDots && showRightDots) {
      const middleRange = this.pageRange(leftRangeIndex, rightRangeIndex)
      return [1, DOTs, ...middleRange, DOTs, totalPages]
    } else if (showLeftDots && !showRightDots) {
      const rightItemsCount = 3 + 2 * siblingCount
      const rightRange = this.pageRange(
        totalPages - rightItemsCount + 1,
        totalPages
      )
      return [1, DOTs, ...rightRange]
    } else if (!showLeftDots && showRightDots) {
      const leftItemsCount = 3 + 2 * siblingCount
      const leftRange = this.pageRange(1, leftItemsCount)
      return [...leftRange, DOTs, totalPages]
    }

    return this.pageRange(1, totalPages)
  }

  canGoToPreviousPage = () => this.state.currentPage > 1

  canGoToNextPage = () => this.state.currentPage + 1 <= this.props.totalPages

  changePage = (page: any) => {
    if (typeof page === 'number') {
      this.setState(
        () => ({ currentPage: page }),
        () => this.props.onPageChange(page)
      )
    }
  }

  render() {
    const { totalPages } = this.props
    const { currentPage } = this.state

    if (currentPage > totalPages) {
      this.changePage(totalPages)
    }
    const pages = this.paginationRow(this.state.currentPage, totalPages, 1)
    return (
      <PaginationContainer id="pagination">
        <Icon
          onClick={() => {
            this.changePage(currentPage - 1)
          }}
          disabled={!this.canGoToPreviousPage()}
        >
          {this.props.size && this.props.size === 'small' ? (
            <Previous id="prev" />
          ) : (
            <PreviousLarge id="prev" />
          )}
        </Icon>
        <StyledPagination>
          {pages.map((page, id) => (
            <CircleButton
              size={this.props.size ? this.props.size : 'small'}
              id="page-number"
              onClick={() => this.changePage(page)}
            >
              <StyledPageNumber
                size={this.props.size || 'small'}
                isCurrentPage={
                  typeof page === 'number' && page === this.state.currentPage
                }
              >
                {page}
              </StyledPageNumber>
            </CircleButton>
          ))}
        </StyledPagination>
        <Icon
          onClick={() => {
            this.changePage(currentPage + 1)
          }}
          disabled={!this.canGoToNextPage()}
        >
          {this.props.size && this.props.size === 'small' ? (
            <Next id="next" />
          ) : (
            <NextLarge id="next" />
          )}
        </Icon>
      </PaginationContainer>
    )
  }
}
