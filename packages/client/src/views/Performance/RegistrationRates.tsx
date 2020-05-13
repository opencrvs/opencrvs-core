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
import { RegRatesLineChart } from '@client/components/charts/RegRatesLineChart'
import { Query } from '@client/components/Query'
import { Event } from '@client/forms'
import { messages } from '@client/i18n/messages/views/performance'
import {
  goToOperationalReport,
  goToRegistrationRates
} from '@client/navigation'
import styled from '@client/styledComponents'
import { OPERATIONAL_REPORT_SECTION } from '@client/views/Performance/OperationalReport'
import {
  PerformanceContentWrapper,
  PerformancePageVariant
} from '@client/views/Performance/PerformanceContentWrapper'
import {
  getJurisidictionType,
  FilterContainer
} from '@client/views/Performance/utils'
import { MapPin } from '@opencrvs/components/lib/icons'
import {
  GQLMonthWise45DayEstimation,
  GQLMonthWiseEstimationMetrics
} from '@opencrvs/gateway/src/graphql/schema'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import {
  IPerformanceSelectOption,
  PerformanceSelect
} from './PerformanceSelect'
import {
  FETCH_LOCATION_WISE_EVENT_ESTIMATIONS,
  FETCH_MONTH_WISE_EVENT_ESTIMATIONS,
  HAS_CHILD_LOCATION
} from './queries'
import { Within45DaysTable } from './reports/registrationRates/Within45DaysTable'
import { DateRangePicker } from '@client/components/DateRangePicker'
import querystring from 'query-string'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import { generateLocations } from '@client/utils/locationUtils'
import { ISearchLocation } from '@opencrvs/components/lib/interface'

const { useState } = React

export enum REG_RATE_BASE {
  TIME = 'TIME',
  LOCATION = 'LOCATION'
}
interface ISearchParams {
  title: string
  locationId: string
  timeStart: string
  timeEnd: string
}
interface IConnectProps {
  locations: ISearchLocation[]
}
interface IDispatchProps {
  goToOperationalReport: typeof goToOperationalReport
  goToRegistrationRates: typeof goToRegistrationRates
}
type IRegistrationRateProps = RouteComponentProps<{ eventType: string }> &
  WrappedComponentProps &
  IConnectProps &
  IDispatchProps

export interface IEstimationBase {
  baseType: REG_RATE_BASE
  locationJurisdictionType?: string
}

const PickerButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: 2px;
  &:focus {
    outline: none;
  }
  &:hover {
    background: ${({ theme }) => theme.colors.smallButtonFocus};
  }
  white-space: nowrap;
  padding: 0;
  height: 38px;
  background: transparent;
  & > div {
    padding: 0 8px;
    height: 100%;
  }
`

const ContentWrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  ${({ theme }) => theme.fonts.smallButtonStyleNoCapitalize};
  color: ${({ theme }) => theme.colors.tertiary};

  & > svg {
    margin-left: 8px;
  }
`
interface LocationPickerProps {
  handler?: () => void
  children: React.ReactNode
}

function LocationPicker(props: LocationPickerProps) {
  return (
    <PickerButton onClick={props.handler}>
      <ContentWrapper>
        <span>{props.children}</span>
        <MapPin />
      </ContentWrapper>
    </PickerButton>
  )
}

function prepareChartData(data: GQLMonthWiseEstimationMetrics) {
  return (
    data &&
    data.details &&
    data.details.reduce(
      (chartData: any[], dataDetails: GQLMonthWise45DayEstimation | null) => {
        if (dataDetails !== null) {
          chartData.push({
            label: `${dataDetails.month.slice(0, 3)} ${dataDetails.year}`,
            registeredIn45Days: dataDetails.actual45DayRegistration,
            totalRegistered: dataDetails.actualTotalRegistration,
            totalEstimate: dataDetails.estimatedRegistration,
            registrationPercentage: `${dataDetails.estimated45DayPercentage}%`
          })
        }
        return chartData
      },
      []
    )
  )
}

