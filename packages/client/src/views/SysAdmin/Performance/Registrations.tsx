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
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import * as React from 'react'
import {
  ContentSize,
  Content
} from '@opencrvs/components/lib/interface/Content'
import { LocationPicker } from '@client/components/LocationPicker'
import { useDispatch } from 'react-redux'
import { goToRegistrations, useQuery } from '@client/navigation'
import { useIntl } from 'react-intl'
import { GetOfficewiseRegistrationsQuery } from '@client/utils/gateway'
import { messages } from '@client/i18n/messages/views/performance'
import { PerformanceSelect } from '@client/views/SysAdmin/Performance/PerformanceSelect'
import { SegmentedControl } from '@client/components/SegmentedControl'
import { DateRangePicker } from '@client/components/DateRangePicker'
import { Query } from '@client/components/Query'
import { GET_OFFICEWISE_REGISTRATIONS } from './queries'
import {
  ToastNotification,
  NOTIFICATION_TYPE
} from '@client/components/interface/ToastNotification'
import { RegistrationsDataTable } from './reports/registrations/RegistrationsDataTable'
import intervalToDuration from 'date-fns/intervalToDuration'
import differenceInDays from 'date-fns/differenceInDays'

interface ISearchParams {
  eventType: 'BIRTH' | 'DEATH'
  locationId: string
  timeStart: Date
  timeEnd: Date
}

export enum REGISTRATION_REPORT_BASE {
  TIME = 'TIME',
  LOCATION = 'LOCATION',
  REGISTRAR = 'REGISTRAR'
}

export function Registrations() {
  const query = useQuery()
  const dispatch = useDispatch()
  const intl = useIntl()
  const [base, setBase] = React.useState(REGISTRATION_REPORT_BASE.LOCATION)
  const updateFilters = (filter: Partial<ISearchParams>) =>
    dispatch(
      goToRegistrations(
        filter.eventType ??
          (query.get('eventType')! as ISearchParams['eventType']),
        filter.locationId ?? query.get('locationId')!,
        filter.timeStart ?? new Date(query.get('timeStart')!),
        filter.timeEnd ?? new Date(query.get('timeEnd')!)
      )
    )
  function getFilter() {
    return (
      <>
        <LocationPicker
          selectedLocationId={query.get('locationId')!}
          onChangeLocation={(locationId) => updateFilters({ locationId })}
        />
        <PerformanceSelect
          onChange={(option) =>
            updateFilters({
              eventType: option.value as ISearchParams['eventType']
            })
          }
          id="eventSelect"
          withLightTheme={true}
          defaultWidth={110}
          value={query.get('eventType')!}
          options={[
            {
              label: intl.formatMessage(messages.eventOptionForBirths),
              value: 'BIRTH'
            },
            {
              label: intl.formatMessage(messages.eventOptionForDeaths),
              value: 'DEATH'
            }
          ]}
        />
        <DateRangePicker
          startDate={new Date(query.get('timeStart')!)}
          endDate={new Date(query.get('timeEnd')!)}
          onDatesChange={({ startDate, endDate }) =>
            updateFilters({ timeStart: startDate, timeEnd: endDate })
          }
        />
        <SegmentedControl
          value={base}
          options={[
            {
              label: intl.formatMessage(messages.overTime),
              value: REGISTRATION_REPORT_BASE.TIME,
              disabled: true
            },
            {
              label: intl.formatMessage(messages.byLocation),
              value: REGISTRATION_REPORT_BASE.LOCATION
            },
            {
              label: intl.formatMessage(messages.byRegistrars),
              value: REGISTRATION_REPORT_BASE.REGISTRAR,
              disabled: true
            }
          ]}
          onChange={(option) =>
            setBase(option.value as REGISTRATION_REPORT_BASE)
          }
        />
      </>
    )
  }

  return (
    <SysAdminContentWrapper
      id="registrations"
      isCertificatesConfigPage={true}
      hideBackground={true}
    >
      <Content
        title={intl.formatMessage(messages.performanceTotalRegitrationsHeader)}
        size={ContentSize.LARGE}
        filterContent={getFilter()}
      >
        <Query<GetOfficewiseRegistrationsQuery>
          query={GET_OFFICEWISE_REGISTRATIONS}
          variables={{
            event: query.get('eventType'),
            locationId: query.get('locationId'),
            timeStart: query.get('timeStart'),
            timeEnd: query.get('timeEnd')
          }}
        >
          {({ data, loading, error }) => {
            if (error) {
              return <ToastNotification type={NOTIFICATION_TYPE.ERROR} />
            }

            if (data?.getOfficewiseRegistrations || loading) {
              return (
                <RegistrationsDataTable
                  data={data!.getOfficewiseRegistrations!}
                  loading={loading}
                  extraData={{
                    days: differenceInDays(
                      new Date(query.get('timeEnd')!),
                      new Date(query.get('timeStart')!)
                    )
                  }}
                />
              )
            }
          }}
        </Query>
      </Content>
    </SysAdminContentWrapper>
  )
}
