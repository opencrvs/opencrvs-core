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
import { ISearchLocation } from '@client/../../components/lib'
import { DateRangePicker } from '@client/components/DateRangePicker'
import { GenericErrorToast } from '@client/components/GenericErrorToast'
import { LocationPicker } from '@client/components/LocationPicker'
import { Query } from '@client/components/Query'
import { SegmentedControl } from '@client/components/SegmentedControl'
import { constantsMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/performance'
import {
  goToFieldAgentList,
  goToPerformanceHome,
  goToRegistrationsList,
  goToTeamUserList,
  goToUserProfile
} from '@client/navigation'
import { ILocation } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import {
  GetRegistrationsListByFilterQuery,
  QueryGetRegistrationsListByFilterArgs
} from '@client/utils/gateway'
import { generateLocations } from '@client/utils/locationUtils'
import {
  IPerformanceSelectOption,
  PerformanceSelect
} from '@client/views/SysAdmin/Performance/PerformanceSelect'
import { FETCH_REGISTRATIONS } from '@client/views/SysAdmin/Performance/queries'
import { SORT_ORDER } from '@client/views/SysAdmin/Performance/reports/completenessRates/CompletenessDataTable'
import {
  getAdditionalLocations,
  NATIONAL_ADMINISTRATIVE_LEVEL
} from '@client/views/SysAdmin/Performance/utils'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { SortArrow } from '@opencrvs/components/lib/icons'
import { Pagination } from '@opencrvs/components/lib/Pagination'
import { Table } from '@opencrvs/components/lib/Table'
import { parse } from 'query-string'
import React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import styled from 'styled-components'

const ToolTipContainer = styled.span`
  text-align: center;
`
const DEFAULT_PAGE_SIZE = 10

interface SortMap {
  month: SORT_ORDER
  location: SORT_ORDER
  total: SORT_ORDER
  late: SORT_ORDER
  delayed: SORT_ORDER
  healthFacility: SORT_ORDER
  home: SORT_ORDER
  late_num: SORT_ORDER
  delayed_num: SORT_ORDER
  healthFacility_num: SORT_ORDER
  home_num: SORT_ORDER
  time: SORT_ORDER
}
const INITIAL_SORT_MAP = {
  month: SORT_ORDER.ASCENDING,
  location: SORT_ORDER.ASCENDING,
  total: SORT_ORDER.ASCENDING,
  late: SORT_ORDER.ASCENDING,
  delayed: SORT_ORDER.ASCENDING,
  healthFacility: SORT_ORDER.ASCENDING,
  home: SORT_ORDER.ASCENDING,
  late_num: SORT_ORDER.ASCENDING,
  delayed_num: SORT_ORDER.ASCENDING,
  healthFacility_num: SORT_ORDER.ASCENDING,
  home_num: SORT_ORDER.ASCENDING,
  time: SORT_ORDER.DESCENDING
}

interface ISearchParams {
  locationId: string
  timeStart: string
  timeEnd: string
  event: string
  filterBy: string
  currentPageNumber: string
}

interface IConnectProps {
  offlineOffices: { [key: string]: ILocation }
  offlineLocations: { [key: string]: ILocation }
}

interface IDispatchProps {
  goToPerformanceHome: typeof goToPerformanceHome
  goToFieldAgentList: typeof goToFieldAgentList
  goToRegistrationsList: typeof goToRegistrationsList
  goToTeamUserList: typeof goToTeamUserList
  goToUserProfile: typeof goToUserProfile
}
type IProps = RouteComponentProps &
  WrappedComponentProps &
  IConnectProps &
  IDispatchProps

enum EVENT_OPTIONS {
  BIRTH = 'BIRTH',
  DEATH = 'DEATH'
}

enum FILTER_BY_OPTIONS {
  BY_TIME = 'by_time',
  BY_LOCATION = 'by_location',
  BY_REGISTRAR = 'by_registrar'
}

const TableDiv = styled.div`
  overflow: auto;
`

function RegistrationListComponent(props: IProps) {
  const {
    intl,
    location: { search }
  } = props
  const {
    locationId,
    timeStart,
    timeEnd,
    event = EVENT_OPTIONS.BIRTH,
    filterBy = FILTER_BY_OPTIONS.BY_TIME,
    currentPageNumber = '1'
  } = parse(search) as unknown as ISearchParams
  const isOfficeSelected = isLocationOffice(locationId)
  const [sortOrder, setSortOrder] = React.useState<SortMap>(INITIAL_SORT_MAP)
  const [columnToBeSort, setColumnToBeSort] =
    React.useState<keyof SortMap>('time')

  const currentPage = parseInt(currentPageNumber)
  const recordCount = DEFAULT_PAGE_SIZE * currentPage
  const dateStart = new Date(timeStart)
  const dateEnd = new Date(timeEnd)

  const queryVariables: QueryGetRegistrationsListByFilterArgs = {
    timeStart: timeStart,
    timeEnd: timeEnd,
    event: event,
    skip: recordCount,
    size: DEFAULT_PAGE_SIZE,
    filterBy
  }

  if (locationId !== NATIONAL_ADMINISTRATIVE_LEVEL) {
    queryVariables.locationId = locationId
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
        sortFunction: () => toggleSort('total'),
        icon:
          columnToBeSort === 'total' ? (
            <SortArrow active={true} />
          ) : (
            <SortArrow active={false} />
          ),
        isSorted: columnToBeSort === 'total' ? true : false
      },
      {
        key: 'delayed',
        label: intl.formatMessage(
          messages.performanceDelayedRegistrationsLabel
        ),
        width: 20,
        isSortable: true,
        sortFunction: () => toggleSort('delayed_num'),
        icon:
          columnToBeSort === 'delayed_num' ? (
            <SortArrow active={true} />
          ) : (
            <SortArrow active={false} />
          ),
        isSorted: columnToBeSort === 'delayed_num' ? true : false
      }
    ]

    if (event === EVENT_OPTIONS.BIRTH) {
      commonColumns.push({
        key: 'late',
        label: intl.formatMessage(messages.performanceLateRegistrationsLabel),
        width: 20,
        isSortable: true,
        sortFunction: () => toggleSort('late_num'),
        icon:
          columnToBeSort === 'late_num' ? (
            <SortArrow active={true} />
          ) : (
            <SortArrow active={false} />
          ),
        isSorted: columnToBeSort === 'late_num' ? true : false
      })
    }

    if (filterBy === FILTER_BY_OPTIONS.BY_TIME)
      return [
        {
          key: 'month',
          label: intl.formatMessage(messages.month),
          width: 20,
          isSortable: true,
          sortFunction: () => toggleSort('time'),
          icon:
            columnToBeSort === 'time' ? (
              <SortArrow active={true} />
            ) : (
              <SortArrow active={false} />
            ),
          isSorted: columnToBeSort === 'time' ? true : false
        },
        ...commonColumns,
        {
          key: 'home',
          label:
            event === EVENT_OPTIONS.DEATH
              ? intl.formatMessage(messages.performanceHomeDeath)
              : intl.formatMessage(messages.performanceHomeBirth),
          width: 20,
          isSortable: true,
          sortFunction: () => toggleSort('home_num'),
          icon:
            columnToBeSort === 'home_num' ? (
              <SortArrow active={true} />
            ) : (
              <SortArrow active={false} />
            ),
          isSorted: columnToBeSort === 'home_num' ? true : false
        },
        {
          key: 'healthFacility',
          label:
            event === EVENT_OPTIONS.DEATH
              ? intl.formatMessage(messages.performanceHealthFacilityDeath)
              : intl.formatMessage(messages.performanceHealthFacilityBirth),
          width: 20,
          isSortable: true,
          sortFunction: () => toggleSort('healthFacility_num'),
          icon:
            columnToBeSort === 'healthFacility_num' ? (
              <SortArrow active={true} />
            ) : (
              <SortArrow active={false} />
            ),
          isSorted: columnToBeSort === 'healthFacility_num' ? true : false
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
            columnToBeSort === 'location' ? (
              <SortArrow active={true} />
            ) : (
              <SortArrow active={false} />
            ),
          isSorted: columnToBeSort === 'location' ? true : false
        },
        ...commonColumns,
        {
          key: 'home',
          label:
            event === EVENT_OPTIONS.DEATH
              ? intl.formatMessage(messages.performanceHomeDeath)
              : intl.formatMessage(messages.performanceHomeBirth),
          width: 20,
          isSortable: true,
          sortFunction: () => toggleSort('home_num'),
          icon:
            columnToBeSort === 'home_num' ? (
              <SortArrow active={true} />
            ) : (
              <SortArrow active={false} />
            ),
          isSorted: columnToBeSort === 'home_num' ? true : false
        },
        {
          key: 'healthFacility',
          label:
            event === EVENT_OPTIONS.DEATH
              ? intl.formatMessage(messages.performanceHealthFacilityDeath)
              : intl.formatMessage(messages.performanceHealthFacilityBirth),
          width: 20,
          isSortable: true,
          sortFunction: () => toggleSort('healthFacility_num'),
          icon:
            columnToBeSort === 'healthFacility_num' ? (
              <SortArrow active={true} />
            ) : (
              <SortArrow active={false} />
            ),
          isSorted: columnToBeSort === 'healthFacility_num' ? true : false
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
          key: 'systemRole',
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

  function getContent(
    content?: GetRegistrationsListByFilterQuery['getRegistrationsListByFilter']
  ) {
    return [] /* @todo */
  }

  const options: (IPerformanceSelectOption & { disabled?: boolean })[] = [
    {
      label: intl.formatMessage(messages.overTime),
      value: FILTER_BY_OPTIONS.BY_TIME
    },
    {
      label: intl.formatMessage(messages.byLocation),
      value: FILTER_BY_OPTIONS.BY_LOCATION,
      disabled: isOfficeSelected
    },
    {
      label: intl.formatMessage(messages.byRegistrar),
      value: FILTER_BY_OPTIONS.BY_REGISTRAR
    }
  ]

  const selectLocation = (
    locationId: string,
    searchableLocations: ISearchLocation[]
  ) => {
    return searchableLocations.find(
      ({ id }) => id === locationId
    ) as ISearchLocation
  }

  function isLocationOffice(locationId: string) {
    return Boolean(props.offlineOffices[locationId])
  }

  const skip = (currentPage - 1) * DEFAULT_PAGE_SIZE
  queryVariables.skip = skip
  return (
    <SysAdminContentWrapper
      id="registrations-list"
      isCertificatesConfigPage={true}
    >
      <Content
        title={intl.formatMessage(messages.performanceTotalRegitrationsHeader)}
        showTitleOnMobile={true}
        size={ContentSize.LARGE}
        filterContent={
          <>
            <LocationPicker
              additionalLocations={getAdditionalLocations(intl)}
              selectedLocationId={locationId || NATIONAL_ADMINISTRATIVE_LEVEL}
              onChangeLocation={(newLocationId) => {
                const newLocation = selectLocation(
                  newLocationId,
                  generateLocations(
                    {
                      ...props.offlineOffices,
                      ...props.offlineLocations
                    },
                    props.intl
                  ).concat(getAdditionalLocations(intl))
                )

                let filterCriteria = filterBy
                const isSelectedLocationOffice = isLocationOffice(
                  newLocation.id
                )
                if (isSelectedLocationOffice) {
                  filterCriteria = FILTER_BY_OPTIONS.BY_TIME
                }

                props.goToRegistrationsList(
                  timeStart,
                  timeEnd,
                  newLocation.id,
                  event,
                  filterCriteria,
                  1
                )
              }}
            />
            <PerformanceSelect
              onChange={(option) => {
                const selectedEvent =
                  Object.values(EVENT_OPTIONS).find(
                    (val) => val === option.value
                  ) || EVENT_OPTIONS.BIRTH
                props.goToRegistrationsList(
                  timeStart,
                  timeEnd,
                  locationId,
                  selectedEvent,
                  filterBy,
                  1
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
              onDatesChange={({ startDate, endDate }) => {
                props.goToRegistrationsList(
                  startDate.toISOString(),
                  endDate.toISOString(),
                  locationId,
                  event,
                  filterBy,
                  1
                )
              }}
            />

            <SegmentedControl
              id="base-select"
              value={filterBy}
              options={options}
              onChange={(option) =>
                props.goToRegistrationsList(
                  timeStart,
                  timeEnd,
                  locationId,
                  event,
                  option?.value,
                  1
                )
              }
            />
          </>
        }
      >
        <Query<GetRegistrationsListByFilterQuery>
          query={FETCH_REGISTRATIONS}
          variables={queryVariables}
          fetchPolicy={'no-cache'}
        >
          {({ data, loading, error }) => {
            if (error) {
              return (
                <>
                  <Table
                    id={'registrations-error-list'}
                    noResultText={intl.formatMessage(
                      constantsMessages.noResults
                    )}
                    isLoading={true}
                    columns={getColumns()}
                    content={getContent(data?.getRegistrationsListByFilter)}
                  />
                  <GenericErrorToast />
                </>
              )
            } else {
              const registrationCount =
                data?.getRegistrationsListByFilter?.total ?? 0

              return (
                <>
                  <TableDiv>
                    <Table
                      id={'registrations-list-result'}
                      noResultText={intl.formatMessage(
                        constantsMessages.noResults
                      )}
                      fixedWidth={1200}
                      isLoading={loading}
                      disableScrollOnOverflow={true}
                      columns={getColumns()}
                      content={getContent(data?.getRegistrationsListByFilter)}
                      totalItems={registrationCount}
                      currentPage={currentPage}
                      pageSize={recordCount}
                      highlightRowOnMouseOver
                      noPagination={true}
                    />
                  </TableDiv>
                  {registrationCount > DEFAULT_PAGE_SIZE && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.ceil(
                        registrationCount / DEFAULT_PAGE_SIZE
                      )}
                      onPageChange={(cp: number) => {
                        props.goToRegistrationsList(
                          timeStart,
                          timeEnd,
                          locationId,
                          event,
                          filterBy,
                          cp
                        )
                      }}
                    />
                  )}
                </>
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
    const offlineLocations = getOfflineData(state).locations
    return {
      offlineOffices,
      offlineLocations
    }
  },
  {
    goToPerformanceHome,
    goToFieldAgentList,
    goToRegistrationsList,
    goToUserProfile,
    goToTeamUserList
  }
)(injectIntl(RegistrationListComponent))
