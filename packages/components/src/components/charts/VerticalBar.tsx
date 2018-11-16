import * as React from 'react'
import styled from 'styled-components'
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

const Container = styled.div`
  box-sizing: border-box;
  height: 350px;
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
      <text x={0} y={20} dy={16} textAnchor="end" fill="#666">
        {payload && payload.value}
      </text>
      <text x={0} y={40} dy={16} textAnchor="end" fill="#666">
        {payload && payload.value}
      </text>
    </g>
  )
}

export function VerticalBar(props: IVerticalBarProps) {
  return (
    <Container>
      <ResponsiveContainer>
        <BarChart width={600} height={300} data={props.data} barCategoryGap={0}>
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            height={80}
            tick={<CustomizedAxisTick />}
            tickLine={false}
            axisLine={false}
            dataKey="name"
          />

          <CartesianGrid strokeOpacity={0} fill="rgba(94, 147, 237, 0.05)" />

          <Bar dataKey="value">
            {props.data.map((entry, index) => (
              <Cell
                cursor="pointer"
                fill={index % 2 === 0 ? '#8884d8' : 'url(#colorUv)'}
                key={`cell-${index}`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Container>
  )
}
