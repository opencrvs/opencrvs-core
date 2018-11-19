import * as React from 'react'
import styled, { withTheme } from 'styled-components'
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  YAxis,
  CartesianGrid,
  Label,
  // Tooltip,
  // Legend,
  Cell
} from 'recharts'
import { ITheme } from '../theme'

const Container = styled.div`
  box-sizing: border-box;
  height: 250px;
  width: 100%;
  align-items: center;
`
interface IPayload {
  name: string
  value: number
}

interface ICustomizedAxisTick {
  x?: number
  y?: number
  stroke?: number
  payload?: IPayload
}

interface IVerticalBarProps {
  data: IPayload[]
}

function CustomizedAxisTick(props: ICustomizedAxisTick) {
  const { x, y, stroke, payload } = props

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" fill="#666">
        {payload && payload.value}
      </text>
      <text x={0} y={20} dy={16} textAnchor="end" fill="#4C68C1">
        {payload && payload.value}
      </text>
    </g>
  )
}

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
          <BarChart
            width={600}
            height={300}
            data={props.data}
            barCategoryGap={0}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colours[1]} stopOpacity={0.9} />
                <stop offset="95%" stopColor={colours[2]} stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <XAxis
              height={80}
              tick={<CustomizedAxisTick />}
              tickLine={false}
              axisLine={false}
              dataKey={({ name, percentage }) => name}
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
