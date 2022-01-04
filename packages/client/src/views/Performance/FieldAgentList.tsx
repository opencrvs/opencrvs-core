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
import { formatTimeDuration } from '@client/DateUtils'
import { messages } from '@client/i18n/messages/views/performance'
import { goToFieldAgentList, goToOperationalReport } from '@client/navigation'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import { generateLocations } from '@client/utils/locationUtils'
import { OPERATIONAL_REPORT_SECTION } from '@client/views/SysAdmin/Performance/OperationalReport'
import { PerformanceSelect } from '@client/views/SysAdmin/Performance/PerformanceSelect'
import { FETCH_FIELD_AGENTS_WITH_PERFORMANCE_DATA } from '@client/views/SysAdmin/Performance/queries'
import { SORT_ORDER } from '@client/views/SysAdmin/Performance/reports/registrationRates/Within45DaysTable'
import { FilterContainer } from '@client/views/SysAdmin/Performance/utils'
import {
  SysAdminContentWrapper,
  SysAdminPageVariant
} from '@client/views/SysAdmin/SysAdminContentWrapper'
import { ArrowDownBlue } from '@opencrvs/components/lib/icons'
import {
  ColumnContentAlignment,
  ListTable
} from '@opencrvs/components/lib/interface'
import { GQLSearchFieldAgentResult } from '@opencrvs/gateway/src/graphql/schema'
import { orderBy } from 'lodash'
import moment from 'moment'
import { parse } from 'query-string'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'
import { ILocation } from '@client/offline/reducer'

const ToolTipContainer = styled.span`
  text-align: center;
`

const DEFAULT_FIELD_AGENT_LIST_SIZE = 25
const { useState } = React
interface SortMap {
  totalApplications: SORT_ORDER
  name: SORT_ORDER
  startMonth: SORT_ORDER
  avgCompleteApplicationTime: SORT_ORDER
  type: SORT_ORDER
  officeName: SORT_ORDER
  inProgressApplications: SORT_ORDER
  rejectedApplications: SORT_ORDER
}
const INITIAL_SORT_MAP = {
  totalApplications: SORT_ORDER.DESCENDING,
  name: SORT_ORDER.ASCENDING,
  startMonth: SORT_ORDER.ASCENDING,
  avgCompleteApplicationTime: SORT_ORDER.ASCENDING,
  type: SORT_ORDER.ASCENDING,
  officeName: SORT_ORDER.ASCENDING,
  inProgressApplications: SORT_ORDER.ASCENDING,
  rejectedApplications: SORT_ORDER.ASCENDING
}

interface ISearchParams {
  locationId: string
  timeStart: string
  timeEnd: string
}

