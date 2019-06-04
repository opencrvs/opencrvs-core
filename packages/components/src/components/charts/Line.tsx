import * as React from 'react'
import styled, { withTheme } from '@register/styledComponents'
import {
  AreaChart,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
  CartesianGrid,
  Area
} from 'recharts'
import { ITheme } from '../theme'
import { IDataPoint } from './datapoint'
import {
  CustomizedXAxisTick,
  CustomizedYAxisTick,
  ICustomizedAxisTick
} from './AxisTick'

const Container = styled.div`
  box-sizing: border-box;
  height: 300px;
  width: 100%;
  align-items: center;
  .recharts-label {
    text-anchor: middle;
  }
`

interface ILineDataPoint extends IDataPoint {
  totalEstimate: number
}

interface ICustomDot {
  cx: number
  cy: number
  theme: ITheme
}
interface ILineProps {
  data: ILineDataPoint[]
  xAxisLabel: string
  yAxisLabel: string
}

function CustomDot(props: ICustomDot) {
  const { cx, cy, theme } = props
  return (
    <svg x={cx - 5.5} y={cy - 6} width={11} height={12}>
      <path
        d="M0 5.657L5.525 0l5.525 5.657-5.525 5.657z"
        fill={theme.colors.primary}
      />
    </svg>
  )
}

export const Line = withTheme((props: ILineProps & { theme: ITheme }) => {
  const { data, theme, xAxisLabel, yAxisLabel } = props
  const { primary, chartAreaGradientStart, chartAreaGradientEnd } = theme.colors

  return (
    <Container>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          width={600}
          height={300}
          data={data}
          margin={{ top: 0, right: 50, bottom: 40, left: 50 }}
        >
          <defs>
            <linearGradient id="colorLineArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartAreaGradientStart} />
              <stop offset="95%" stopColor={chartAreaGradientEnd} />
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
              const dataPoint = data.find(
                ({ label }) => label === payload.value
              )

              return (
                <CustomizedXAxisTick
                  {...tickProps}
                  totalValue={dataPoint ? dataPoint.totalEstimate : 0}
                  payload={{
                    label: payload.value,
                    value: dataPoint ? dataPoint.value : 0
                  }}
                />
              )
            }}
            tickLine={false}
            axisLine={false}
            dataKey="label"
          >
            <Label
              fill={theme.colors.secondary}
              fontFamily={theme.fonts.regularFont}
              offset={20}
              value={xAxisLabel}
              position="bottom"
            />
          </XAxis>
          <YAxis
            width={30}
            tickCount={2}
            domain={[0, dataMax => Math.ceil(dataMax / 10) * 10]}
            tick={(tickProps: ICustomizedAxisTick) => (
              <CustomizedYAxisTick {...tickProps} />
            )}
            tickLine={false}
            axisLine={false}
          >
            <Label
              fill={theme.colors.secondary}
              fontFamily={theme.fonts.regularFont}
              angle={-90}
              dy={20}
              offset={20}
              value={yAxisLabel}
              position="left"
            />
          </YAxis>
          <CartesianGrid
            vertical={false}
            horizontal={false}
            fillOpacity="0.05"
            fill={theme.colors.secondary}
          />

          <Area
            dot={(dotProps: ICustomDot) => (
              <CustomDot {...dotProps} theme={theme} />
            )}
            type="linear"
            dataKey={(dataPoint: ILineDataPoint) =>
              Math.round((dataPoint.value / dataPoint.totalEstimate) * 100)
            }
            stroke={primary}
            strokeWidth={1}
            fill="url(#colorLineArea)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Container>
  )
})
