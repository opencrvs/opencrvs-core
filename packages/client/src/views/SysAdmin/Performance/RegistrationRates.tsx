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
import { DateRangePicker } from '@client/components/DateRangePicker'
import {
  NOTIFICATION_TYPE,
  ToastNotification
} from '@client/components/interface/ToastNotification'
import { LocationPicker } from '@client/components/LocationPicker'
import { Query } from '@client/components/Query'
import { Event } from '@client/forms'
import { messages } from '@client/i18n/messages/views/performance'
import {
  goToOperationalReport,
  goToRegistrationRates
} from '@client/navigation'
import { OPERATIONAL_REPORT_SECTION } from '@client/views/SysAdmin/Performance/OperationalReport'
import {
  PerformanceContentWrapper,
  PerformancePageVariant
} from '@client/views/SysAdmin/Performance/PerformanceContentWrapper'
import {
  FilterContainer,
  getJurisidictionType
} from '@client/views/SysAdmin/Performance/utils'
import {
  GQLMonthWise45DayEstimation,
  GQLMonthWiseEstimationMetrics
} from '@opencrvs/gateway/src/graphql/schema'
import querystring from 'query-string'
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
interface IDispatchProps {
  goToOperationalReport: typeof goToOperationalReport
  goToRegistrationRates: typeof goToRegistrationRates
}
type IRegistrationRateProps = RouteComponentProps<{ eventType: string }> &
  WrappedComponentProps &
  IDispatchProps

export interface IEstimationBase {
  baseType: REG_RATE_BASE
  locationJurisdictionType?: string
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
    goToOperationalReport
  } = props
  const { locationId, timeStart, timeEnd, title } = (querystring.parse(
    search
  ) as unknown) as ISearchParams

  const dateStart = new Date(timeStart)
  const dateEnd = new Date(timeEnd)

  return (
    <PerformanceContentWrapper
      id="reg-rates"
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
                <LocationPicker
                  selectedLocationId={locationId}
                  onChangeLocation={newLocationId => {
                    props.goToRegistrationRates(
                      eventType as Event,
                      title,
                      newLocationId,
                      dateStart,
                      dateEnd
                    )
                  }}
                />
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
            return (
              <>
                {base.baseType === REG_RATE_BASE.TIME && (
                  <RegRatesLineChart loading={true} />
                )}
                <Within45DaysTable loading={true} />
                <ToastNotification type={NOTIFICATION_TYPE.ERROR} />
              </>
            )
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
  null,
  { goToOperationalReport, goToRegistrationRates }
)(injectIntl(RegistrationRatesComponent))
