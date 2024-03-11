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
import { Button } from '../../buttons/Button'

type UsageTableType = 'grid' | 'list'
interface ILoadMoreCustomProps {
  initialPage: number
  onLoadMore: (page: number) => void
  loadMoreText: string
  usageTableType?: UsageTableType
}

const LoadMoreContainer = styled.div<{ usageTableType?: UsageTableType }>`
  width: 100%;
  ${({ usageTableType }) =>
    !usageTableType || usageTableType === 'grid'
      ? `
      height: 60px;
      padding: 0 20px;
      display: flex;
      align-items: center;            
      justify-content: center;
      margin-top: 20px;
      `
      : ''};
`

const StyledButton = styled(Button)`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: underline;
`

export const LoadMore = ({
  usageTableType,
  onLoadMore,
  loadMoreText,
  initialPage
}: ILoadMoreCustomProps) => (
  <LoadMoreContainer usageTableType={usageTableType}>
    <StyledButton
      id="load_more_button"
      onClick={() => onLoadMore(initialPage + 1)}
    >
      {loadMoreText}
    </StyledButton>
  </LoadMoreContainer>
)
