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
  legendMarginTop: number
  legendMarginLeft: number
  chartTop: number
  chartRight: number
  chartBottom: number
  chartLeft: number
  maximizeXAxisInterval?: boolean
  legendLayout: string
  activeLabel: string
  activeRegisteredInTargetDays: IActiveState
  activeTotalRegistered: IActiveState
  activeTotalEstimate: IActiveState
}

const CustomLegendContainer = styled.div<{
  marginLeft: number
  marginTop: number
}>`
  margin: ${({ marginTop, marginLeft }) =>
    `${marginTop}px 40px 8px ${marginLeft}px`};
  color: ${({ theme }) => theme.colors.copy};
`

const LegendHeader = styled.div`
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.silverSand};
  ${({ theme }) => theme.fonts.bodyBoldStyle};
`

const LegendDetails = styled.div`
  display: flex;
  flex-direction: row;
`

const LegendDataLabel = styled.span`
  ${({ theme }) => theme.fonts.chartLegendStyle}
`
const LegendDataValue = styled.span`
  ${({ theme }) => theme.fonts.bigBodyBoldStyle}
`

const LegendData = styled.div`
  padding: 0 8px;
  width: 100%;
  ${({ theme }) => theme.fonts.captionStyle};
`

const TooltipContent = styled.div`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
`

const LoadingIndicator = styled.div<{
  flexDirection: string
}>`
  padding: 10px 0;
  display: flex;
  flex-direction: ${({ flexDirection }) => flexDirection};
`

const DesktopChartLoadingIndicator = styled.div`
  flex: 0 0 80%;
  background: ${({ theme }) => theme.colors.background};
  height: 500px;
`

