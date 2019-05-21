import * as React from 'react'
import { withTheme } from 'styled-components'
import { ITheme } from '../theme'
import { IDataPoint } from './datapoint'

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
          fontFamily={theme.fonts.regularFont}
          textAnchor="middle"
          fill={theme.colors.secondary}
        >
          {payload && payload.label}
        </text>
        <text
          x={0}
          y={31}
          dy={16}
          fontFamily={theme.fonts.regularFont}
          textAnchor="middle"
          fill={theme.colors.secondary}
        >
          {payload && `${Math.round((payload.value / totalValue) * 100)}%`}
        </text>
        <text
          x={0}
          y={52}
          dy={16}
          fontFamily={theme.fonts.regularFont}
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
          fontFamily={theme.fonts.regularFont}
          textAnchor="end"
          height={22}
          fill={theme.colors.secondary}
        >
          {payload && payload.value}
        </text>
      </g>
    )
  }
)
