/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import * as React from 'react'
import styled from 'styled-components'
import { Button } from '../Button'
import { Icon } from '../Icon'

export type IPaginationVariant = 'small' | 'large' // small for desktop and large for mobile

export interface IPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  siblingCount?: number
}

const PaginationWrapper = styled.div`
  display: flex;
  align-items: center;
`

const DesktopWrapper = styled.div`
  display: flex;
  float: left;
  @media only screen and (max-width: 1023px) {
    display: none;
  }
`

const MobileWrapper = styled.div`
  display: none;
  @media only screen and (max-width: 1023px) {
    display: inline-flex;
    align-items: center;
    margin-left: auto;
    margin-right: auto;
  }
`

const PaginationContainer = styled.div`
  height: 40px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const StyledPagination = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2px;
`

const PageNumberButton = styled(Button)`
  height: 24px;
`

const DotsButton = styled(Button)`
  height: 24px;
`

const StyledPageNumber = styled.span<{ isCurrentPage: boolean; size?: string }>`
  ${({ theme, size }) =>
    size && size === 'large' ? theme.fonts.h4 : theme.fonts.bold12};
  color: ${({ theme, isCurrentPage }) =>
    isCurrentPage ? theme.colors.grey600 : theme.colors.grey400};
`
export class Pagination extends React.Component<IPaginationProps> {
  currentPage = () =>
    this.props.totalPages > 0
      ? this.props.currentPage && this.props.currentPage > 0
        ? this.props.currentPage
        : 1
      : 0

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

  canGoToPreviousPage = () => this.currentPage() > 1

  canGoToNextPage = () => this.currentPage() + 1 <= this.props.totalPages

  changePage = (page: number | string) => {
    if (typeof page === 'number') {
      this.props.onPageChange(page)
    }
  }

  renderPages(size: IPaginationVariant) {
    const { totalPages } = this.props
    const currentPage = this.currentPage()

    if (currentPage > totalPages) {
      this.changePage(totalPages)
    }
    const pages = this.paginationRow(currentPage, totalPages, 1)
    return (
      <PaginationContainer id="pagination">
        <Button
          type="icon"
          size="small"
          onClick={() => {
            this.changePage(currentPage - 1)
          }}
          disabled={!this.canGoToPreviousPage()}
          aria-label="Previous page"
        >
          <Icon color="grey400" name="CaretLeft" size="small" />
        </Button>
        <StyledPagination>
          {pages.map((page, id) => {
            if (page === '...') {
              return (
                <DotsButton
                  key={id}
                  type="tertiary"
                  size="small"
                  disabled // Disable click events on the dots
                >
                  <StyledPageNumber size={size} isCurrentPage={false}>
                    {page}
                  </StyledPageNumber>
                </DotsButton>
              )
            }
            return (
              <PageNumberButton
                key={id}
                type="tertiary"
                size="small"
                id={`page-number-${id}`}
                onClick={() => this.changePage(page)}
              >
                <StyledPageNumber
                  size={size}
                  isCurrentPage={
                    typeof page === 'number' && page === currentPage
                  }
                >
                  {page}
                </StyledPageNumber>
              </PageNumberButton>
            )
          })}
        </StyledPagination>
        <Button
          type="icon"
          size="small"
          onClick={() => {
            this.changePage(currentPage + 1)
          }}
          disabled={!this.canGoToNextPage()}
          aria-label="Next page"
        >
          <Icon color="grey400" name="CaretRight" size="small" />
        </Button>
      </PaginationContainer>
    )
  }

  render() {
    return (
      <PaginationWrapper id="pagination_container">
        <DesktopWrapper>{this.renderPages('small')}</DesktopWrapper>
        <MobileWrapper>{this.renderPages('large')}</MobileWrapper>
      </PaginationWrapper>
    )
  }
}
