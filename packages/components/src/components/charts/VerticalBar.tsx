import * as React from 'react'
import styled, { withTheme } from 'styled-components'
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts'
import { ITheme } from '../theme'

const Container = styled.div`
  box-sizing: border-box;
  height: 250px;
  width: 100%;
  align-items: center;
`
interface IDataPoint {
  name: string
  value: number
}

interface ICustomizedAxisTick {
  x?: number
  y?: number
  stroke?: number
  payload?: IDataPoint
  totalValue: number
  theme: ITheme
}

interface IVerticalBarProps {
  data: IDataPoint[]
}

function CustomizedAxisTick(props: ICustomizedAxisTick) {
  const { x, y, payload, totalValue, theme } = props

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        fontFamily={theme.fonts.lightFont}
        textAnchor="middle"
        fill={theme.colors.accent}
      >
        {payload && `${Math.round(payload.value / totalValue * 100)}%`}
      </text>
      <text
        x={0}
        y={20}
        dy={16}
        fontFamily={theme.fonts.lightFont}
        fontSize={12}
        textAnchor="middle"
        fill={theme.colors.copy}
      >
        {payload && payload.value}
      </text>
    </g>
  )
}

const sumUpAllValues = (data: IDataPoint[]) =>
  data.reduce((sum: number, item: IDataPoint) => sum + item.value, 0)

export const VerticalBar = withTheme(
  (props: IVerticalBarProps & { theme: ITheme }) => {
    const { data, theme } = props
    const colours = [
      theme.colors.chartPrimary,
      theme.colors.chartSecondary,
      theme.colors.chartTertiary
    ]

    return (
      <Container>
        <ResponsiveContainer>
          <BarChart width={600} height={300} data={data} barCategoryGap={0}>
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colours[1]} stopOpacity={0.9} />
                <stop offset="95%" stopColor={colours[2]} stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <XAxis
              height={80}
              tick={
                <CustomizedAxisTick
                  totalValue={sumUpAllValues(data)}
                  theme={theme}
                />
              }
              tickLine={false}
              axisLine={false}
              dataKey="value"
            />

            <CartesianGrid
              vertical={false}
              horizontal={false}
              fillOpacity="0.05"
              fill={theme.colors.accentLight}
            />

            <Bar dataKey="value">
              {data.map((entry, index) => (
                <Cell
                  cursor="pointer"
                  fill={index % 2 === 0 ? colours[0] : 'url(#colorUv)'}
                  key={`cell-${index}`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Container>
    )
  }
)
