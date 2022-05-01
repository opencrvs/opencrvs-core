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
import { messages } from '@client/i18n/messages/views/performance'
import {
  IEstimationBase,
  COMPLETENESS_RATE_REPORT_BASE
} from '@client/views/SysAdmin/Performance/CompletenessRates'
import { ArrowDownBlue } from '@opencrvs/components/lib/icons'
import {
  ListTable,
  ColumnContentAlignment
} from '@opencrvs/components/lib/interface'
import { orderBy } from 'lodash'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import {
  GQLLocationWiseEstimationMetric,
  GQLMonthWiseEstimationMetric
} from '@opencrvs/gateway/src/graphql/schema'
import { formatLongDate } from '@client/utils/date-formatting'
import { CompletenessRateTime } from '@client/views/SysAdmin/Performance/utils'

interface IMonthWiseEstimationCount {
  actualTotalRegistration: number
  actualTargetDayRegistration: number
  estimatedRegistration: number
  estimatedTargetDayPercentage: number
}
interface IMonthWiseEstimation extends IMonthWiseEstimationCount {
  month?: string
  year?: string
  startOfMonth?: string
  locationName?: string
}
interface ITableProps extends WrappedComponentProps {
  loading: boolean
  eventType?: Event
  base?: IEstimationBase
  data?: GQLMonthWiseEstimationMetric[] | GQLLocationWiseEstimationMetric[]
  completenessRateTime: CompletenessRateTime
}

export enum SORT_ORDER {
  ASCENDING = 'asc',
  DESCENDING = 'desc'
}

interface SortMap {
  startTime: SORT_ORDER
  location: SORT_ORDER
}

const INITIAL_SORT_MAP = {
  startTime: SORT_ORDER.DESCENDING,
  location: SORT_ORDER.ASCENDING
}

