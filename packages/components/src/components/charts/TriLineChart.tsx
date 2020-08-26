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
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { ITheme } from 'src/components/theme'
import styled, { withTheme } from 'styled-components'

const Container = styled.div`
  box-sizing: border-box;
  width: 100%;
  align-items: center;
  .recharts-label {
    text-anchor: middle;
  }
  ${({ theme }) => theme.fonts.subtitleStyle};
`

interface IProps {
  data: ILineDataPoint[]
  dataKeys: string[]
  mouseMoveHandler: (data: any) => void
  mouseLeaveHandler: () => void
  tooltipContent: (dataPoint: any) => React.ReactNode
  legendContent: () => React.ReactNode
  theme: ITheme
  chartTop: number
  chartRight: number
  chartBottom: number
  chartLeft: number
  maximizeXAxisInterval?: boolean
  legendLayout: string
}

interface ILineDataPoint {
  label: React.ReactNode
  registeredIn45Days: number
  totalRegistered: number
  totalEstimate: number
  registrationPercentage: string
}

interface ICustomisedDot {
  cx: number
  cy: number
  theme: ITheme
}

function CustomizedDot(props: ICustomisedDot) {
  const { cx, cy, theme } = props

  return (
    <svg
      x={cx - 10}
      y={cy - 10}
      width={20}
      height={20}
      viewBox="0 0 16 16"
      fill="none"
      {...props}
    >
      <circle
        cx={8}
        cy={8}
        r={5}
        fill={theme.colors.white}
        stroke={theme.colors.ronchi}
        strokeWidth={3}
      />
    </svg>
  )
}
interface IAxisTickProps {
  x: number
  y: number
  stroke: string
  payload: {
    value: string
  }
}

interface IThemedAxisTickProps extends IAxisTickProps {
  theme: ITheme
}

function CustomizedAxisTick(props: IThemedAxisTickProps) {
  const { x, y, stroke, payload, theme } = props
  const values = payload.value.split(' ')

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={24}
        fill={theme.colors.copy}
        fontFamily="noto_sans_regular"
        fontSize={12}
        fontWeight="normal"
      >
        {values.map((value, i) => (
          <tspan textAnchor="middle" x="0" dy={`${i > 0 ? 18 : 24}`}>
            {value}
          </tspan>
        ))}
      </text>
    </g>
  )
}

class TriLineChartComponent extends React.Component<IProps> {
  render() {
    const {
      data,
      mouseMoveHandler,
      mouseLeaveHandler,
      dataKeys,
      theme,
      tooltipContent,
      legendContent,
      chartTop,
      chartRight,
      chartBottom,
      chartLeft,
      maximizeXAxisInterval,
      legendLayout
    } = this.props
    return (
      <Container>
        <ResponsiveContainer height={500}>
          <LineChart
            data={data}
            margin={{
              top: chartTop,
              right: chartRight,
              bottom: chartBottom,
              left: chartLeft
            }}
            onMouseMove={mouseMoveHandler}
            onMouseLeave={mouseLeaveHandler}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              horizontal={maximizeXAxisInterval ? false : true}
            />
            {(maximizeXAxisInterval && (
              <XAxis
                interval={data.length - 2}
                tickLine={false}
                dataKey="label"
              />
            )) || (
              <XAxis
                tickLine={false}
                dataKey="label"
                tick={(props: IAxisTickProps) => (
                  <CustomizedAxisTick {...props} theme={theme} />
                )}
              />
            )}
            {!maximizeXAxisInterval && (
              <YAxis interval={1} axisLine={false} tickLine={false} />
            )}

            <Line
              dataKey={dataKeys[0]}
              stroke={theme.colors.silverSand}
              dot={false}
              activeDot={false}
              strokeWidth={3}
            />
            <Line
              dataKey={dataKeys[1]}
              stroke={theme.colors.swansDown}
              dot={false}
              activeDot={false}
              strokeWidth={3}
            />
            <Line
              dataKey={dataKeys[2]}
              stroke={theme.colors.fountainBlue}
              dot={false}
              activeDot={(dotProps: ICustomisedDot) => (
                <CustomizedDot {...dotProps} theme={theme} />
              )}
              strokeWidth={3}
            />

            <Tooltip
              cursor={{ stroke: theme.colors.ronchi }}
              content={tooltipContent}
            />

            <Legend
              content={legendContent}
              layout={legendLayout as any}
              verticalAlign="top"
              align="right"
            />
          </LineChart>
        </ResponsiveContainer>
      </Container>
    )
  }
}

export const TriLineChart = withTheme(TriLineChartComponent)
