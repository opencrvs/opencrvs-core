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
import {
  GQLMixedTotalMetricsResult,
  GQLOfficewiseRegistration
} from '@opencrvs/gateway/src/graphql/schema'
import { messages } from '@client/i18n/messages/views/performance'
import { useSelector } from 'react-redux'
import { getOfflineData } from '@client/offline/selectors'
import { SortArrow } from '@opencrvs/components/lib/icons'
import { concat, orderBy } from 'lodash'
import { REGISTRATION_REPORT_BASE } from '@client/views/SysAdmin/Performance/Registrations'
import { AvatarSmall } from '@client/components/Avatar'
import { IDynamicValues } from '@client/navigation'
import { getPercentage } from '@client/utils/data-formatting'
import { getName } from '@client/views/RecordAudit/utils'

interface Props {
  loading: boolean
  base?: string
  data?: any
  extraData: { days: number }
}

export function RegistrationsDataTable(props: Props) {
  const { data, loading, extraData } = props
  const intl = useIntl()
  const offlineData = useSelector(getOfflineData)
  const [sort, setSort] = React.useState({ by: 'total', order: 'desc' })

  const handleSort = (col: string) =>
    setSort((prevSort) => {
      if (prevSort.by === col)
        return {
          ...prevSort,
          order: prevSort.order === 'desc' ? 'asc' : 'desc'
        }
      else return { by: col, order: 'desc' }
    })

  enum BASE_TYPE {
    by_registrar = 'REGISTRAR',
    by_location = 'LOCATION'
  }

  function getRegistrarAvgPerDay(registrarPractitionerId: string) {
    const filterPractitioner = data.results?.filter(
      (r: { registrarPractitioner: { id: string } }) => {
        return r.registrarPractitioner?.id === registrarPractitionerId
      }
    )

    return Number(filterPractitioner[0].total / (extraData.days || 1)).toFixed(
      2
    )
  }

  function getColumns() {
    const commonColumns = [
      {
        key: 'total',
        label: intl.formatMessage(messages.performanceTotalRegitrationsHeader),
        isSorted: sort.by === 'total',
        sortFunction: handleSort,
        icon: <SortArrow active={sort.by === 'total'} />,
        isSortable: true,
        width: 25
      },
      {
        key: 'avgPerDay',
        isSortable: true,
        isSorted: sort.by === 'avgPerDay',
        sortFunction: handleSort,
        icon: <SortArrow active={sort.by === 'avgPerDay'} />,
        label: intl.formatMessage(messages.performanceAvgPerDayHeader),
        width: 25
      }
    ]
    if (props.base === REGISTRATION_REPORT_BASE.LOCATION)
      return [
        {
          key: 'officeLocation',
          label: intl.formatMessage(messages.locationTitle),
          isSortable: true,
          isSorted: sort.by === 'officeLocation',
          sortFunction: handleSort,
          icon: <SortArrow active={sort.by === 'officeLocation'} />,
          width: 50
        },
        ...commonColumns
      ]
    if (props.base === REGISTRATION_REPORT_BASE.REGISTRAR)
      return [
        {
          key: 'name',
          label: intl.formatMessage(messages.registrar),
          isSortable: true,
          isSorted: sort.by === 'name',
          sortFunction: handleSort,
          icon: <SortArrow active={sort.by === 'name'} />,
          width: 30
        },
        {
          key: 'officeLocation',
          label: intl.formatMessage(messages.officeColumnHeader),
          isSortable: true,
          isSorted: sort.by === 'officeLocation',
          sortFunction: handleSort,
          icon: <SortArrow active={sort.by === 'officeLocation'} />,
          width: 50
        },
        ...commonColumns
      ]
    throw new Error('Invalid Filter')
  }

  function getContent(data?: any) {
    const content = { ...data } as IDynamicValues
    let finalContent: IDynamicValues[] = []

    if (content.base === BASE_TYPE.by_location) {
      finalContent = content?.data?.results?.map(
        (result: IDynamicValues, index: number) => ({
          total: String(result.total),
          officeLocation:
            offlineData.offices[result.officeLocation]?.name ?? '',
          avgPerDay: Number(result.total / (extraData.days || 1)).toFixed(2)
        })
      )
    } else if (content.base === BASE_TYPE.by_registrar) {
      finalContent = content?.data?.results
        ?.filter((result: IDynamicValues) => {
          return result?.registrarPractitioner?.role === 'REGISTRATION_AGENT'
        })
        .map((result: IDynamicValues, index: number) => ({
          total: String(result?.total),
          name:
            result?.registrarPractitioner?.name?.[0].firstNames +
            ' ' +
            result?.registrarPractitioner?.name?.[0].familyName,
          officeLocation:
            result?.registrarPractitioner?.primaryOffice?.name ?? '',
          avgPerDay: getRegistrarAvgPerDay(result?.registrarPractitioner?.id)
        }))
    }

    return orderBy(finalContent, sort.by, sort.order as 'asc' | 'desc')
  }

  return (
    <ListTable
      noResultText={intl.formatMessage(constantsMessages.noResults)}
      isLoading={loading}
      columns={getColumns()}
      pageSize={getContent(props).length}
      content={getContent(props)}
      hideBoxShadow={true}
      highlightRowOnMouseOver
    />
  )
}