const MobileChartLoadingIndicator = styled.div`
  background: ${({ theme }) => theme.colors.background};
  height: 200px;
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
  registeredInTargetDays: number
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
    this.state = {
      ...this.getStatePropertiesForChart(),
      ...this.getLatestData()
    }
  }

  getStatePropertiesForChart = () => {
    if (window.innerWidth > this.props.theme.grid.breakpoints.md) {
      return this.getStatePropertiesForLargeWindowChart()
    } else {
      return this.getStatePropertiesForSmallWindowChart()
    }
  }

  getStatePropertiesForSmallWindowChart = () => {
    return {
      legendMarginTop: -16,
      legendMarginLeft: 0,
      chartTop: 32,
      chartRight: 40,
      chartBottom: 40,
      chartLeft: 40,
      maximizeXAxisInterval: true,
      legendLayout: 'horizontal'
    }
  }
  getStatePropertiesForLargeWindowChart = () => {
    return {
      legendMarginTop: -16,
      legendMarginLeft: 54,
      chartTop: 32,
      chartRight: 80,
      chartBottom: 40,
      chartLeft: 10,
      maximizeXAxisInterval: false,
      legendLayout: 'vertical'
    }
  }
  componentDidMount() {
    window.addEventListener('resize', this.recordWindowWidth)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.recordWindowWidth)
  }

  recordWindowWidth = () => {
    this.setState({
      ...this.state,
      ...this.getStatePropertiesForChart()
    })
  }

  getLatestData() {
    const { data, theme } = this.props
    const latestData = data && data[data.length - 1]
    return {
      activeLabel: (latestData && latestData.label) || '',
      activeRegisteredInTargetDays: {
        value: (latestData && latestData.registeredInTargetDays) || 0,
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
      activeRegisteredInTargetDays,
      activeTotalRegistered,
      activeTotalEstimate
    } = this.state.activeLabel ? this.state : this.getLatestData()
    const { intl, eventType } = this.props
    return (
      <CustomLegendContainer
        marginLeft={this.state.legendMarginLeft}
        marginTop={this.state.legendMarginTop}
      >
        <LegendHeader>{activeLabel}</LegendHeader>
        <LegendDetails>
          <div>
            <LegendDot color={activeTotalEstimate.stroke} />
          </div>
          <LegendData>
            <LegendDataLabel>
              {intl.formatMessage(constantsMessages.estimatedNumberOfEvents, {
                eventType,
                lineBreak: <span key={'estimated-space'}>&nbsp;</span>
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
              {intl.formatMessage(constantsMessages.totalRegistered, {
                lineBreak: <span key={'totalRegistered-break'}>&nbsp;</span>
              })}
            </LegendDataLabel>
            <br />
            <LegendDataValue>{activeTotalRegistered.value}</LegendDataValue>
          </LegendData>
        </LegendDetails>
        <LegendDetails>
          <div>
            <LegendDot color={activeRegisteredInTargetDays.stroke} />
          </div>
          <LegendData>
            <LegendDataLabel>
              {intl.formatMessage(constantsMessages.registeredInTargetd, {
                registrationTargetDays:
                  eventType === Event.BIRTH
                    ? window.config.BIRTH_REGISTRATION_TARGET
                    : window.config.DEATH_REGISTRATION_TARGET
              })}
            </LegendDataLabel>
            <br />
            <LegendDataValue>
              {activeRegisteredInTargetDays.value}
            </LegendDataValue>
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
        activeRegisteredInTargetDays: {
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
  getLoadingIndicatorForMobileView() {
    return (
      <LoadingIndicator id="reg-rates-line-chart-loader" flexDirection="column">
        <LegendLoadingIndicator>
          <CustomLegendContainer
            marginLeft={this.state.legendMarginLeft}
            marginTop={this.state.legendMarginTop}
          >
            <LegendHeader>
              <LoaderBox width={40} />
            </LegendHeader>
            <LegendDetails>
              <div>
                <LegendDot color={this.props.theme.colors.silverSand} />
              </div>
              <LegendData>
                <LoaderBox width={60} />
                <br />
                <LoaderBox width={20} />
              </LegendData>
            </LegendDetails>
            <LegendDetails>
              <div>
                <LegendDot color={this.props.theme.colors.silverSand} />
              </div>
              <LegendData>
                <LegendDataLabel>
                  <LoaderBox width={60} />
                </LegendDataLabel>
                <br />
                <LegendDataValue>
                  <LoaderBox width={20} />
                </LegendDataValue>
              </LegendData>
            </LegendDetails>
            <LegendDetails>
              <div>
                <LegendDot color={this.props.theme.colors.silverSand} />
              </div>
              <LegendData>
                <LegendDataLabel>
                  <LoaderBox width={60} />
                </LegendDataLabel>
                <br />
                <LegendDataValue>
                  <LoaderBox width={20} />
                </LegendDataValue>
              </LegendData>
            </LegendDetails>
          </CustomLegendContainer>
        </LegendLoadingIndicator>
        <MobileChartLoadingIndicator />
      </LoadingIndicator>
    )
  }
  getLoadingIndicatorForDesktopView() {
    return (
      <LoadingIndicator id="reg-rates-line-chart-loader" flexDirection="row">
        <DesktopChartLoadingIndicator />
        <LegendLoadingIndicator>
          <CustomLegendContainer
            marginLeft={this.state.legendMarginLeft}
            marginTop={this.state.legendMarginTop}
          >
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
  getLoadingIndicator = () => {
    if (window.innerWidth > this.props.theme.grid.breakpoints.md) {
      return this.getLoadingIndicatorForDesktopView()
    } else {
      return this.getLoadingIndicatorForMobileView()
    }
  }
  getChart(data: ILineDataPoint[]) {
    const {
      chartTop,
      chartRight,
      chartBottom,
      chartLeft,
      maximizeXAxisInterval,
      legendLayout
    } = this.state
    return (
      <TriLineChart
        data={data}
        dataKeys={[
          'totalEstimate',
          'totalRegistered',
          'registeredInTargetDays'
        ]}
        mouseMoveHandler={this.mouseMoveHandler}
        mouseLeaveHandler={this.mouseLeaveHandler}
        tooltipContent={this.customizedTooltip}
        legendContent={this.customizedLegend}
        chartTop={chartTop}
        chartRight={chartRight}
        chartBottom={chartBottom}
        chartLeft={chartLeft}
        maximizeXAxisInterval={maximizeXAxisInterval}
        legendLayout={legendLayout}
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
