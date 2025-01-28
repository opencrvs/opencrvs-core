/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { RegRatesLineChart } from '@client/components/charts/RegRatesLineChart'
import { DateRangePicker } from '@client/components/DateRangePicker'
import { GenericErrorToast } from '@client/components/GenericErrorToast'
import { LocationPicker } from '@client/components/LocationPicker'
import { Query } from '@client/components/Query'
import {
  EventType,
  IsLeafLevelLocationQuery,
  QueryIsLeafLevelLocationArgs
} from '@client/utils/gateway'
import { messages } from '@client/i18n/messages/views/performance'
import { generateCompletenessRatesUrl } from '@client/navigation'

import {
  CompletenessRateTime,
  getAdditionalLocations,
  NATIONAL_ADMINISTRATIVE_LEVEL
} from '@client/views/SysAdmin/Performance/utils'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import type { GQLMonthWiseEstimationMetric } from '@client/utils/gateway-deprecated-do-not-use'
import { parse } from 'query-string'
import * as React from 'react'
import { injectIntl, useIntl, WrappedComponentProps } from 'react-intl'
import {
  IPerformanceSelectOption,
  PerformanceSelect
} from './PerformanceSelect'
import {
  FETCH_LOCATION_WISE_EVENT_ESTIMATIONS,
  FETCH_MONTH_WISE_EVENT_ESTIMATIONS,
  IS_LEAF_LEVEL_LOCATION
} from './queries'
import { CompletenessDataTable } from './reports/completenessRates/CompletenessDataTable'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import format from '@client/utils/date-formatting'
import { SegmentedControl } from '@client/components/SegmentedControl'
import { useQuery } from '@apollo/client'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
const { useState } = React

export enum COMPLETENESS_RATE_REPORT_BASE {
  TIME = 'TIME',
  LOCATION = 'LOCATION'
}

interface ISearchParams {
  locationId?: string
  timeStart: string
  timeEnd: string
  time: CompletenessRateTime
}

type ICompletenessRateProps = WrappedComponentProps

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
      (chartData: any[], dataDetails: GQLMonthWiseEstimationMetric) => {
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

function Filter({
  locationId,
  event,
  dateStart,
  dateEnd,
  base,
  time,
  onBaseChange
}: {
  locationId: string
  event: EventType
  dateStart: Date
  dateEnd: Date
  base: COMPLETENESS_RATE_REPORT_BASE
  time: CompletenessRateTime
  onBaseChange: (base: COMPLETENESS_RATE_REPORT_BASE) => void
}) {
  const navigate = useNavigate()
  const intl = useIntl()
  const { data } = useQuery<
    IsLeafLevelLocationQuery,
    QueryIsLeafLevelLocationArgs
  >(IS_LEAF_LEVEL_LOCATION, {
    variables: {
      locationId:
        locationId === NATIONAL_ADMINISTRATIVE_LEVEL ? '0' : locationId
    }
  })

  if (
    data?.isLeafLevelLocation === true &&
    base === COMPLETENESS_RATE_REPORT_BASE.LOCATION
  ) {
    onBaseChange(COMPLETENESS_RATE_REPORT_BASE.TIME)
  }

  const options: (IPerformanceSelectOption & { disabled?: boolean })[] = [
    {
      label: intl.formatMessage(messages.overTime),
      value: COMPLETENESS_RATE_REPORT_BASE.TIME
    },
    {
      label: intl.formatMessage(messages.byLocation),
      value: COMPLETENESS_RATE_REPORT_BASE.LOCATION,
      disabled: data?.isLeafLevelLocation ?? true
    }
  ]

  return (
    <>
      <SegmentedControl
        id="base-select"
        value={base}
        options={options}
        onChange={(option) =>
          onBaseChange(option.value as COMPLETENESS_RATE_REPORT_BASE)
        }
      />
      <LocationPicker
        additionalLocations={getAdditionalLocations(intl)}
        selectedLocationId={locationId}
        locationFilter={({ type }) => type === 'ADMIN_STRUCTURE'}
        onChangeLocation={(newLocationId) => {
          navigate(
            generateCompletenessRatesUrl({
              eventType: event,
              locationId: newLocationId,
              timeStart: dateStart,
              timeEnd: dateEnd,
              time
            })
          )
        }}
      />
      <DateRangePicker
        startDate={dateStart}
        endDate={dateEnd}
        onDatesChange={({ startDate, endDate }) => {
          startDate.setDate(startDate.getDate() + 1)

          navigate(
            generateCompletenessRatesUrl({
              eventType: event,
              locationId,
              timeStart: startDate,
              timeEnd: endDate,
              time
            })
          )
        }}
      />
      <PerformanceSelect
        onChange={(option) =>
          navigate(
            generateCompletenessRatesUrl({
              eventType: event,
              locationId,
              timeStart: dateStart,
              timeEnd: dateEnd,
              time: option.value as CompletenessRateTime
            })
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
                  window.config[event.toUpperCase() as Uppercase<EventType>]
                    .REGISTRATION_TARGET,
                withPrefix: false
              }
            ),
            value: CompletenessRateTime.WithinTarget
          },
          {
            label: intl.formatMessage(messages.performanceWithin1YearLabel),
            value: CompletenessRateTime.Within1Year
          },
          {
            label: intl.formatMessage(messages.performanceWithin5YearsLabel),
            value: CompletenessRateTime.Within5Years
          }
        ]}
      />
    </>
  )
}

function CompletenessRatesComponent(props: ICompletenessRateProps) {
  const [base, setBase] = useState<IEstimationBase>({
    baseType: COMPLETENESS_RATE_REPORT_BASE.TIME
  })

  const location = useLocation()
  const params = useParams()

  const { intl } = props

  const { locationId, timeStart, timeEnd, time } = parse(
    location.search
  ) as unknown as ISearchParams

  const dateStart = new Date(timeStart)
  const dateEnd = new Date(timeEnd)

  return (
    <SysAdminContentWrapper
      id="reg-rates"
      isCertificatesConfigPage={true}
      hideBackground={true}
    >
      <Content
        title={intl.formatMessage(navigationMessages.completenessRates)}
        showTitleOnMobile={true}
        size={ContentSize.LARGE}
        filterContent={
          <Filter
            locationId={locationId || NATIONAL_ADMINISTRATIVE_LEVEL}
            base={base.baseType}
            time={time}
            event={params.eventType as EventType}
            dateStart={dateStart}
            dateEnd={dateEnd}
            onBaseChange={(base) => setBase({ baseType: base })}
          />
        }
      >
        <Query
          query={
            base.baseType === COMPLETENESS_RATE_REPORT_BASE.TIME
              ? FETCH_MONTH_WISE_EVENT_ESTIMATIONS
              : FETCH_LOCATION_WISE_EVENT_ESTIMATIONS
          }
          variables={{
            event: params?.eventType?.toUpperCase(),
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
                  <GenericErrorToast />
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
                      eventType={params.eventType as EventType}
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
                    eventType={params.eventType as EventType}
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

export const CompletenessRates = injectIntl(CompletenessRatesComponent)
