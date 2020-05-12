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
import { Event } from '@client/forms'
import { constantsMessages } from '@client/i18n/messages'
import { TriLineChart } from '@opencrvs/components/lib/charts'
import { ITheme } from '@opencrvs/components/lib/theme'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import styled, { withTheme } from 'styled-components'

interface IProps extends WrappedComponentProps {
  theme: ITheme
  data?: ILineDataPoint[]
  loading?: boolean
  eventType?: Event
}

interface IActiveState {
  value: number
  stroke: string
}
interface IState {
  activeLabel: string
  activeRegisteredIn45Day: IActiveState
  activeTotalRegistered: IActiveState
  activeTotalEstimate: IActiveState
}

const CustomLegendContainer = styled.div`
  padding: 0 20px;
  color: ${({ theme }) => theme.colors.copy};
`

const LegendHeader = styled.div`
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.silverSand};
  ${({ theme }) => theme.fonts.subtitleStyle};
`

const LegendDetails = styled.div`
  display: flex;
  flex-direction: row;
`

const LegendDataLabel = styled.span`
  ${({ theme }) => theme.fonts.captionStyle}
`
const LegendDataValue = styled.span`
  ${({ theme }) => theme.fonts.bigBodyBoldStyle}
`

const LegendData = styled.div`
  padding: 0 4px;
  width: 100%;
  ${({ theme }) => theme.fonts.captionStyle};
`

const TooltipContent = styled.div`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
`

const LoadingIndicator = styled.div`
  padding: 10px 0;
  display: flex;
`

const ChartLoadingIndicator = styled.div`
  flex: 0 0 80%;
  background: ${({ theme }) => theme.colors.background};
  height: 500px;
`

const LegendLoadingIndicator = styled.div`
  flex: 1;
`

const LoaderBox = styled.span<{
  width?: number
}>`
  background: ${({ theme }) => theme.colors.background};
  display: inline-block;
  height: 24px;
  width: ${({ width }) => (width ? `${width}%` : '100%')};
`

interface ILineDataPoint {
  label: string
  registeredIn45Days: number
  totalRegistered: number
  totalEstimate: number
  registrationPercentage: string
}

function LegendDot(props: React.HTMLAttributes<SVGElement>) {
  return (
    <svg width={10} height={10} viewBox="0 0 10 10" fill="none" {...props}>
      <rect width={10} height={10} rx={5} fill={props.color} />
    </svg>
  )
}