function RegistrationRatesComponent(props: IRegistrationRateProps) {
  const [base, setBase] = useState<IEstimationBase>({
    baseType: REG_RATE_BASE.TIME
  })

  const {
    intl,
    location: { search },
    match: {
      params: { eventType }
    },
    locations,
    goToOperationalReport
  } = props
  const { locationId, timeStart, timeEnd, title } = (querystring.parse(
    search
  ) as unknown) as ISearchParams

  const selectedSearchedLocation = locations.find(
    ({ id }) => id === locationId
  ) as ISearchLocation
  const dateStart = new Date(timeStart)
  const dateEnd = new Date(timeEnd)

  return (
    <PerformanceContentWrapper
      id="reg-rates"
      hideTopBar
      type={PerformancePageVariant.SUBPAGE}
      backActionHandler={() =>
        goToOperationalReport(
          locationId,
          OPERATIONAL_REPORT_SECTION.OPERATIONAL,
          dateStart,
          dateEnd
        )
      }
      headerTitle={title}
      toolbarComponent={
        <Query query={HAS_CHILD_LOCATION} variables={{ parentId: locationId }}>
          {({ data, loading, error }) => {
            let options: IPerformanceSelectOption[] = [
              {
                label: intl.formatMessage(messages.overTime),
                value: REG_RATE_BASE.TIME
              }
            ]
            if (
              data &&
              data.hasChildLocation &&
              data.hasChildLocation.type === 'ADMIN_STRUCTURE'
            ) {
              const jurisdictionType = getJurisidictionType(
                data.hasChildLocation
              )

              options.push({
                label: intl.formatMessage(messages.byLocation, {
                  jurisdictionType
                }),
                value: REG_RATE_BASE.LOCATION,
                type: jurisdictionType || ''
              })
            }

            return (
              <FilterContainer>
                <PerformanceSelect
                  id="base-select"
                  value={base.baseType}
                  options={options}
                  onChange={option =>
                    setBase({
                      baseType: option.value as REG_RATE_BASE,
                      locationJurisdictionType: option.type
                    })
                  }
                />
                <LocationPicker>
                  {selectedSearchedLocation.displayLabel}
                </LocationPicker>
                <DateRangePicker
                  startDate={dateStart}
                  endDate={dateEnd}
                  onDatesChange={({ startDate, endDate }) =>
                    props.goToRegistrationRates(
                      eventType as Event,
                      title,
                      locationId as string,
                      startDate,
                      endDate
                    )
                  }
                />
              </FilterContainer>
            )
          }}
        </Query>
      }
    >
      <Query
        query={
          base.baseType === REG_RATE_BASE.TIME
            ? FETCH_MONTH_WISE_EVENT_ESTIMATIONS
            : FETCH_LOCATION_WISE_EVENT_ESTIMATIONS
        }
        variables={{
          event: eventType.toUpperCase(),
          timeStart: timeStart,
          timeEnd: timeEnd,
          locationId: locationId
        }}
      >
        {({ data, loading, error }) => {
          if (error) {
            // TODO: need error view here
            return <></>
          } else {
            return (
              <>
                {base.baseType === REG_RATE_BASE.TIME && (
                  <RegRatesLineChart
                    loading={loading}
                    data={prepareChartData(
                      data && data.fetchMonthWiseEventMetrics
                    )}
                    eventType={eventType as Event}
                  />
                )}
                <Within45DaysTable
                  loading={loading}
                  base={base}
                  data={
                    data &&
                    (data.fetchMonthWiseEventMetrics ||
                      data.fetchLocationWiseEventMetrics)
                  }
                  eventType={eventType as Event}
                />
              </>
            )
          }
        }}
      </Query>
    </PerformanceContentWrapper>
  )
}

export const RegistrationRates = connect(
  (state: IStoreState) => {
    const offlineLocations = getOfflineData(state).locations
    const offlineSearchableLocations = generateLocations(offlineLocations)
    return {
      locations: offlineSearchableLocations
    }
  },
  { goToOperationalReport, goToRegistrationRates }
)(injectIntl(RegistrationRatesComponent))
