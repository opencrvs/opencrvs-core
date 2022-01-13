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
  REG_RATE_BASE
} from '@client/views/SysAdmin/Performance/RegistrationRates'
import { ArrowDownBlue } from '@opencrvs/components/lib/icons'
import {
  ListTable,
  ColumnContentAlignment
} from '@opencrvs/components/lib/interface'
import { orderBy } from 'lodash'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'

interface IMonthWiseEstimationCount {
  actualTotalRegistration: number
  actual45DayRegistration: number
  estimatedRegistration: number
  estimated45DayPercentage: number
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
  data?: {
    details: IMonthWiseEstimation[]
    total: IMonthWiseEstimationCount
  }
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

function Within45DaysTableComponent(props: ITableProps) {
  const { intl, loading, eventType, base } = props
  const [sortOrder, setSortOrder] = React.useState<SortMap>(INITIAL_SORT_MAP)

  const content =
    (props.data &&
      props.data.details &&
      props.data.details.map((item) => ({
        location: item.locationName,
        startTime: item.startOfMonth,
        month: `${item.month} ${item.year}`,
        totalRegistered: String(item.actualTotalRegistration),
        registeredWithin45d: String(item.actual45DayRegistration),
        estimated: String(item.estimatedRegistration),
        rateOfRegistrationWithin45d: `${item.estimated45DayPercentage}%`
      }))) ||
    []

  function getFooterColumns() {
    const {
      actualTotalRegistration = 0,
      actual45DayRegistration = 0,
      estimatedRegistration = 0,
      estimated45DayPercentage = 0
    } = (props.data && props.data.total) || {}
    return [
      {
        label: props.intl.formatMessage(constantsMessages.total),
        width: 40
      },
      {
        label: String(actualTotalRegistration),
        width: 15
      },
      {
        label: String(actual45DayRegistration),
        width: 15
      },
      {
        label: String(estimatedRegistration),
        width: 15
      },
      {
        label: intl.formatMessage(
          constantsMessages.averageRateOfRegistrations,
          {
            amount: estimated45DayPercentage
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
  if (base && base.baseType === REG_RATE_BASE.LOCATION) {
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
          key: 'registeredWithin45d',

          label: intl.formatMessage(constantsMessages.registeredWithin45d, {
            lineBreak: <br key={'registeredWithin45d-break'} />
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
          key: 'rateOfRegistrationWithin45d',
          label: intl.formatMessage(
            constantsMessages.rateOfRegistrationWithin45d,
            {
              lineBreak: <br key={'rateOfRegistrationWithin45d-break'} />
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

export const Within45DaysTable = injectIntl(Within45DaysTableComponent)
