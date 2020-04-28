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
import { Line } from 'rc-progress'

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 2px 0 2px;
`

const TitleLink = styled.div`
  ${({ theme }) => theme.fonts.bodyStyle};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: underline;
`
const ValueHolder = styled.div`
  ${({ theme }) => theme.fonts.bodyStyle};
`
const Value = styled.span`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
`

interface IProgressBarProps {
  title?: string
  color?: string
  totalPoints: number
  currentPoints: number
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
}

export class ProgressBar extends React.Component<IProgressBarProps, {}> {
  defaultClickHadler() {
    alert('No handler has been defired')
  }

  render() {
    const {
      title = '',
      color = 'blue',
      totalPoints,
      currentPoints
    } = this.props
    const percentage =
      totalPoints === 0 || currentPoints === 0
        ? 0
        : Number(((currentPoints / totalPoints) * 100).toFixed(2))
    return (
      <>
        <HeaderWrapper>
          <TitleLink onClick={this.props.onClick || this.defaultClickHadler}>
            {title}
          </TitleLink>
          <ValueHolder>
            <Value>{currentPoints}</Value> ({percentage}%)
          </ValueHolder>
        </HeaderWrapper>
        <Line percent={percentage} strokeColor={color} />
      </>
    )
  }
}
