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
import { goToFieldAgentList, goToPerformanceHome } from '@client/navigation'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import { generateLocations } from '@client/utils/locationUtils'
import { PerformanceSelect } from '@client/views/SysAdmin/Performance/PerformanceSelect'
import { FETCH_FIELD_AGENTS_WITH_PERFORMANCE_DATA } from '@client/views/SysAdmin/Performance/queries'
import { SORT_ORDER } from '@client/views/SysAdmin/Performance/reports/registrationRates/WithinTargetDaysTable'
import { FilterContainer } from '@client/views/SysAdmin/Performance/utils'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { ArrowDownBlue } from '@opencrvs/components/lib/icons'
import { AvatarSmall } from '@client/components/Avatar'
import {
  ColumnContentAlignment,
  TableView
} from '@opencrvs/components/lib/interface'
import { GQLSearchFieldAgentResult } from '@opencrvs/gateway/src/graphql/schema'
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
import {
  Content,
  ContentSize
} from '@opencrvs/components/lib/interface/Content'
import { IAvatar } from '@client/utils/userUtils'
import { PaginationModified } from '@opencrvs/components/lib/interface/PaginationModified'
import {
  PaginationWrapper,
  MobileWrapper,
  DesktopWrapper
} from '@opencrvs/components/lib/styleForPagination'

const ToolTipContainer = styled.span`
  text-align: center;
`
const DEFAULT_FIELD_AGENT_LIST_SIZE = 25
const { useState } = React
interface SortMap {
  totalDeclarations: SORT_ORDER
  name: SORT_ORDER
  startMonth: SORT_ORDER
  avgCompleteDeclarationTime: SORT_ORDER
  type: SORT_ORDER
  officeName: SORT_ORDER
  inProgressDeclarations: SORT_ORDER
  rejectedDeclarations: SORT_ORDER
}
const INITIAL_SORT_MAP = {
  totalDeclarations: SORT_ORDER.DESCENDING,
  name: SORT_ORDER.ASCENDING,
  startMonth: SORT_ORDER.ASCENDING,
  avgCompleteDeclarationTime: SORT_ORDER.ASCENDING,
  type: SORT_ORDER.ASCENDING,
  officeName: SORT_ORDER.ASCENDING,
  inProgressDeclarations: SORT_ORDER.ASCENDING,
  rejectedDeclarations: SORT_ORDER.ASCENDING
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

enum STATUS_OPTIONS {
  ACTIVE = 'active',
  DEACTIVE = 'deactive',
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

function FieldAgentListComponent(props: IProps) {
  const {
    intl,
    location: { search },
    goToPerformanceHome,
    offlineOffices
  } = props
  const { locationId, timeStart, timeEnd } = parse(
    search
  ) as unknown as ISearchParams
  const [status, setStatus] = useState<STATUS_OPTIONS>(STATUS_OPTIONS.ACTIVE)
  const [event, setEvent] = useState<EVENT_OPTIONS>(EVENT_OPTIONS.BIRTH)
  const [sortOrder, setSortOrder] = React.useState<SortMap>(INITIAL_SORT_MAP)
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(1)
  const [columnToBeSort, setColumnToBeSort] =
    useState<keyof SortMap>('totalDeclarations')
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
        skip: 0
      }
    : {
        timeStart: timeStart,
        timeEnd: timeEnd,
        locationId: locationId,
        status: status.toString(),
        event: event || undefined,
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
        key: 'totalDeclarations',
        label: intl.formatMessage(messages.totalSentColumnHeader, {
          linebreak: <br key={'totalDeclarations-break'} />
        }),
        width: 12,
        isSortable: true,
        sortFunction: () => toggleSort('totalDeclarations'),
        icon:
          columnToBeSort === 'totalDeclarations' ? <ArrowDownBlue /> : <></>,
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
            <ArrowDownBlue />
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
            <ArrowDownBlue />
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
          columnToBeSort === 'rejectedDeclarations' ? <ArrowDownBlue /> : <></>,
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
            type: '',
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
          type: row.type,
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
          columnToBeSort === 'name'
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
  return (
    <SysAdminContentWrapper
      id="field-agent-list"
      isCertificatesConfigPage={true}
    >
      <Content
        title={intl.formatMessage(messages.declarationsStartedFieldAgents)}
        size={ContentSize.LARGE}
        filterContent={
          <FilterContainer>
            <LocationPicker
              selectedLocationId={locationId}
              onChangeLocation={(newLocationId) => {
                props.goToFieldAgentList(
                  newLocationId,
                  timeStart,
                  timeEnd,
                  event
                )
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
              defaultWidth={100}
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
                  locationId as string,
                  startDate.toISOString(),
                  endDate.toISOString()
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
                  <TableView
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
              const totalData =
                data &&
                data.searchFieldAgents &&
                data.searchFieldAgents.totalItems
              return (
                <TableDiv>
                  <TableView
                    id={'field-agent-list'}
                    noResultText={intl.formatMessage(
                      messages.fieldAgentsNoResult
                    )}
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
                  {totalData > DEFAULT_FIELD_AGENT_LIST_SIZE && (
                    <PaginationWrapper>
                      <DesktopWrapper>
                        <PaginationModified
                          size="small"
                          initialPage={currentPageNumber}
                          totalPages={Math.ceil(
                            totalData / DEFAULT_FIELD_AGENT_LIST_SIZE
                          )}
                          onPageChange={(currentPage: number) => {
                            setCurrentPageNumber(currentPage)
                          }}
                        />
                      </DesktopWrapper>
                      <MobileWrapper>
                        <PaginationModified
                          size="large"
                          initialPage={currentPageNumber}
                          totalPages={Math.ceil(
                            totalData / DEFAULT_FIELD_AGENT_LIST_SIZE
                          )}
                          onPageChange={(currentPage: number) => {
                            setCurrentPageNumber(currentPage)
                          }}
                        />
                      </MobileWrapper>
                    </PaginationWrapper>
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
