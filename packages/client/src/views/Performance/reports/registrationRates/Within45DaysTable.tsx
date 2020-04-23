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
import { ListTable } from '@opencrvs/components/lib/interface'
import { Event } from '@client/forms'
import { WrappedComponentProps, injectIntl } from 'react-intl'
import { constantsMessages } from '@client/i18n/messages'
import { ArrowDownBlue } from '@opencrvs/components/lib/icons'
import { orderBy } from 'lodash'

interface IMonthWiseEstimationCount {
  actualTotalRegistration: number
  actual45DayRegistration: number
  estimatedRegistration: number
  estimated45DayPercentage: number
}
interface IMonthWiseEstimation extends IMonthWiseEstimationCount {
  month: string
  year: string
  startOfMonth: string
}
interface ITableProps extends WrappedComponentProps {
  loading: boolean
  eventType: Event
  data: {
    details: IMonthWiseEstimation[]
    total: IMonthWiseEstimationCount
  }
}

enum SORT_ORDER {
  ASCENDING = 'asc',
  DESCENDING = 'desc'
}

interface SortMap {
  startTime: SORT_ORDER
}

const INITIAL_SORT_MAP = {
  startTime: SORT_ORDER.DESCENDING
}

function Within45DaysTableComponent(props: ITableProps) {
  const { intl, loading, eventType } = props
  const [sortOrder, setSortOrder] = React.useState<SortMap>(INITIAL_SORT_MAP)

  const content =
    (props.data &&
      props.data.details &&
      props.data.details.map(item => ({
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
        width: 30
      },
      {
        label: String(actualTotalRegistration),
        width: 15
      },
      {
        label: String(actual45DayRegistration),
        width: 20
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
        width: 20
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

  const sortedContent = orderBy(content, ['startTime'], [sortOrder.startTime])

  return (
    <ListTable
      noResultText={intl.formatMessage(constantsMessages.noResults)}
      isLoading={loading}
      columns={[
        {
          key: 'month',
          label: intl.formatMessage(constantsMessages.timePeriod),
          width: 30,
          isSortable: true,
          sortFunction: () => toggleSort('startTime'),
          icon: <ArrowDownBlue />
        },
        {
          key: 'totalRegistered',
          label: intl.formatMessage(constantsMessages.totalRegistered),
          width: 15
        },
        {
          key: 'registeredWithin45d',
          label: intl.formatMessage(constantsMessages.registeredWithin45d),
          width: 20
        },
        {
          key: 'estimated',
          label: intl.formatMessage(constantsMessages.estimatedNumberOfEvents, {
            eventType
          }),
          width: 15
        },
        {
          key: 'rateOfRegistrationWithin45d',
          label: intl.formatMessage(
            constantsMessages.rateOfRegistrationWithin45d
          ),
          width: 20
        }
      ]}
      pageSize={sortedContent.length}
      content={sortedContent}
      footerColumns={getFooterColumns()}
      hideBoxShadow={true}
    />
  )
}

export const Within45DaysTable = injectIntl(Within45DaysTableComponent)
