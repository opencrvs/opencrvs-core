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
import { GenericErrorToast } from '@client/components/GenericErrorToast'
import { LocationPicker } from '@client/components/LocationPicker'
import { Query } from '@client/components/Query'
import { formatTimeDuration } from '@client/DateUtils'
import { messages } from '@client/i18n/messages/views/performance'
import { goToFieldAgentList, goToPerformanceHome } from '@client/navigation'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import { generateLocations } from '@client/utils/locationUtils'
import {
  IPerformanceSelectOption,
  PerformanceSelect
} from '@client/views/SysAdmin/Performance/PerformanceSelect'
import {
  FETCH_FIELD_AGENTS_WITH_PERFORMANCE_DATA,
  FETCH_REGISTRATIONS
} from '@client/views/SysAdmin/Performance/queries'
import { SORT_ORDER } from '@client/views/SysAdmin/Performance/reports/completenessRates/CompletenessDataTable'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { SortArrow } from '@opencrvs/components/lib/icons'
import { AvatarSmall } from '@client/components/Avatar'
import { Table } from '@opencrvs/components/lib/Table'
import { ColumnContentAlignment } from '@opencrvs/components/lib/common-types'
import {
  GQLMixedTotalMetricsResult,
  GQLSearchFieldAgentResult
} from '@opencrvs/gateway/src/graphql/schema'
import { orderBy } from 'lodash'
import { parse } from 'query-string'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'
import { ILocation } from '@client/offline/reducer'
import format from '@client/utils/date-formatting'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { IAvatar } from '@client/utils/userUtils'
import { Pagination } from '@opencrvs/components/lib/Pagination'
import { userMessages } from '@client/i18n/messages'
import { SegmentedControl } from '@client/components/SegmentedControl'
import { get, isEmpty } from 'lodash'
import { getName } from '../RecordAudit/utils'

const ToolTipContainer = styled.span`
  text-align: center;
`
const DEFAULT_FIELD_AGENT_LIST_SIZE = 25
const { useState } = React
interface SortMap {
  month: SORT_ORDER
  location: SORT_ORDER
  totalRegistrations: SORT_ORDER
  lateRegistrations: SORT_ORDER
  delayedRegistrations: SORT_ORDER
  healthFacility: SORT_ORDER
  homeBirth: SORT_ORDER
}
const INITIAL_SORT_MAP = {
  month: SORT_ORDER.ASCENDING,
  location: SORT_ORDER.ASCENDING,
  totalRegistrations: SORT_ORDER.ASCENDING,
  lateRegistrations: SORT_ORDER.ASCENDING,
  delayedRegistrations: SORT_ORDER.ASCENDING,
  healthFacility: SORT_ORDER.ASCENDING,
  homeBirth: SORT_ORDER.ASCENDING
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
  goToPerformanceHome: typeof goToPerformanceHome
  goToFieldAgentList: typeof goToFieldAgentList
}
type IProps = RouteComponentProps &
  WrappedComponentProps &
  IConnectProps &
  IDispatchProps

export enum EVENT_OPTIONS {
  BIRTH = 'BIRTH',
  DEATH = 'DEATH'
}

enum RESULT_TYPE {
  by_registrar = 'TotalMetricsByRegistrarResult',
  by_location = 'TotalMetricsByLocation',
  by_time = 'TotalMetricsByTime'
}

enum STATUS_OPTIONS {
  ACTIVE = 'active',
  DEACTIVE = 'deactivated',
  PENDING = 'pending'
}

enum FILTER_BY_OPTIONS {
  BY_TIME = 'by_time',
  BY_LOCATION = 'by_location',
  BY_REGISTRAR = 'by_registrar'
}

const TableDiv = styled.div`
  overflow: auto;
`

const NameAvatar = styled.div`
  display: flex;
  align-items: center;
  img {
    margin-right: 10px;
  }
`

