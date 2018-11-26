import * as React from 'react'
import styled, { withTheme } from 'styled-components'
import {
  AreaChart,
  Bar,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Area
} from 'recharts'
import { ITheme } from '../theme'

const Container = styled.div`
  margin-top: 30px;
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
  x: number
  y: number
  stroke: number
  payload: IDataPoint
  totalValue: number
  theme: ITheme
}

interface ICustomDot {
  cx: number
  cy: number
}
interface ILineProps {
  data: IDataPoint[]
  xAxisLabel: string
  yAxisLabel: string
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
        fill={theme.colors.secondary}
      >
        {payload && payload.name}
      </text>
      <text
        x={0}
        y={21}
        dy={16}
        fontFamily={theme.fonts.lightFont}
        textAnchor="middle"
        fill={theme.colors.accent}
      >
        {payload && `${Math.round(payload.value / totalValue * 100)}%`}
      </text>
      <text
        x={0}
        y={42}
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

function CustomizedYAxisTick(props: ICustomizedAxisTick) {
  const { x, y, payload, totalValue, theme } = props
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        fontFamily={theme.fonts.lightFont}
        textAnchor="end"
        height={22}
        fill={theme.colors.secondary}
      >
        {payload && payload.value}
      </text>
    </g>
  )
}

function CustomDot(props: ICustomDot) {
  const { cx, cy } = props
  return (
    <svg x={cx - 5.5} y={cy - 6} width={11} height={12}>
      <path d="M0 5.657L5.525 0l5.525 5.657-5.525 5.657z" fill="#233A86" />
    </svg>
  )
}

const sumUpAllValues = (data: IDataPoint[]) =>
  data.reduce((sum: number, item: IDataPoint) => sum + item.value, 0)

export const Line = withTheme((props: ILineProps & { theme: ITheme }) => {
  const { data, theme, xAxisLabel, yAxisLabel } = props
  const colours = [
    theme.colors.chartPrimary,
    theme.colors.chartSecondary,
    theme.colors.chartTertiary
  ]

  return (
    <Container>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart
          width={600}
          height={250}
          data={data}
          margin={{ top: 40, right: 30, bottom: 40, left: 30 }}
        >
          <defs>
            <linearGradient id="colorLineArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D8E5FD" />
              <stop offset="95%" stopColor="#F7F9FE" />
            </linearGradient>
          </defs>
          <XAxis
            height={80}
            tick={(tickProps: {
              stroke: number
              x: number
              y: number
              payload: { value: string }
            }) => {
              const { payload } = tickProps
              const dataPoint = data.find(({ name }) => name === payload.value)

              return (
                <CustomizedAxisTick
                  {...tickProps}
                  theme={theme}
                  totalValue={sumUpAllValues(data)}
                  payload={{
                    name: payload.value,
                    value: dataPoint ? dataPoint.value : 0
                  }}
                />
              )
            }}
            tickLine={false}
            axisLine={false}
            dataKey="name"
          >
            <Label
              fill={theme.colors.secondary}
              fontFamily={theme.fonts.lightFont}
              offset={20}
              value={xAxisLabel}
              position="bottom"
            />
          </XAxis>
          <YAxis
            width={30}
            domain={[0, 30]}
            tickCount={2}
            tick={(tickProps: ICustomizedAxisTick) => (
              <CustomizedYAxisTick {...tickProps} theme={theme} />
            )}
            tickLine={false}
            axisLine={false}
          >
            <Label
              fill={theme.colors.secondary}
              fontFamily={theme.fonts.lightFont}
              transform="rotate(-90)"
              dy={-75}
              offset={30}
              value={yAxisLabel}
              position="left"
            />
          </YAxis>
          <CartesianGrid
            vertical={false}
            horizontal={false}
            fillOpacity="0.05"
            fill={theme.colors.accentLight}
          />

          <Area
            dot={(dotProps: ICustomDot) => <CustomDot {...dotProps} />}
            type="linear"
            dataKey={(dataPoint: IDataPoint) =>
              Math.round(dataPoint.value / sumUpAllValues(data) * 100)
            }
            stroke="#8884d8"
            strokeWidth={1}
            fill="url(#colorLineArea)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Container>
  )
})
