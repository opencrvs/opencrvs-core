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
import { Event } from '@client/utils/gateway'
import { constantsMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/performance'
import {
  IEstimationBase,
  COMPLETENESS_RATE_REPORT_BASE
} from '@client/views/SysAdmin/Performance/CompletenessRates'
import { SortArrow } from '@opencrvs/components/lib/icons'
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

interface ITableProps extends WrappedComponentProps {
  loading: boolean
  eventType?: Event
  base: IEstimationBase
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
  estimated: SORT_ORDER
  completenessRate: SORT_ORDER
  registeredWithinTargetd: SORT_ORDER
}

const INITIAL_SORT_MAP = {
  startTime: SORT_ORDER.DESCENDING,
  location: SORT_ORDER.ASCENDING,
  estimated: SORT_ORDER.ASCENDING,
  completenessRate: SORT_ORDER.ASCENDING,
  registeredWithinTargetd: SORT_ORDER.ASCENDING
}

function CompletenessDataTableComponent(props: ITableProps) {
  const { intl, loading, eventType, base } = props

  // A dynamic list of fields and directions and in which priority order to sort them
  // user clicking on a sort arrow puts the field in front of the list
  // giving it the highest priority
  // [{key: 'location', value: 'asc'}, {key: 'estimated', value: 'desc'}]
  const [sortOrder, setSortOrder] = React.useState(
    Object.entries(INITIAL_SORT_MAP).map(([key, value]) => ({
      key: key as keyof SortMap,
      value
    }))
  )

  const content =
    base.baseType === COMPLETENESS_RATE_REPORT_BASE.LOCATION
      ? ((props.data || []) as GQLLocationWiseEstimationMetric[]).map(
          (item) => ({
            location: item.locationName,
            totalRegistered: String(item.total),
            registeredWithinTargetd: item[props.completenessRateTime],
            estimated: String(item.estimated),
            completenessRate: `${Number(
              (item[props.completenessRateTime] / item.estimated) * 100
            ).toFixed(2)}%`
          })
        )
      : base.baseType === COMPLETENESS_RATE_REPORT_BASE.TIME
      ? ((props.data || []) as GQLMonthWiseEstimationMetric[]).map((item) => ({
          startTime: new Date(item.year, item.month),
          month: formatLongDate(
            new Date(item.year, item.month).toISOString(),
            intl.locale,
            'MMMM yyyy'
          ),
          totalRegistered: item.total,
          registeredWithinTargetd: item[props.completenessRateTime],
          estimated: item.estimated,
          completenessRate: `${Number(
            (item[props.completenessRateTime] / item.estimated) * 100
          ).toFixed(2)}%`
        }))
      : []

  function toggleSort(key: keyof SortMap) {
    const existingItemInSortOrder = sortOrder.find((item) => item.key === key)!

    const invertedOrder =
      existingItemInSortOrder.value === SORT_ORDER.DESCENDING
        ? SORT_ORDER.ASCENDING
        : SORT_ORDER.DESCENDING

    setSortOrder(
      [{ ...existingItemInSortOrder, value: invertedOrder }].concat(
        sortOrder.filter((x) => x !== existingItemInSortOrder)
      )
    )
  }

  const sortedContent = orderBy<typeof content[number]>(
    content,
    sortOrder.map(({ key }) => key),
    sortOrder.map(({ value }) => value)
  )

  const firstColProp =
    base.baseType === COMPLETENESS_RATE_REPORT_BASE.LOCATION
      ? {
          dataKey: 'location',
          label: intl.formatMessage(messages.locationTitle, {
            jurisdictionType: base.locationJurisdictionType
          }),
          sortKey: 'location' as const
        }
      : {
          dataKey: 'month',
          label: intl.formatMessage(constantsMessages.timePeriod),
          sortKey: 'startTime' as const
        }

  return (
    <ListTable
      noResultText={intl.formatMessage(constantsMessages.noResults)}
      isLoading={loading}
      columns={[
        {
          key: firstColProp.dataKey,
          label: firstColProp.label,
          width: 30,
          isSortable: true,
          sortFunction: () => toggleSort(firstColProp.sortKey),
          icon: (
            <SortArrow active={sortOrder[0].key === firstColProp.sortKey} />
          ),
          isSorted: true
        },
        {
          key: 'registeredWithinTargetd',
          isSortable: true,
          sortFunction: () => toggleSort('registeredWithinTargetd'),
          icon: (
            <SortArrow
              active={sortOrder[0].key === 'registeredWithinTargetd'}
            />
          ),
          isSorted: true,
          label:
            props.completenessRateTime === CompletenessRateTime.Within5Years
              ? intl.formatMessage(messages.performanceWithin5YearsLabel)
              : props.completenessRateTime === CompletenessRateTime.Within1Year
              ? intl.formatMessage(messages.performanceWithin1YearLabel)
              : intl.formatMessage(messages.performanceWithinTargetDaysLabel, {
                  target:
                    eventType === Event.Birth
                      ? window.config.BIRTH.REGISTRATION_TARGET
                      : window.config.DEATH.REGISTRATION_TARGET,
                  withPrefix: false
                }),
          width: 25
        },
        {
          key: 'estimated',
          isSortable: true,
          sortFunction: () => toggleSort('estimated'),
          icon: <SortArrow active={sortOrder[0].key === 'estimated'} />,
          isSorted: true,
          label: intl.formatMessage(constantsMessages.estimatedNumberOfEvents, {
            eventType,
            lineBreak: <br />
          }),
          width: 20
        },
        {
          key: 'completenessRate',
          isSortable: true,
          sortFunction: () => toggleSort('completenessRate'),
          icon: <SortArrow active={sortOrder[0].key === 'completenessRate'} />,
          isSorted: true,
          label: intl.formatMessage(messages.completenessRate, {
            lineBreak: <br />
          }),
          alignment: ColumnContentAlignment.LEFT,
          width: 25
        }
      ]}
      pageSize={sortedContent.length}
      content={sortedContent}
      hideBoxShadow={true}
      highlightRowOnMouseOver
    />
  )
}

export const CompletenessDataTable = injectIntl(CompletenessDataTableComponent)
