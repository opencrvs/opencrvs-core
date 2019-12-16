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
import { Button } from '../../buttons/Button'

interface ILoadMoreCustomProps {
  initialPage: number
  onLoadMore: (page: number) => void
}
interface IState {
  canNext: boolean
}

const LoadMoreContainer = styled.div`
  width: 100%;
  height: 60px;
  padding: 0 ${({ theme }) => theme.grid.margin}px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
`

const StyledButton = styled(Button)`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: underline;
`

export class LoadMore extends React.Component<ILoadMoreCustomProps, IState> {
  render() {
    return (
      <LoadMoreContainer>
        <StyledButton
          onClick={() => this.props.onLoadMore(this.props.initialPage + 1)}
        >
          Load More
        </StyledButton>
      </LoadMoreContainer>
    )
  }
}
