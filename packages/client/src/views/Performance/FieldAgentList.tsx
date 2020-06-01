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
import { DateRangePicker } from '@client/components/DateRangePicker'
import {
  NOTIFICATION_TYPE,
  ToastNotification
} from '@client/components/interface/ToastNotification'
import { LocationPicker } from '@client/components/LocationPicker'
import { Query } from '@client/components/Query'
import { messages } from '@client/i18n/messages/views/performance'
import { goToFieldAgentList, goToOperationalReport } from '@client/navigation'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import { generateLocations } from '@client/utils/locationUtils'
import { OPERATIONAL_REPORT_SECTION } from '@client/views/SysAdmin/Performance/OperationalReport'
import {
  PerformanceContentWrapper,
  PerformancePageVariant
} from '@client/views/SysAdmin/Performance/PerformanceContentWrapper'
import { PerformanceSelect } from '@client/views/SysAdmin/Performance/PerformanceSelect'
import { FETCH_FIELD_AGENTS_WITH_PERFORMANCE_DATA } from '@client/views/SysAdmin/Performance/queries'
import { SORT_ORDER } from '@client/views/SysAdmin/Performance/reports/registrationRates/Within45DaysTable'
import { FilterContainer } from '@client/views/SysAdmin/Performance/utils'
import { ArrowDownBlue } from '@opencrvs/components/lib/icons'
import {
  ColumnContentAlignment,
  ISearchLocation,
  ListTable
} from '@opencrvs/components/lib/interface'
import { GQLSearchFieldAgentResult } from '@opencrvs/gateway/src/graphql/schema'
import { orderBy } from 'lodash'
import moment from 'moment'
import querystring from 'query-string'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'

const DEFAULT_FIELD_AGENT_LIST_SIZE = 25
const { useState } = React
interface SortMap {
  totalApplications: SORT_ORDER
  name: SORT_ORDER
}
const INITIAL_SORT_MAP = {
  totalApplications: SORT_ORDER.DESCENDING,
  name: SORT_ORDER.ASCENDING
}

interface ISearchParams {
  locationId: string
  timeStart: string
  timeEnd: string
}

interface IConnectProps {
  locations: ISearchLocation[]
  facilities: ISearchLocation[]
}

interface IDispatchProps {
  goToOperationalReport: typeof goToOperationalReport
  goToFieldAgentList: typeof goToFieldAgentList
}
type IProps = RouteComponentProps &
  WrappedComponentProps &
  IConnectProps &
  IDispatchProps

export enum EVENT_OPTIONS {
  ALL = '',
  BIRTH = 'BIRTH',
  DEATH = 'DEATH'
}

enum STATUS_OPTIONS {
  ACTIVE = 'active',
  DEACTIVE = 'deactive',
  PENDING = 'pending'
}

function getPercentage(total: number | undefined, current: number | undefined) {
  if (!total || total <= 0 || !current || current <= 0) {
    return 0
  }
  return Math.round((current / total) * 100)
}

