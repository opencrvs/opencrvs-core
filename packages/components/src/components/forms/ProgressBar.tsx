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
  padding-bottom: 5px;
`

const TitleLink = styled.div`
  cursor: pointer;
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
const Percentage = styled.span`
  color: ${({ theme }) => theme.colors.placeholder};
`
const LoaderBox = styled.span<{
  width?: number
}>`
  background: ${({ theme }) => theme.colors.background};
  display: inline-block;
  height: 24px;
  width: ${({ width }) => (width ? `${width}%` : '100%')};
`

type ProgressBarShape = 'square' | 'round' | 'butt'

interface IProgressBarProps {
  loading?: boolean
  title?: string
  color?: string
  width?: number
  shape?: ProgressBarShape
  totalPoints?: number
  currentPoints?: number
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
}

export class ProgressBar extends React.Component<IProgressBarProps, {}> {
  defaultClickHadler() {
    // do nothing
  }

  render() {
    const {
      title = '',
      color,
      width = 2,
      shape = 'square',
      totalPoints = 0,
      currentPoints = 0,
      loading = false
    } = this.props
    const percentage =
      totalPoints === 0 || currentPoints === 0
        ? 0
        : Number(((currentPoints / totalPoints) * 100).toFixed(2))
    return (
      <>
        {(!loading && (
          <HeaderWrapper>
            <TitleLink onClick={this.props.onClick || this.defaultClickHadler}>
              {title}
            </TitleLink>
            <ValueHolder>
              <Value>{currentPoints}</Value>{' '}
              <Percentage>({percentage}%)</Percentage>
            </ValueHolder>
          </HeaderWrapper>
        )) || (
          <HeaderWrapper>
            <LoaderBox width={35} />
            <LoaderBox width={15} />
          </HeaderWrapper>
        )}
        <Line
          percent={percentage}
          strokeWidth={width}
          trailWidth={width}
          strokeLinecap={shape}
          strokeColor={percentage > 0 ? color : ''}
        />
      </>
    )
  }
}
