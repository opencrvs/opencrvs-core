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
import { goToCompletenessRates } from '@client/navigation'

import {
  FilterContainer,
  getJurisidictionType,
  CompletenessRateTime,
  getAdditionalLocations,
  NATIONAL_ADMINISTRATIVE_LEVEL
} from '@client/views/SysAdmin/Performance/utils'
import {
  SysAdminContentWrapper,
  SysAdminPageVariant
} from '@client/views/SysAdmin/SysAdminContentWrapper'
import { GQLMonthWiseEstimationMetric } from '@opencrvs/gateway/src/graphql/schema'
import { parse } from 'query-string'
import * as React from 'react'
import { injectIntl, WrappedComponentProps, IntlShape } from 'react-intl'
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
import { CompletenessDataTable } from './reports/completenessRates/CompletenessDataTable'
import { useCallback } from 'react'
import {
  Content,
  ContentSize
} from '@opencrvs/components/lib/interface/Content'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import format from '@client/utils/date-formatting'
import { SegmentedControl } from '@client/components/SegmentedControl'
const { useState } = React

export enum COMPLETENESS_RATE_REPORT_BASE {
  TIME = 'TIME',
  LOCATION = 'LOCATION'
}

interface ISearchParams {
  locationId: string
  timeStart: string
  timeEnd: string
  time: CompletenessRateTime
}
interface IDispatchProps {
  goToCompletenessRates: typeof goToCompletenessRates
}
type ICompletenessRateProps = RouteComponentProps<{ eventType: string }> &
  WrappedComponentProps &
  IDispatchProps

export interface IEstimationBase {
  baseType: COMPLETENESS_RATE_REPORT_BASE
  locationJurisdictionType?: string
}

function prepareChartData(
  data: GQLMonthWiseEstimationMetric[],
  time: CompletenessRateTime
) {
  return (
    data &&
    data.reduce(
      (chartData: any[], dataDetails: GQLMonthWiseEstimationMetric, index) => {
        if (dataDetails !== null) {
          chartData.push({
            label:
              dataDetails.month === 0
                ? format(
                    new Date(dataDetails.year, dataDetails.month),
                    'MMM yyyy'
                  )
                : format(new Date(dataDetails.year, dataDetails.month), 'MMM'),
            registeredInTargetDays: dataDetails[time],
            totalRegistered: dataDetails.total,
            totalEstimate: dataDetails.estimated,
            registrationPercentage: `${Number(
              (dataDetails[time] / dataDetails.estimated) * 100
            ).toFixed(2)}%`
          })
        }
        return chartData
      },
      []
    )
  )
}