interface IConnectProps {
  offlineOffices: { [key: string]: ILocation }
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

function getAverageCompletionTimeComponent(
  completionTimeInSeconds: number | undefined,
  id: number
) {
  const timeStructure = formatTimeDuration(completionTimeInSeconds || 0)
  const label =
    (timeStructure &&
      `${timeStructure.days}:${timeStructure.hours}:${timeStructure.minutes}`) ||
    '-'
  const tooltip =
    (timeStructure &&
      `${timeStructure.days} days, ${timeStructure.hours} hours, ${timeStructure.minutes} minutes`) ||
    '-'

  return (
    <>
      <ReactTooltip id={`cmpltn_time_${id}`}>
        <ToolTipContainer>{tooltip}</ToolTipContainer>
      </ReactTooltip>
      <span data-tip data-for={`cmpltn_time_${id}`}>
        {label}
      </span>
    </>
  )
}

function FieldAgentListComponent(props: IProps) {
  const {
    intl,
    location: { search },
    goToOperationalReport,
    offlineOffices
  } = props
  const { locationId, timeStart, timeEnd } = (parse(
    search
  ) as unknown) as ISearchParams
  const [status, setStatus] = useState<STATUS_OPTIONS>(STATUS_OPTIONS.ACTIVE)
  const [event, setEvent] = useState<EVENT_OPTIONS>(EVENT_OPTIONS.ALL)
  const [sortOrder, setSortOrder] = React.useState<SortMap>(INITIAL_SORT_MAP)
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(1)
  const [columnToBeSort, setColumnToBeSort] = useState<keyof SortMap>(
    'totalApplications'
  )
  const recordCount = DEFAULT_FIELD_AGENT_LIST_SIZE * currentPageNumber
  const dateStart = new Date(timeStart)
  const dateEnd = new Date(timeEnd)
  const offices = generateLocations(offlineOffices, intl)

  const isOfficeSelected = offices.some(office => office.id === locationId)

  const queryVariables = isOfficeSelected
    ? {
        timeStart: timeStart,
        timeEnd: timeEnd,
        primaryOfficeId: locationId,
        status: status.toString(),
        event: event === '' ? undefined : event.toUpperCase(),
        count: recordCount,
        sort: 'asc'
      }
    : {
        timeStart: timeStart,
        timeEnd: timeEnd,
        locationId: locationId,
        status: status.toString(),
        event: event === '' ? undefined : event.toUpperCase(),
        count: recordCount,
        sort: 'asc'
      }

  function toggleSort(key: keyof SortMap) {
    const invertedOrder =
      sortOrder[key] === SORT_ORDER.DESCENDING
        ? SORT_ORDER.ASCENDING
        : SORT_ORDER.DESCENDING
    setSortOrder({ ...sortOrder, [key]: invertedOrder })
    setColumnToBeSort(key)
  }

  function getColumns(data?: GQLSearchFieldAgentResult) {
    return [
      {
        key: 'name',
        label: intl.formatMessage(messages.fieldAgentColumnHeader, {
          totalAgents: (data && data.totalItems) || 0
        }),
        width: 20,
        isSortable: true,
        sortFunction: () => toggleSort('name'),
        icon: columnToBeSort === 'name' ? <ArrowDownBlue /> : <></>,
        isSorted: columnToBeSort === 'name' ? true : false
      },
      {
        key: 'type',
        label: intl.formatMessage(messages.typeColumnHeader),
        width: 12,
        isSortable: true,
        sortFunction: () => toggleSort('type'),
        icon: columnToBeSort === 'type' ? <ArrowDownBlue /> : <></>,
        isSorted: columnToBeSort === 'type' ? true : false
      },
      {
        key: 'officeName',
        label: intl.formatMessage(messages.officeColumnHeader),
        width: 20,
        isSortable: true,
        sortFunction: () => toggleSort('officeName'),
        icon: columnToBeSort === 'officeName' ? <ArrowDownBlue /> : <></>,
        isSorted: columnToBeSort === 'officeName' ? true : false
      },
      {
        key: 'startMonth',
        label: intl.formatMessage(messages.startMonthColumnHeader),
        width: 12,
        isSortable: true,
        sortFunction: () => toggleSort('startMonth'),
        icon: columnToBeSort === 'startMonth' ? <ArrowDownBlue /> : <></>,
        isSorted: columnToBeSort === 'startMonth' ? true : false
      },
      {
        key: 'totalApplications',
        label: intl.formatMessage(messages.totalSentColumnHeader, {
          linebreak: <br key={'totalApplications-break'} />
        }),
        width: 12,
        isSortable: true,
        sortFunction: () => toggleSort('totalApplications'),
        icon:
          columnToBeSort === 'totalApplications' ? <ArrowDownBlue /> : <></>,
        isSorted: columnToBeSort === 'totalApplications' ? true : false
      },
      {
        key: 'inProgressApplications',
        label: intl.formatMessage(messages.totalInProgressColumnHeader, {
          linebreak: <br key={'inProgressApplications-break'} />
        }),
        width: 12,
        isSortable: true,
        sortFunction: () => toggleSort('inProgressApplications'),
        icon:
          columnToBeSort === 'inProgressApplications' ? (
            <ArrowDownBlue />
          ) : (
            <></>
          ),
        isSorted: columnToBeSort === 'inProgressApplications' ? true : false
      },
      {
        key: 'avgCompleteApplicationTime',
        label: intl.formatMessage(messages.avgCompletionTimeColumnHeader, {
          linebreak: <br key={'avgCompleteApplicationTime-break'} />
        }),
        width: 15,
        isSortable: true,
        sortFunction: () => toggleSort('avgCompleteApplicationTime'),
        icon:
          columnToBeSort === 'avgCompleteApplicationTime' ? (
            <ArrowDownBlue />
          ) : (
            <></>
          ),
        isSorted: columnToBeSort === 'avgCompleteApplicationTime' ? true : false
      },
      {
        key: 'rejectedApplications',
        label: intl.formatMessage(messages.totalRejectedColumnHeader),
        width: 10,
        alignment: ColumnContentAlignment.RIGHT,
        isSortable: true,
        sortFunction: () => toggleSort('rejectedApplications'),
        icon:
          columnToBeSort === 'rejectedApplications' ? <ArrowDownBlue /> : <></>,
        isSorted: columnToBeSort === 'rejectedApplications' ? true : false
      }
    ]
  }

  function getContent(data?: GQLSearchFieldAgentResult) {
    const content =
      data &&
      data.results &&
      data.results.map((row, idx) => {
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
          offices.find(({ id }) => id === row.primaryOfficeId)
        return {
          name: row.fullName,
          type: row.type,
          officeName: (office && office.displayLabel) || '',
          startMonth: row.creationDate,
          totalApplications: String(row.totalNumberOfApplicationStarted),
          inProgressApplications: `${
            row.totalNumberOfInProgressAppStarted
          } (${getPercentage(
            row.totalNumberOfApplicationStarted,
            row.totalNumberOfInProgressAppStarted
          )}%)`,
          avgCompleteApplicationTime: row.averageTimeForDeclaredApplications,
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
          columnToBeSort === 'name'
            ? [content => content[columnToBeSort]!.toString().toLowerCase()]
            : [columnToBeSort],
          [sortOrder[columnToBeSort]]
        ).map((row, idx) => {
          return {
            ...row,
            startMonth:
              (row.startMonth &&
                moment(Number(row.startMonth)).format('MMMM YYYY')) ||
              '',
            avgCompleteApplicationTime: getAverageCompletionTimeComponent(
              Number(row.avgCompleteApplicationTime),
              idx
            )
          }
        })) ||
      []
    )
  }

  return (
    <SysAdminContentWrapper
      id="field-agent-list"
      type={SysAdminPageVariant.SUBPAGE}
      backActionHandler={() =>
        goToOperationalReport(
          locationId,
          OPERATIONAL_REPORT_SECTION.OPERATIONAL,
          dateStart,
          dateEnd
        )
      }
      fixedWidth={1500}
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
        variables={queryVariables}
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
                  fixedWidth={1500}
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
                fixedWidth={1500}
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
                isFullPage
                highlightRowOnMouseOver
              />
            )
          }
        }}
      </Query>
    </SysAdminContentWrapper>
  )
}

export const FieldAgentList = connect(
  (state: IStoreState) => {
    const offlineOffices = getOfflineData(state).offices
    return {
      offlineOffices
    }
  },
  { goToOperationalReport, goToFieldAgentList }
)(injectIntl(FieldAgentListComponent))
