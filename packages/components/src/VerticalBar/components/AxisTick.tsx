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
import { withTheme } from 'styled-components'
import { ITheme } from '../../theme'
import { IDataPoint } from '../../chart-datapoint-types'

export interface ICustomizedAxisTick {
  x: number
  y: number
  stroke: number
  payload: IDataPoint
  totalValue: number
}

export const CustomizedXAxisTick = withTheme(
  (props: ICustomizedAxisTick & { theme: ITheme }) => {
    const { x, y, payload, totalValue, theme } = props

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={10}
          dy={16}
          fontFamily={theme.fontFamily}
          textAnchor="middle"
          fill={theme.colors.primary}
        >
          {payload && payload.label}
        </text>
        <text
          x={0}
          y={31}
          dy={16}
          fontFamily={theme.fontFamily}
          textAnchor="middle"
          fill={theme.colors.primary}
        >
          {payload && `${Math.round((payload.value / totalValue) * 100)}%`}
        </text>
        <text
          x={0}
          y={52}
          dy={16}
          fontFamily={theme.fontFamily}
          fontSize={12}
          textAnchor="middle"
          fill={theme.colors.copy}
        >
          {payload && payload.value}
        </text>
      </g>
    )
  }
)

export const CustomizedYAxisTick = withTheme(
  (props: ICustomizedAxisTick & { theme: ITheme }) => {
    const { x, y, payload, theme } = props
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          dy={8}
          fontFamily={theme.fontFamily}
          textAnchor="end"
          height={22}
          fill={theme.colors.primary}
        >
          {payload && payload.value}
        </text>
      </g>
    )
  }
)