function CompletenessRatesComponent(props: ICompletenessRateProps) {
  const [base, setBase] = useState<IEstimationBase>({
    baseType: COMPLETENESS_RATE_REPORT_BASE.TIME
  })

  const {
    intl,
    location: { search },
    match: {
      params: { eventType }
    }
  } = props
  const { locationId, timeStart, timeEnd, time } = parse(
    search
  ) as unknown as ISearchParams

  const dateStart = new Date(timeStart)
  const dateEnd = new Date(timeEnd)
  const getFilter = useCallback(() => {
    {
      return (
        <Query
          query={HAS_CHILD_LOCATION}
          variables={{
            parentId:
              locationId && locationId !== NATIONAL_ADMINISTRATIVE_LEVEL
                ? locationId
                : '0'
          }}
        >
          {({ data, loading, error }) => {
            const options: IPerformanceSelectOption[] = [
              {
                label: intl.formatMessage(messages.overTime),
                value: COMPLETENESS_RATE_REPORT_BASE.TIME
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
                value: COMPLETENESS_RATE_REPORT_BASE.LOCATION,
                type: jurisdictionType || ''
              })
            }

            return (
              <FilterContainer>
                {options.length > 1 && (
                  <SegmentedControl
                    id="base-select"
                    value={base.baseType}
                    options={options}
                    onChange={(option) =>
                      setBase({
                        baseType: option.value as COMPLETENESS_RATE_REPORT_BASE,
                        locationJurisdictionType: option.type
                      })
                    }
                  />
                )}
                <LocationPicker
                  additionalLocations={getAdditionalLocations(intl)}
                  selectedLocationId={
                    locationId || NATIONAL_ADMINISTRATIVE_LEVEL
                  }
                  onChangeLocation={(newLocationId) => {
                    props.goToCompletenessRates(
                      eventType as Event,
                      newLocationId,
                      dateStart,
                      dateEnd,
                      time
                    )
                  }}
                />
                <DateRangePicker
                  startDate={dateStart}
                  endDate={dateEnd}
                  onDatesChange={({ startDate, endDate }) => {
                    startDate.setDate(startDate.getDate() + 1)
                    props.goToCompletenessRates(
                      eventType as Event,
                      locationId as string,
                      startDate,
                      endDate,
                      time
                    )
                  }}
                />
                <PerformanceSelect
                  onChange={(option) =>
                    props.goToCompletenessRates(
                      eventType as Event,
                      locationId,
                      dateStart,
                      dateEnd,
                      option.value as CompletenessRateTime
                    )
                  }
                  id="completenessRateTimeSelect"
                  withLightTheme={true}
                  value={time}
                  options={[
                    {
                      label: intl.formatMessage(
                        messages.performanceWithinTargetDaysLabel,
                        {
                          target:
                            window.config[
                              (eventType.toUpperCase() as 'BIRTH') || 'DEATH'
                            ].REGISTRATION_TARGET,
                          withPrefix: false
                        }
                      ),
                      value: CompletenessRateTime.WithinTarget
                    },
                    {
                      label: intl.formatMessage(
                        messages.performanceWithin1YearLabel
                      ),
                      value: CompletenessRateTime.Within1Year
                    },
                    {
                      label: intl.formatMessage(
                        messages.performanceWithin5YearsLabel
                      ),
                      value: CompletenessRateTime.Within5Years
                    }
                  ]}
                />
              </FilterContainer>
            )
          }}
        </Query>
      )
    }
  }, [base, props])

  return (
    <SysAdminContentWrapper
      id="reg-rates"
      isCertificatesConfigPage={true}
      profilePageStyle={{
        paddingTopMd: 0,
        horizontalPaddingMd: 0
      }}
    >
      <Content
        title={intl.formatMessage(navigationMessages.completenessRates)}
        size={ContentSize.LARGE}
        filterContent={getFilter()}
      >
        <Query
          query={
            base.baseType === COMPLETENESS_RATE_REPORT_BASE.TIME
              ? FETCH_MONTH_WISE_EVENT_ESTIMATIONS
              : FETCH_LOCATION_WISE_EVENT_ESTIMATIONS
          }
          variables={{
            event: eventType.toUpperCase(),
            timeStart: timeStart,
            timeEnd: timeEnd,
            locationId:
              locationId && locationId !== NATIONAL_ADMINISTRATIVE_LEVEL
                ? locationId
                : undefined
          }}
        >
          {({ data, loading, error }) => {
            if (error) {
              return (
                <>
                  {base.baseType === COMPLETENESS_RATE_REPORT_BASE.TIME && (
                    <RegRatesLineChart loading={true} />
                  )}
                  <CompletenessDataTable
                    loading={true}
                    base={base}
                    completenessRateTime={time}
                  />
                  <ToastNotification type={NOTIFICATION_TYPE.ERROR} />
                </>
              )
            } else {
              return (
                <>
                  {base.baseType === COMPLETENESS_RATE_REPORT_BASE.TIME && (
                    <RegRatesLineChart
                      loading={loading}
                      data={prepareChartData(
                        data && data.fetchMonthWiseEventMetrics,
                        time
                      )}
                      completenessRateTime={time}
                      eventType={eventType as Event}
                    />
                  )}
                  <CompletenessDataTable
                    loading={loading}
                    base={base}
                    data={
                      data &&
                      (base.baseType === COMPLETENESS_RATE_REPORT_BASE.TIME
                        ? data.fetchMonthWiseEventMetrics
                        : data.fetchLocationWiseEventMetrics)
                    }
                    eventType={eventType as Event}
                    completenessRateTime={time}
                  />
                </>
              )
            }
          }}
        </Query>
      </Content>
    </SysAdminContentWrapper>
  )
}

export const CompletenessRates = connect(null, {
  goToCompletenessRates
})(injectIntl(CompletenessRatesComponent))
