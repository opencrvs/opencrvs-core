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
import { constantsMessages } from '@client/i18n/messages'
import { ListTable } from '@opencrvs/components/lib/interface'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { GQLOfficewiseRegistration } from '@opencrvs/gateway/src/graphql/schema'
import { messages } from '@client/i18n/messages/views/performance'
import { useSelector } from 'react-redux'
import { getOfflineData } from '@client/offline/selectors'

interface Props {
  loading: boolean
  data?: GQLOfficewiseRegistration[]
  extraData: { days: number }
}

export function RegistrationsDataTable(props: Props) {
  const { loading, extraData } = props
  const intl = useIntl()
  const offlineData = useSelector(getOfflineData)
  const sortedContent =
    props.data?.map((r) => ({
      total: r.total.toString(),
      officeLocation: offlineData.offices[r.officeLocation]?.name ?? '',
      avgPerDay: Number(r.total / (extraData.days || 1)).toFixed(2)
    })) || []
  return (
    <ListTable
      noResultText={intl.formatMessage(constantsMessages.noResults)}
      isLoading={loading}
      columns={[
        {
          key: 'officeLocation',
          label: intl.formatMessage(messages.locationTitle),
          width: 50
        },
        {
          key: 'total',
          label: intl.formatMessage(
            messages.performanceTotalRegitrationsHeader
          ),
          width: 25
        },
        {
          key: 'avgPerDay',
          label: intl.formatMessage(messages.performanceAvgPerDayHeader),
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