class RegRatesLineChartComponent extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = this.getLatestData()
  }
  getLatestData() {
    const { data, theme } = this.props
    const latestData = data && data[data.length - 1]
    return {
      activeLabel: (latestData && latestData.label) || '',
      activeRegisteredIn45Day: {
        value: (latestData && latestData.registeredIn45Days) || 0,
        stroke: theme.colors.fountainBlue
      },
      activeTotalRegistered: {
        value: (latestData && latestData.totalRegistered) || 0,
        stroke: theme.colors.swansDown
      },
      activeTotalEstimate: {
        value: (latestData && latestData.totalEstimate) || 0,
        stroke: theme.colors.silverSand
      }
    }
  }
  customizedLegend = () => {
    const {
      activeLabel,
      activeRegisteredIn45Day,
      activeTotalRegistered,
      activeTotalEstimate
    } = this.state
    const { intl, eventType } = this.props
    return (
      <CustomLegendContainer>
        <LegendHeader>{activeLabel}</LegendHeader>
        <LegendDetails>
          <div>
            <LegendDot color={activeTotalEstimate.stroke} />
          </div>
          <LegendData>
            <LegendDataLabel>
              {intl.formatMessage(constantsMessages.estimatedNumberOfEvents, {
                eventType
              })}
            </LegendDataLabel>
            <br />
            <LegendDataValue>{activeTotalEstimate.value}</LegendDataValue>
          </LegendData>
        </LegendDetails>
        <LegendDetails>
          <div>
            <LegendDot color={activeTotalRegistered.stroke} />
          </div>
          <LegendData>
            <LegendDataLabel>
              {intl.formatMessage(constantsMessages.totalRegistered)}
            </LegendDataLabel>
            <br />
            <LegendDataValue>{activeTotalRegistered.value}</LegendDataValue>
          </LegendData>
        </LegendDetails>
        <LegendDetails>
          <div>
            <LegendDot color={activeRegisteredIn45Day.stroke} />
          </div>
          <LegendData>
            <LegendDataLabel>
              {intl.formatMessage(constantsMessages.registeredIn45d)}
            </LegendDataLabel>
            <br />
            <LegendDataValue>{activeRegisteredIn45Day.value}</LegendDataValue>
          </LegendData>
        </LegendDetails>
      </CustomLegendContainer>
    )
  }

  customizedTooltip = (dataPoint: any) => {
    const wrapperPayload = dataPoint.payload[0]

    return (
      <TooltipContent>
        {wrapperPayload &&
          wrapperPayload.payload &&
          wrapperPayload.payload.registrationPercentage}
      </TooltipContent>
    )
  }
  mouseMoveHandler = (data: any) => {
    const { theme } = this.props

    if (data && data.activePayload) {
      this.setState({
        activeLabel: data.activeLabel || '',
        activeRegisteredIn45Day: {
          value: data.activePayload[2].value || 0,
          stroke: theme.colors.fountainBlue
        },
        activeTotalRegistered: {
          value: data.activePayload[1].value || 0,
          stroke: theme.colors.swansDown
        },
        activeTotalEstimate: {
          value: data.activePayload[0].value || 0,
          stroke: theme.colors.silverSand
        }
      })
    }
  }
  mouseLeaveHandler = () => {
    this.setState(this.getLatestData())
  }
  getLoadingIndicator() {
    return (
      <LoadingIndicator>
        <ChartLoadingIndicator />
        <LegendLoadingIndicator>
          <CustomLegendContainer>
            <LegendHeader>
              <LoaderBox width={60} />
            </LegendHeader>
            <LegendDetails>
              <div>
                <LegendDot color={this.props.theme.colors.silverSand} />
              </div>
              <LegendData>
                <LoaderBox width={80} />
                <br />
                <LoaderBox width={40} />
              </LegendData>
            </LegendDetails>
            <LegendDetails>
              <div>
                <LegendDot color={this.props.theme.colors.silverSand} />
              </div>
              <LegendData>
                <LegendDataLabel>
                  <LoaderBox width={80} />
                </LegendDataLabel>
                <br />
                <LegendDataValue>
                  <LoaderBox width={40} />
                </LegendDataValue>
              </LegendData>
            </LegendDetails>
            <LegendDetails>
              <div>
                <LegendDot color={this.props.theme.colors.silverSand} />
              </div>
              <LegendData>
                <LegendDataLabel>
                  <LoaderBox width={80} />
                </LegendDataLabel>
                <br />
                <LegendDataValue>
                  <LoaderBox width={40} />
                </LegendDataValue>
              </LegendData>
            </LegendDetails>
          </CustomLegendContainer>
        </LegendLoadingIndicator>
      </LoadingIndicator>
    )
  }
  getChart(data: ILineDataPoint[]) {
    return (
      <TriLineChart
        data={data}
        dataKeys={['totalEstimate', 'totalRegistered', 'registeredIn45Days']}
        mouseMoveHandler={this.mouseMoveHandler}
        mouseLeaveHandler={this.mouseLeaveHandler}
        tooltipContent={this.customizedTooltip}
        legendContent={this.customizedLegend}
      />
    )
  }
  render() {
    const { data } = this.props

    if (data) return this.getChart(data)
    else return this.getLoadingIndicator()
  }
}

export const RegRatesLineChart = withTheme(
  injectIntl(RegRatesLineChartComponent)
)
