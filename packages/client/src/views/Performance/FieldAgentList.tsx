/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
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
import { PerformanceSelect } from '@client/views/SysAdmin/Performance/PerformanceSelect'
import { FETCH_FIELD_AGENTS_WITH_PERFORMANCE_DATA } from '@client/views/SysAdmin/Performance/queries'
import { SORT_ORDER } from '@client/views/SysAdmin/Performance/reports/completenessRates/CompletenessDataTable'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { SortArrow } from '@opencrvs/components/lib/icons'
import { AvatarSmall } from '@client/components/Avatar'
import { Table } from '@opencrvs/components/lib/Table'
import { ColumnContentAlignment } from '@opencrvs/components/lib/common-types'
import type { GQLSearchFieldAgentResult } from '@client/utils/gateway-deprecated-do-not-use'
import { orderBy } from 'lodash'
import { parse } from 'query-string'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect, useSelector } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'
import { ILocation } from '@client/offline/reducer'
import format from '@client/utils/date-formatting'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { Avatar, Event } from '@client/utils/gateway'
import { Pagination } from '@opencrvs/components/lib/Pagination'
import { getUserRole } from '@client/views/SysAdmin/Config/UserRoles/utils'
import { getLanguage } from '@client/i18n/selectors'

const ToolTipContainer = styled.span`
  text-align: center;
`
const DEFAULT_FIELD_AGENT_LIST_SIZE = 25
const { useState } = React
interface SortMap {
  totalDeclarations: SORT_ORDER
  rawName: SORT_ORDER
  startMonth: SORT_ORDER
  avgCompleteDeclarationTime: SORT_ORDER
  role: SORT_ORDER
  officeName: SORT_ORDER
  inProgressDeclarations: SORT_ORDER
  rejectedDeclarations: SORT_ORDER
}
const INITIAL_SORT_MAP = {
  totalDeclarations: SORT_ORDER.DESCENDING,
  rawName: SORT_ORDER.ASCENDING,
  startMonth: SORT_ORDER.ASCENDING,
  avgCompleteDeclarationTime: SORT_ORDER.ASCENDING,
  role: SORT_ORDER.ASCENDING,
  officeName: SORT_ORDER.ASCENDING,
  inProgressDeclarations: SORT_ORDER.ASCENDING,
  rejectedDeclarations: SORT_ORDER.ASCENDING
}

