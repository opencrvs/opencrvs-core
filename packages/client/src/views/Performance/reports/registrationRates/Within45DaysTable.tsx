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
import moment from 'moment'
import { WrappedComponentProps, injectIntl } from 'react-intl'
import { constantsMessages } from '@client/i18n/messages'
import { ArrowDownBlue } from '@opencrvs/components/lib/icons'
import { orderBy } from 'lodash'

interface ITableProps extends WrappedComponentProps {
  eventType: Event
  data: Array<any>
}

enum SORT_ORDER {
  ASCENDING = 'asc',
  DESCENDING = 'desc'
}

interface SortMap {
  time: SORT_ORDER
}

const INITIAL_SORT_MAP = {
  time: SORT_ORDER.DESCENDING
}

function Within45DaysTableComponent(props: ITableProps) {
  const { intl, eventType } = props
  const [sortOrder, setSortOrder] = React.useState<SortMap>(INITIAL_SORT_MAP)

  moment.locale(intl.locale)
  moment.defaultFormat = 'MMMM YYYY'

  const content = props.data.map(item => ({
    time: String((item.time as Date).getTime()),
    month: moment(item.time).format(),
    totalRegistered: item.total,
    registeredWithin45d: item.regWithin45d,
    estimated: item.estimated,
    rateOfRegistrationWithin45d: `${Number(item.percentage).toFixed(1)}%`
  }))

  const sumData = props.data.reduce(
    (totalItem, item) => ({
      total: (totalItem.total || 0) + item.total,
      regWithin45d: (totalItem.regWithin45d || 0) + item.regWithin45d,
      estimated: (totalItem.estimated || 0) + item.estimated,
      percentage: (totalItem.percentage || 0) + item.percentage
    }),
    {}
  )

  const footerColumns = [
    { label: props.intl.formatMessage(constantsMessages.total), width: 30 },
    { label: sumData.total, width: 15 },
    { label: sumData.regWithin45d, width: 15 },
    { label: sumData.estimated, width: 15 },
    {
      label: intl.formatMessage(constantsMessages.averageRateOfRegistrations, {
        amount: (sumData.percentage / props.data.length).toFixed(1)
      }),
      width: 25
    }
  ]

  function toggleSort(key: keyof SortMap) {
    const invertedOrder =
      sortOrder[key] === SORT_ORDER.DESCENDING
        ? SORT_ORDER.ASCENDING
        : SORT_ORDER.DESCENDING
    setSortOrder({ ...sortOrder, [key]: invertedOrder })
  }

  const sortedContent = orderBy(content, ['time'], [sortOrder.time])

  return (
    <ListTable
      noResultText={intl.formatMessage(constantsMessages.noResults)}
      hideBoxShadow={true}
      columns={[
        {
          key: 'month',
          label: intl.formatMessage(constantsMessages.timePeriod),
          width: 30,
          isSortable: true,
          sortFunction: () => toggleSort('time'),
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
          width: 15
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
          width: 25
        }
      ]}
      pageSize={sortedContent.length}
      content={sortedContent}
      footerColumns={footerColumns}
    />
  )
}

export const Within45DaysTable = injectIntl(Within45DaysTableComponent)
