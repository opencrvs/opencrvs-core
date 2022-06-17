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
import styled, { withTheme } from 'styled-components'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts'
import { ITheme } from '../theme'
import { IDataPoint } from './datapoint'
import { CustomizedXAxisTick } from './AxisTick'

const Container = styled.div`
  margin-top: 30px;
  box-sizing: border-box;
  height: 250px;
  width: 100%;
  align-items: center;
`

interface IVerticalBarProps {
  data: IDataPoint[]
  xAxisLabel: string
  yAxisLabel: string
}

const sumUpAllValues = (data: IDataPoint[]) =>
  data.reduce((sum: number, item: IDataPoint) => sum + item.value, 0)

export const VerticalBar = withTheme(
  (props: IVerticalBarProps & { theme: ITheme }) => {
    const { data, theme, xAxisLabel, yAxisLabel } = props
    const colours = [
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.tertiary
    ]

    return (
      <Container>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            width={600}
            height={250}
            data={data}
            margin={{ top: 0, right: 0, bottom: 40, left: 20 }}
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
                    totalValue={sumUpAllValues(data)}
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
                fontFamily={theme.fonts.fontFamily}
                offset={20}
                value={xAxisLabel}
                position="bottom"
              />
            </XAxis>
            <YAxis width={30} tickLine={false} axisLine={false} tick={false}>
              <Label
                fill={theme.colors.secondary}
                fontFamily={theme.fonts.fontFamily}
                transform="rotate(-90)"
                dy={-40}
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