function CompletenessDataTableComponent(props: ITableProps) {
  const { intl, loading, eventType, base } = props
  const [sortOrder, setSortOrder] = React.useState<SortMap>(INITIAL_SORT_MAP)

  const content: any =
    base?.baseType === COMPLETENESS_RATE_REPORT_BASE.LOCATION
      ? props.data &&
        (props.data as GQLLocationWiseEstimationMetric[]).map((item) => ({
          location: item.locationName,
          totalRegistered: String(item.total),
          registeredWithinTargetd: String(item[props.completenessRateTime]),
          estimated: String(item.estimated),
          rateOfRegistrationWithinTargetd: `${Number(
            (item[props.completenessRateTime] / item.estimated) * 100
          ).toFixed(2)}%`
        }))
      : base?.baseType === COMPLETENESS_RATE_REPORT_BASE.TIME
      ? props.data &&
        (props.data as GQLMonthWiseEstimationMetric[]).map((item) => ({
          startTime: new Date(item.year, item.month),
          month: formatLongDate(
            new Date(item.year, item.month).toISOString(),
            intl.locale,
            'MMMM yyyy'
          ),
          totalRegistered: item.total,
          registeredWithinTargetd: item[props.completenessRateTime],
          estimated: item.estimated,
          rateOfRegistrationWithinTargetd: `${Number(
            (item[props.completenessRateTime] / item.estimated) * 100
          ).toFixed(2)}%`
        }))
      : []

  function getFooterColumns() {
    let sum = {
      total: 0,
      withinTarget: 0,
      within1Year: 0,
      within5Years: 0,
      estimated: 0
    }

    sum = props.data
      ? (props.data as GQLMonthWiseEstimationMetric[]).reduce(
          (s: typeof sum, data) => ({
            total: s.total + data.total,
            withinTarget: s.withinTarget + data.withinTarget,
            within1Year: s.within1Year + data.within1Year,
            within5Years: s.within5Years + data.within5Years,
            estimated: s.estimated + data.estimated
          }),
          sum
        )
      : sum
    return [
      {
        label: props.intl.formatMessage(constantsMessages.total),
        width: 40
      },
      {
        label: String(sum.total),
        width: 15
      },
      {
        label: String(sum[props.completenessRateTime]),
        width: 15
      },
      {
        label: String(sum.estimated),
        width: 15
      },
      {
        label: intl.formatMessage(
          constantsMessages.averageRateOfRegistrations,
          {
            amount: Number(
              ((sum[props.completenessRateTime] / sum.estimated) * 100).toFixed(
                2
              )
            )
          }
        ),
        width: 15
      }
    ]
  }

  function toggleSort(key: keyof SortMap) {
    const invertedOrder =
      sortOrder[key] === SORT_ORDER.DESCENDING
        ? SORT_ORDER.ASCENDING
        : SORT_ORDER.DESCENDING
    setSortOrder({ ...sortOrder, [key]: invertedOrder })
  }

  const sortedContent = orderBy(
    content,
    ['startTime', 'location'],
    [sortOrder.startTime, sortOrder.location]
  )
  let firstColProp: {
    dataKey: string
    label: string
    sortKey: keyof SortMap
  } = {
    dataKey: 'month',
    label: intl.formatMessage(constantsMessages.timePeriod),
    sortKey: 'startTime'
  }
  if (base && base.baseType === COMPLETENESS_RATE_REPORT_BASE.LOCATION) {
    firstColProp = {
      dataKey: 'location',
      label: intl.formatMessage(messages.locationTitle, {
        jurisdictionType: base.locationJurisdictionType
      }),
      sortKey: 'location'
    }
  }
  return (
    <ListTable
      noResultText={intl.formatMessage(constantsMessages.noResults)}
      isLoading={loading}
      fixedWidth={1074}
      columns={[
        {
          key: firstColProp.dataKey,
          label: firstColProp.label,
          width: 40,
          isSortable: true,
          sortFunction: () => toggleSort(firstColProp.sortKey),
          icon: <ArrowDownBlue />,
          isSorted: true
        },
        {
          key: 'totalRegistered',
          label: intl.formatMessage(constantsMessages.totalRegistered, {
            lineBreak: <br key={'totalRegistered-break'} />
          }),
          width: 15
        },
        {
          key: 'registeredWithinTargetd',

          label:
            props.completenessRateTime === CompletenessRateTime.Within5Years
              ? intl.formatMessage(messages.performanceWithin5YearsLabel)
              : props.completenessRateTime === CompletenessRateTime.Within1Year
              ? intl.formatMessage(messages.performanceWithin1YearLabel)
              : intl.formatMessage(messages.performanceWithinTargetDaysLabel, {
                  target:
                    eventType === Event.BIRTH
                      ? window.config.BIRTH.REGISTRATION_TARGET
                      : window.config.DEATH.REGISTRATION_TARGET,
                  withPrefix: false
                }),
          width: 15
        },
        {
          key: 'estimated',
          label: intl.formatMessage(constantsMessages.estimatedNumberOfEvents, {
            eventType,
            lineBreak: <br key={'estimated-break'} />
          }),
          width: 15
        },
        {
          key: 'rateOfRegistrationWithinTargetd',
          label:
            props.completenessRateTime === CompletenessRateTime.Within5Years
              ? intl.formatMessage(
                  constantsMessages.rateOfRegistrationWithinYears,
                  { num: 5 }
                )
              : props.completenessRateTime === CompletenessRateTime.Within1Year
              ? intl.formatMessage(
                  constantsMessages.rateOfRegistrationWithinYears,
                  { num: 1 }
                )
              : intl.formatMessage(
                  constantsMessages.rateOfRegistrationWithinTargetd,
                  {
                    registrationTargetDays:
                      eventType === Event.BIRTH
                        ? window.config.BIRTH.REGISTRATION_TARGET
                        : window.config.DEATH.REGISTRATION_TARGET,

                    lineBreak: (
                      <br key={'rateOfRegistrationWithinTargetd-break'} />
                    )
                  }
                ),
          alignment: ColumnContentAlignment.RIGHT,
          width: 15
        }
      ]}
      pageSize={sortedContent.length}
      content={sortedContent}
      footerColumns={getFooterColumns()}
      hideBoxShadow={true}
      highlightRowOnMouseOver
    />
  )
}

export const CompletenessDataTable = injectIntl(CompletenessDataTableComponent)