function getAverageCompletionTimeInFormat(
  completionTimeInSeconds: number | undefined
) {
  if (!completionTimeInSeconds || completionTimeInSeconds <= 0) {
    return '00:00:00'
  }
  const hours = String(Math.trunc(completionTimeInSeconds / 3600)).padStart(
    2,
    '0'
  )
  const minutes = String(Math.trunc(completionTimeInSeconds / 60)).padStart(
    2,
    '0'
  )
  const seconds = String(completionTimeInSeconds % 60).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

function FieldAgentListComponent(props: IProps) {
  const {
    intl,
    location: { search },
    goToOperationalReport,
    locations,
    facilities
  } = props
  const { locationId, timeStart, timeEnd } = (querystring.parse(
    search
  ) as unknown) as ISearchParams
  const [status, setStatus] = useState<STATUS_OPTIONS>(STATUS_OPTIONS.ACTIVE)
  const [event, setEvent] = useState<EVENT_OPTIONS>(EVENT_OPTIONS.ALL)
  const [sortOrder, setSortOrder] = React.useState<SortMap>(INITIAL_SORT_MAP)
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(1)
  const recordCount = DEFAULT_FIELD_AGENT_LIST_SIZE * currentPageNumber

  const selectedSearchedLocation = locations.find(
    ({ id }) => id === locationId
  ) as ISearchLocation
  const dateStart = new Date(timeStart)
  const dateEnd = new Date(timeEnd)

  function toggleSort(key: keyof SortMap) {
    const invertedOrder =
      sortOrder[key] === SORT_ORDER.DESCENDING
        ? SORT_ORDER.ASCENDING
        : SORT_ORDER.DESCENDING
    setSortOrder({ ...sortOrder, [key]: invertedOrder })
  }

  function getColumns(data?: GQLSearchFieldAgentResult) {
    return [
      {
        key: 'name',
        label: intl.formatMessage(messages.fieldAgentColumnHeader, {
          totalAgents: (data && data.totalItems) || 0
        }),
        width: 20
      },
      {
        key: 'type',
        label: intl.formatMessage(messages.typeColumnHeader),
        width: 12
      },
      {
        key: 'officeName',
        label: intl.formatMessage(messages.officeColumnHeader),
        width: 20
      },
      {
        key: 'startMonth',
        label: intl.formatMessage(messages.startMonthColumnHeader),
        width: 12
      },
      {
        key: 'totalApplications',
        label: intl.formatMessage(messages.totalSentColumnHeader, {
          linebreak: <br key={'totalApplications-break'} />
        }),
        width: 12,
        isSortable: true,
        sortFunction: () => toggleSort('totalApplications'),
        icon: <ArrowDownBlue />
      },
      {
        key: 'inProgressApplications',
        label: intl.formatMessage(messages.totalInProgressColumnHeader, {
          linebreak: <br key={'inProgressApplications-break'} />
        }),
        width: 12
      },
      {
        key: 'avgCompleteApplicationTime',
        label: intl.formatMessage(messages.avgCompletionTimeColumnHeader, {
          linebreak: <br key={'avgCompleteApplicationTime-break'} />
        }),
        width: 15
      },
      {
        key: 'rejectedApplications',
        label: intl.formatMessage(messages.totalRejectedColumnHeader),
        width: 10,
        alignment: ColumnContentAlignment.LEFT
      }
    ]
  }

  function getContent(data?: GQLSearchFieldAgentResult) {
    const content =
      data &&
      data.results &&
      data.results.map(row => {
        if (row === null) {
          return {
            name: '',
            type: '',
            officeName: '',
            startMonth: '',
            totalApplications: '',
            inProgressApplications: '',
            avgCompleteApplicationTime: '',
            rejectedApplications: ''
          }
        }
        const office =
          row.primaryOfficeId &&
          facilities.find(({ id }) => id === row.primaryOfficeId)
        return {
          name: row.fullName,
          type: row.type,
          officeName: (office && office.displayLabel) || '',
          startMonth:
            (row.creationDate &&
              moment(Number(row.creationDate)).format('MMMM YYYY')) ||
            '',
          totalApplications: String(row.totalNumberOfApplicationStarted),
          inProgressApplications: `${
            row.totalNumberOfInProgressAppStarted
          } (${getPercentage(
            row.totalNumberOfApplicationStarted,
            row.totalNumberOfInProgressAppStarted
          )}%)`,
          avgCompleteApplicationTime: getAverageCompletionTimeInFormat(
            row.averageTimeForDeclaredApplications
          ),
          rejectedApplications: `${
            row.totalNumberOfRejectedApplications
          } (${getPercentage(
            row.totalNumberOfApplicationStarted,
            row.totalNumberOfRejectedApplications
          )}%)`
        }
      })
    return (
      (content &&
        orderBy(
          content,
          ['totalApplications'],
          [sortOrder.totalApplications]
        )) ||
      []
    )
  }

  return (
    <PerformanceContentWrapper
      id="field-agent-list"
      hideTopBar
      type={PerformancePageVariant.SUBPAGE}
      backActionHandler={() =>
        goToOperationalReport(
          locationId,
          OPERATIONAL_REPORT_SECTION.OPERATIONAL,
          dateStart,
          dateEnd
        )
      }
      headerTitle={intl.formatMessage(messages.fieldAgentsTitle)}
      toolbarComponent={
        <FilterContainer>
          <LocationPicker
            selectedLocationId={locationId}
            onChangeLocation={newLocationId => {
              props.goToFieldAgentList(newLocationId, timeStart, timeEnd, event)
            }}
            requiredJurisdictionTypes={
              window.config.FIELD_AGENT_AUDIT_LOCATIONS
            }
          />
          <DateRangePicker
            startDate={dateStart}
            endDate={dateEnd}
            onDatesChange={({ startDate, endDate }) =>
              props.goToFieldAgentList(
                locationId as string,
                startDate.toISOString(),
                endDate.toISOString()
              )
            }
          />
          <PerformanceSelect
            onChange={option => {
              setEvent(
                Object.values(EVENT_OPTIONS).find(
                  val => val === option.value
                ) || EVENT_OPTIONS.ALL
              )
            }}
            id="event-select"
            withLightTheme={true}
            defaultWidth={175}
            value={event}
            options={[
              {
                label: intl.formatMessage(messages.eventOptionForBoth),
                value: EVENT_OPTIONS.ALL
              },
              {
                label: intl.formatMessage(messages.eventOptionForBirths),
                value: EVENT_OPTIONS.BIRTH
              },
              {
                label: intl.formatMessage(messages.eventOptionForDeaths),
                value: EVENT_OPTIONS.DEATH
              }
            ]}
          />
          <PerformanceSelect
            onChange={option => {
              setStatus(
                Object.values(STATUS_OPTIONS).find(
                  val => val === option.value
                ) || STATUS_OPTIONS.ACTIVE
              )
            }}
            id="status-select"
            withLightTheme={true}
            defaultWidth={110}
            value={status}
            options={[
              {
                label: intl.formatMessage(
                  messages.fieldAgentStatusOptionActive
                ),
                value: STATUS_OPTIONS.ACTIVE
              },
              {
                label: intl.formatMessage(
                  messages.fieldAgentStatusOptionPending
                ),
                value: STATUS_OPTIONS.PENDING
              },
              {
                label: intl.formatMessage(
                  messages.fieldAgentStatusOptionDeactive
                ),
                value: STATUS_OPTIONS.DEACTIVE
              }
            ]}
          />
        </FilterContainer>
      }
    >
      <Query
        query={FETCH_FIELD_AGENTS_WITH_PERFORMANCE_DATA}
        variables={{
          timeStart: timeStart,
          timeEnd: timeEnd,
          locationId: locationId,
          status: status.toString(),
          event: event === '' ? undefined : event.toUpperCase(),
          count: recordCount,
          sort: 'asc'
        }}
        fetchPolicy={'no-cache'}
      >
        {({ data, loading, error }) => {
          if (error) {
            return (
              <>
                <ListTable
                  id={'field-agent-error-list'}
                  noResultText={intl.formatMessage(
                    messages.fieldAgentsNoResult
                  )}
                  isLoading={true}
                  hideBoxShadow={true}
                  columns={getColumns(data && data.searchFieldAgents)}
                  content={getContent(data && data.searchFieldAgents)}
                />
                <ToastNotification type={NOTIFICATION_TYPE.ERROR} />
              </>
            )
          } else {
            return (
              <ListTable
                id={'field-agent-list'}
                noResultText={intl.formatMessage(messages.fieldAgentsNoResult)}
                isLoading={loading}
                columns={getColumns(data && data.searchFieldAgents)}
                content={getContent(data && data.searchFieldAgents)}
                totalItems={
                  data &&
                  data.searchFieldAgents &&
                  data.searchFieldAgents.totalItems
                }
                currentPage={currentPageNumber}
                pageSize={recordCount}
                onPageChange={(currentPage: number) => {
                  setCurrentPageNumber(currentPage)
                }}
                loadMoreText={intl.formatMessage(
                  messages.showMoreUsersLinkLabel,
                  {
                    pageSize: DEFAULT_FIELD_AGENT_LIST_SIZE
                  }
                )}
                hideBoxShadow={true}
                highlightRowOnMouseOver
              />
            )
          }
        }}
      </Query>
    </PerformanceContentWrapper>
  )
}

export const FieldAgentList = connect(
  (state: IStoreState) => {
    const offlineLocations = getOfflineData(state).locations
    const offlineSearchableLocations = generateLocations(offlineLocations)
    const offlineFacilities = getOfflineData(state).facilities
    const offlineSearchableFacilities = generateLocations(offlineFacilities)
    return {
      locations: offlineSearchableLocations,
      facilities: offlineSearchableFacilities
    }
  },
  { goToOperationalReport, goToFieldAgentList }
)(injectIntl(FieldAgentListComponent))