function getNameWithAvatar(userName: string, avatar?: IAvatar) {
  return (
    <NameAvatar>
      <AvatarSmall name={userName} avatar={avatar} />
      <span>{userName}</span>
    </NameAvatar>
  )
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

function RegistrationListComponent(props: IProps) {
  const {
    intl,
    location: { search },
    offlineOffices
  } = props
  const { locationId, timeStart, timeEnd } = parse(
    search
  ) as unknown as ISearchParams
  const [filterBy, setFilterBy] = useState<FILTER_BY_OPTIONS>(
    FILTER_BY_OPTIONS.BY_TIME
  )
  const [status, setStatus] = useState<STATUS_OPTIONS>(STATUS_OPTIONS.ACTIVE)
  const [event, setEvent] = useState<EVENT_OPTIONS>(EVENT_OPTIONS.BIRTH)
  const [sortOrder, setSortOrder] = React.useState<SortMap>(INITIAL_SORT_MAP)
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(1)
  const [columnToBeSort, setColumnToBeSort] =
    useState<keyof SortMap>('totalRegistrations')
  const recordCount = DEFAULT_FIELD_AGENT_LIST_SIZE * currentPageNumber
  const dateStart = new Date(timeStart)
  const dateEnd = new Date(timeEnd)
  const offices = generateLocations(offlineOffices, intl)

  const isOfficeSelected = offices.some((office) => office.id === locationId)

  const queryVariables = isOfficeSelected
    ? {
        timeStart: timeStart,
        timeEnd: timeEnd,
        primaryOfficeId: locationId,
        status: status.toString(),
        event: event || undefined,
        count: recordCount,
        sort: 'asc',
        skip: 0,
        filterBy
      }
    : {
        timeStart: timeStart,
        timeEnd: timeEnd,
        locationId: locationId,
        status: status.toString(),
        event: event || undefined,
        count: recordCount,
        sort: 'asc',
        skip: 0,
        filterBy
      }

  function toggleSort(key: keyof SortMap) {
    const invertedOrder =
      sortOrder[key] === SORT_ORDER.DESCENDING
        ? SORT_ORDER.ASCENDING
        : SORT_ORDER.DESCENDING
    setSortOrder({ ...sortOrder, [key]: invertedOrder })
    setColumnToBeSort(key)
  }

  function getColumns() {
    const commonColumns = [
      {
        key: 'total',
        label: intl.formatMessage(messages.totalRegistrations),
        width: 20,
        isSortable: true,
        sortFunction: () => toggleSort('totalRegistrations'),
        icon:
          columnToBeSort === 'totalRegistrations' ? (
            <SortArrow active={true} />
          ) : (
            <></>
          ),
        isSorted: columnToBeSort === 'totalRegistrations' ? true : false
      },
      {
        key: 'late',
        label: intl.formatMessage(messages.performanceLateRegistrationsLabel),
        width: 20,
        isSortable: true,
        sortFunction: () => toggleSort('lateRegistrations'),
        icon:
          columnToBeSort === 'lateRegistrations' ? (
            <SortArrow active={true} />
          ) : (
            <></>
          ),
        isSorted: columnToBeSort === 'lateRegistrations' ? true : false
      },
      {
        key: 'delayed',
        label: intl.formatMessage(
          messages.performanceDelayedRegistrationsLabel
        ),
        width: 20,
        isSortable: true,
        sortFunction: () => toggleSort('delayedRegistrations'),
        icon:
          columnToBeSort === 'delayedRegistrations' ? (
            <SortArrow active={true} />
          ) : (
            <></>
          ),
        isSorted: columnToBeSort === 'lateRegistrations' ? true : false
      }
    ]

    if (filterBy === FILTER_BY_OPTIONS.BY_TIME)
      return [
        {
          key: 'month',
          label: intl.formatMessage(messages.month),
          width: 20,
          isSortable: true,
          sortFunction: () => toggleSort('month'),
          icon:
            columnToBeSort === 'month' ? <SortArrow active={true} /> : <></>,
          isSorted: columnToBeSort === 'month' ? true : false
        },
        ...commonColumns,
        {
          key: 'homeBirth',
          label: intl.formatMessage(messages.performanceHomeBirth),
          width: 20,
          isSortable: true,
          sortFunction: () => toggleSort('homeBirth'),
          icon:
            columnToBeSort === 'homeBirth' ? (
              <SortArrow active={true} />
            ) : (
              <></>
            ),
          isSorted: columnToBeSort === 'homeBirth' ? true : false
        },
        {
          key: 'healthFacility',
          label: intl.formatMessage(messages.performanceHealthFacilityBirth),
          width: 20,
          isSortable: true,
          sortFunction: () => toggleSort('healthFacility'),
          icon:
            columnToBeSort === 'healthFacility' ? (
              <SortArrow active={true} />
            ) : (
              <></>
            ),
          isSorted: columnToBeSort === 'healthFacility' ? true : false
        }
      ]
    if (filterBy === FILTER_BY_OPTIONS.BY_LOCATION)
      return [
        {
          key: 'location',
          label: intl.formatMessage(messages.location),
          width: 20,
          isSortable: true,
          sortFunction: () => toggleSort('location'),
          icon:
            columnToBeSort === 'location' ? <SortArrow active={true} /> : <></>,
          isSorted: columnToBeSort === 'location' ? true : false
        },
        ...commonColumns,
        {
          key: 'homeBirth',
          label: intl.formatMessage(messages.performanceHomeBirth),
          width: 20,
          isSortable: true,
          sortFunction: () => toggleSort('homeBirth'),
          icon:
            columnToBeSort === 'homeBirth' ? (
              <SortArrow active={true} />
            ) : (
              <></>
            ),
          isSorted: columnToBeSort === 'homeBirth' ? true : false
        },
        {
          key: 'healthFacility',
          label: intl.formatMessage(messages.performanceHealthFacilityBirth),
          width: 20,
          isSortable: true,
          sortFunction: () => toggleSort('healthFacility'),
          icon:
            columnToBeSort === 'healthFacility' ? (
              <SortArrow active={true} />
            ) : (
              <></>
            ),
          isSorted: columnToBeSort === 'healthFacility' ? true : false
        }
      ]
    if (filterBy === FILTER_BY_OPTIONS.BY_REGISTRAR)
      return [
        {
          key: 'name',
          label: intl.formatMessage(messages.registrar),
          width: 20
        },
        {
          key: 'role',
          label: intl.formatMessage(messages.typeColumnHeader),
          width: 20
        },
        {
          key: 'location',
          label: intl.formatMessage(messages.officeColumnHeader),
          width: 20
        },
        ...commonColumns
      ]
    throw new Error('Invalid Filter')
  }

  function getFieldAgentTypeLabel(type: string) {
    return userMessages[type] ? intl.formatMessage(userMessages[type]) : type
  }

  function getContent(data?: GQLMixedTotalMetricsResult) {
    if (!data) {
      return []
    }

    if (data.__typename === RESULT_TYPE.by_registrar) {
      return data.results.map((result) => ({
        ...result,
        name: result.registrarPractitioner.user.name
          ? getName(result.registrarPractitioner.user.name, 'en')
          : '',
        location: result.registrarPractitioner.user.primaryOffice.name,
        role: getFieldAgentTypeLabel(result.registrarPractitioner.user.role)
      }))
    } else if (data.__typename === RESULT_TYPE.by_location) {
      return []
    } else if (data.__typename === RESULT_TYPE.by_time) {
      return []
    } else {
      return []
    }
  }

  const options: (IPerformanceSelectOption & { disabled?: boolean })[] = [
    {
      label: intl.formatMessage(messages.overTime),
      value: FILTER_BY_OPTIONS.BY_TIME
    },
    {
      label: intl.formatMessage(messages.byLocation),
      value: FILTER_BY_OPTIONS.BY_LOCATION
    },
    {
      label: intl.formatMessage(messages.byRegistrar),
      value: FILTER_BY_OPTIONS.BY_REGISTRAR
    }
  ]

  const skip = (currentPageNumber - 1) * 1
  queryVariables.skip = skip
  return (
    <SysAdminContentWrapper
      id="field-agent-list"
      isCertificatesConfigPage={true}
    >
      <Content
        title={intl.formatMessage(messages.performanceTotalRegitrationsHeader)}
        size={ContentSize.LARGE}
        filterContent={
          <>
            <LocationPicker
              selectedLocationId={locationId}
              onChangeLocation={(newLocationId) => {
                props.goToFieldAgentList(timeStart, timeEnd, newLocationId)
              }}
              requiredJurisdictionTypes={
                window.config.FIELD_AGENT_AUDIT_LOCATIONS
              }
            />
            <PerformanceSelect
              onChange={(option) => {
                setEvent(
                  Object.values(EVENT_OPTIONS).find(
                    (val) => val === option.value
                  ) || EVENT_OPTIONS.BIRTH
                )
              }}
              id="event-select"
              withLightTheme={true}
              defaultWidth={110}
              value={event}
              options={[
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
            <DateRangePicker
              startDate={dateStart}
              endDate={dateEnd}
              onDatesChange={({ startDate, endDate }) =>
                props.goToFieldAgentList(
                  startDate.toISOString(),
                  endDate.toISOString(),
                  locationId
                )
              }
            />

            <SegmentedControl
              id="base-select"
              value={filterBy}
              options={options}
              onChange={(option) =>
                setFilterBy(option.value as FILTER_BY_OPTIONS)
              }
            />
          </>
        }
      >
        <Query
          query={FETCH_REGISTRATIONS}
          variables={queryVariables}
          fetchPolicy={'no-cache'}
        >
          {({ data, loading, error }) => {
            if (error) {
              return (
                <>
                  <Table
                    id={'field-agent-error-list'}
                    noResultText={intl.formatMessage(
                      messages.fieldAgentsNoResult
                    )}
                    isLoading={true}
                    columns={getColumns()}
                    content={getContent(data && data.searchFieldAgents)}
                  />
                  <GenericErrorToast />
                </>
              )
            } else {
              const totalData = get(
                data,
                'getRegistrationsListByFilter.results.length'
              )
              return (
                <TableDiv>
                  <Table
                    id={'field-agent-list'}
                    noResultText={intl.formatMessage(
                      messages.fieldAgentsNoResult
                    )}
                    isLoading={loading}
                    disableScrollOnOverflow={true}
                    columns={getColumns()}
                    content={getContent(
                      data && data.getRegistrationsListByFilter
                    )}
                    totalItems={totalData}
                    currentPage={currentPageNumber}
                    pageSize={recordCount}
                    onPageChange={(currentPage: number) => {
                      setCurrentPageNumber(currentPage)
                    }}
                    isFullPage={true}
                    highlightRowOnMouseOver
                  />
                  {totalData > DEFAULT_FIELD_AGENT_LIST_SIZE && (
                    <Pagination
                      currentPage={currentPageNumber}
                      totalPages={Math.ceil(
                        totalData / DEFAULT_FIELD_AGENT_LIST_SIZE
                      )}
                      onPageChange={(currentPage: number) => {
                        setCurrentPageNumber(currentPage)
                      }}
                    />
                  )}
                </TableDiv>
              )
            }
          }}
        </Query>
      </Content>
    </SysAdminContentWrapper>
  )
}

export const RegistrationList = connect(
  (state: IStoreState) => {
    const offlineOffices = getOfflineData(state).offices
    return {
      offlineOffices
    }
  },
  { goToPerformanceHome, goToFieldAgentList }
)(injectIntl(RegistrationListComponent))