interface ISearchParams {
  locationId: string
  timeStart: string
  timeEnd: string
  event: string
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

enum STATUS_OPTIONS {
  ACTIVE = 'active',
  DEACTIVE = 'deactivated',
  PENDING = 'pending'
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

function getNameWithAvatar(userName: string, avatar?: Avatar) {
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

function FieldAgentListComponent(props: IProps) {
  const {
    intl,
    location: { search },
    offlineOffices
  } = props
  const {
    event = Event.Birth,
    locationId,
    timeStart,
    timeEnd
  } = parse(search) as unknown as ISearchParams
  const [status, setStatus] = useState<STATUS_OPTIONS>(STATUS_OPTIONS.ACTIVE)
  const [sortOrder, setSortOrder] = React.useState<SortMap>(INITIAL_SORT_MAP)
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(1)
  const [columnToBeSort, setColumnToBeSort] =
    useState<keyof SortMap>('totalDeclarations')
  const recordCount = DEFAULT_FIELD_AGENT_LIST_SIZE * currentPageNumber
  const dateStart = new Date(timeStart)
  const dateEnd = new Date(timeEnd)
  const offices = generateLocations(offlineOffices, intl)
  const language = useSelector(getLanguage)

  const isOfficeSelected = offices.some((office) => office.id === locationId)

  const queryVariables = isOfficeSelected
    ? {
        timeStart: timeStart,
        timeEnd: timeEnd,
        primaryOfficeId: locationId,
        status: status.toString(),
        event: event.toUpperCase(),
        count: recordCount,
        sort: 'asc',
        skip: 0
      }
    : {
        timeStart: timeStart,
        timeEnd: timeEnd,
        locationId: locationId,
        status: status.toString(),
        event: event.toUpperCase(),
        count: recordCount,
        sort: 'asc',
        skip: 0
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
        sortFunction: () => toggleSort('rawName'),
        icon:
          columnToBeSort === 'rawName' ? <SortArrow active={true} /> : <></>,
        isSorted: columnToBeSort === 'rawName' ? true : false
      },
      {
        key: 'role',
        label: intl.formatMessage(messages.roleColumnHeader),
        width: 12,
        isSortable: true,
        sortFunction: () => toggleSort('role'),
        icon: columnToBeSort === 'role' ? <SortArrow active={true} /> : <></>,
        isSorted: columnToBeSort === 'role' ? true : false
      },
      {
        key: 'officeName',
        label: intl.formatMessage(messages.officeColumnHeader),
        width: 20,
        isSortable: true,
        sortFunction: () => toggleSort('officeName'),
        icon:
          columnToBeSort === 'officeName' ? <SortArrow active={true} /> : <></>,
        isSorted: columnToBeSort === 'officeName' ? true : false
      },
      {
        key: 'startMonth',
        label: intl.formatMessage(messages.startMonthColumnHeader),
        width: 12,
        isSortable: true,
        sortFunction: () => toggleSort('startMonth'),
        icon:
          columnToBeSort === 'startMonth' ? <SortArrow active={true} /> : <></>,
        isSorted: columnToBeSort === 'startMonth' ? true : false
      },
      {
        key: 'totalDeclarations',
        label: intl.formatMessage(messages.totalSentColumnHeader, {
          linebreak: <br key={'totalDeclarations-break'} />
        }),
        width: 12,
        isSortable: true,
        sortFunction: () => toggleSort('totalDeclarations'),
        icon:
          columnToBeSort === 'totalDeclarations' ? (
            <SortArrow active={true} />
          ) : (
            <></>
          ),
        isSorted: columnToBeSort === 'totalDeclarations' ? true : false
      },
      {
        key: 'inProgressDeclarations',
        label: intl.formatMessage(messages.totalInProgressColumnHeader, {
          linebreak: <br key={'inProgressDeclarations-break'} />
        }),
        width: 12,
        isSortable: true,
        sortFunction: () => toggleSort('inProgressDeclarations'),
        icon:
          columnToBeSort === 'inProgressDeclarations' ? (
            <SortArrow active={true} />
          ) : (
            <></>
          ),
        isSorted: columnToBeSort === 'inProgressDeclarations' ? true : false
      },
      {
        key: 'avgCompleteDeclarationTime',
        label: intl.formatMessage(messages.avgCompletionTimeColumnHeader, {
          linebreak: <br key={'avgCompleteDeclarationTime-break'} />
        }),
        width: 15,
        isSortable: true,
        sortFunction: () => toggleSort('avgCompleteDeclarationTime'),
        icon:
          columnToBeSort === 'avgCompleteDeclarationTime' ? (
            <SortArrow active={true} />
          ) : (
            <></>
          ),
        isSorted: columnToBeSort === 'avgCompleteDeclarationTime' ? true : false
      },
      {
        key: 'rejectedDeclarations',
        label: intl.formatMessage(messages.totalRejectedColumnHeader),
        width: 10,
        alignment: ColumnContentAlignment.RIGHT,
        isSortable: true,
        sortFunction: () => toggleSort('rejectedDeclarations'),
        icon:
          columnToBeSort === 'rejectedDeclarations' ? (
            <SortArrow active={true} />
          ) : (
            <></>
          ),
        isSorted: columnToBeSort === 'rejectedDeclarations' ? true : false
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
            role: '',
            officeName: '',
            startMonth: '',
            totalDeclarations: '',
            inProgressDeclarations: '',
            avgCompleteDeclarationTime: '',
            rejectedDeclarations: ''
          }
        }
        const office =
          row.primaryOfficeId &&
          offices.find(({ id }) => id === row.primaryOfficeId)

        return {
          name: getNameWithAvatar(row.fullName || '', row.avatar),
          rawName: row.fullName || '',
          role: (row.role && getUserRole(language, row.role)) || '',
          officeName: (office && office.displayLabel) || '',
          startMonth: row.creationDate,
          totalDeclarations: String(row.totalNumberOfDeclarationStarted),
          inProgressDeclarations: `${
            row.totalNumberOfInProgressAppStarted
          } (${getPercentage(
            row.totalNumberOfDeclarationStarted,
            row.totalNumberOfInProgressAppStarted
          )}%)`,
          avgCompleteDeclarationTime: row.averageTimeForDeclaredDeclarations,
          rejectedDeclarations: `${
            row.totalNumberOfRejectedDeclarations
          } (${getPercentage(
            row.totalNumberOfDeclarationStarted,
            row.totalNumberOfRejectedDeclarations
          )}%)`
        }
      })
    return (
      (content &&
        orderBy(
          content,
          columnToBeSort === 'rawName'
            ? [(content) => content[columnToBeSort]!.toString().toLowerCase()]
            : [columnToBeSort],
          [sortOrder[columnToBeSort]]
        ).map((row, idx) => {
          return {
            ...row,
            startMonth:
              (row.startMonth && format(Number(row.startMonth), 'MMMM yyyy')) ||
              '',
            avgCompleteDeclarationTime:
              row.avgCompleteDeclarationTime === 0
                ? '-'
                : getAverageCompletionTimeComponent(
                    Number(row.avgCompleteDeclarationTime),
                    idx
                  )
          }
        })) ||
      []
    )
  }
  const skip = (currentPageNumber - 1) * 1
  queryVariables.skip = skip
  // TODO: Do we really need FIELD_AGENT_AUDIT_LOCATIONS?
  return (
    <SysAdminContentWrapper
      id="field-agent-list"
      isCertificatesConfigPage={true}
    >
      <Content
        title={intl.formatMessage(messages.declarationsStartedFieldAgents)}
        size={ContentSize.LARGE}
        filterContent={
          <>
            <LocationPicker
              selectedLocationId={locationId}
              disabled={true}
              onChangeLocation={(newLocationId) => {
                props.goToFieldAgentList(timeStart, timeEnd, newLocationId)
              }}
              requiredJurisdictionTypes={
                window.config.FIELD_AGENT_AUDIT_LOCATIONS
              }
            />
            <PerformanceSelect
              onChange={(option) => {
                props.goToFieldAgentList(
                  timeStart,
                  timeEnd,
                  locationId,
                  option.value
                )
              }}
              id="event-select"
              withLightTheme={true}
              defaultWidth={110}
              value={event}
              options={[
                {
                  label: intl.formatMessage(messages.eventOptionForBirths),
                  value: Event.Birth
                },
                {
                  label: intl.formatMessage(messages.eventOptionForDeaths),
                  value: Event.Death
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
            <PerformanceSelect
              onChange={(option) => {
                setStatus(
                  Object.values(STATUS_OPTIONS).find(
                    (val) => val === option.value
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
          </>
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
                  <Table
                    id={'field-agent-error-list'}
                    noResultText={intl.formatMessage(
                      messages.fieldAgentsNoResult
                    )}
                    isLoading={true}
                    columns={getColumns(data && data.searchFieldAgents)}
                    content={getContent(data && data.searchFieldAgents)}
                  />
                  <GenericErrorToast />
                </>
              )
            } else {
              const totalData =
                data &&
                data.searchFieldAgents &&
                data.searchFieldAgents.totalItems
              return (
                <TableDiv>
                  <Table
                    id={'field-agent-list'}
                    noResultText={intl.formatMessage(
                      messages.fieldAgentsNoResult
                    )}
                    isLoading={loading}
                    fixedWidth={1200}
                    disableScrollOnOverflow={true}
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
                    isFullPage
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

export const FieldAgentList = connect(
  (state: IStoreState) => {
    const offlineOffices = getOfflineData(state).offices
    return {
      offlineOffices
    }
  },
  { goToPerformanceHome, goToFieldAgentList }
)(injectIntl(FieldAgentListComponent))
