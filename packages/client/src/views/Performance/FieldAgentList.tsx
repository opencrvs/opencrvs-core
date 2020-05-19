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
import { Query } from '@client/components/Query'
import { messages } from '@client/i18n/messages/views/performance'
import { goToOperationalReport, goToFieldAgentList } from '@client/navigation'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import styled from '@client/styledComponents'
import { generateLocations } from '@client/utils/locationUtils'
import { OPERATIONAL_REPORT_SECTION } from '@client/views/Performance/OperationalReport'
import {
  PerformanceContentWrapper,
  PerformancePageVariant
} from '@client/views/Performance/PerformanceContentWrapper'
import { FilterContainer } from '@client/views/Performance/utils'
import { MapPin, ArrowDownBlue } from '@opencrvs/components/lib/icons'
import {
  ISearchLocation,
  ListTable,
  ColumnContentAlignment
} from '@opencrvs/components/lib/interface'
import querystring from 'query-string'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { FETCH_FIELD_AGENTS_WITH_PERFORMANCE_DATA } from '@client/views/Performance/queries'

import { constantsMessages } from '@client/i18n/messages'
import { GQLSearchFieldAgentResult } from '@opencrvs/gateway/src/graphql/schema'
import { SORT_ORDER } from '@client/views/Performance/reports/registrationRates/Within45DaysTable'
import { orderBy } from 'lodash'
import moment from 'moment'

const DEFAULT_FIELD_AGENT_LIST_SIZE = 25

interface SortMap {
  totalApplications: SORT_ORDER
}
const INITIAL_SORT_MAP = {
  totalApplications: SORT_ORDER.DESCENDING
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

const PickerButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: 2px;
  &:focus {
    outline: none;
  }
  &:hover {
    background: ${({ theme }) => theme.colors.smallButtonFocus};
  }
  white-space: nowrap;
  padding: 0;
  height: 38px;
  background: transparent;
  & > div {
    padding: 0 8px;
    height: 100%;
  }
`

const ContentWrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  ${({ theme }) => theme.fonts.smallButtonStyleNoCapitalize};
  color: ${({ theme }) => theme.colors.tertiary};

  & > svg {
    margin-left: 8px;
  }
`
interface LocationPickerProps {
  handler?: () => void
  children: React.ReactNode
}

function LocationPicker(props: LocationPickerProps) {
  return (
    <PickerButton onClick={props.handler}>
      <ContentWrapper>
        <span>{props.children}</span>
        <MapPin />
      </ContentWrapper>
    </PickerButton>
  )
}

function getPercentage(total: number | undefined, current: number | undefined) {
  if (!total || total <= 0 || !current || current <= 0) {
    return 0
  }
  return Math.round((current / total) * 100)
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

  const selectedSearchedLocation = locations.find(
    ({ id }) => id === locationId
  ) as ISearchLocation
  const dateStart = new Date(timeStart)
  const dateEnd = new Date(timeEnd)
  const [sortOrder, setSortOrder] = React.useState<SortMap>(INITIAL_SORT_MAP)

  function getContent(data: GQLSearchFieldAgentResult | undefined) {
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
          avgCompleteApplicationTime: String(
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
  function toggleSort(key: keyof SortMap) {
    const invertedOrder =
      sortOrder[key] === SORT_ORDER.DESCENDING
        ? SORT_ORDER.ASCENDING
        : SORT_ORDER.DESCENDING
    setSortOrder({ ...sortOrder, [key]: invertedOrder })
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
          <LocationPicker>
            {selectedSearchedLocation.displayLabel}
          </LocationPicker>
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
        </FilterContainer>
      }
    >
      <Query
        query={FETCH_FIELD_AGENTS_WITH_PERFORMANCE_DATA}
        variables={{
          timeStart: timeStart,
          timeEnd: timeEnd,
          locationId: locationId
        }}
        fetchPolicy={'no-cache'}
      >
        {({ data, loading, error }) => {
          if (error) {
            return (
              <>
                <ListTable
                  noResultText={''}
                  isLoading={true}
                  columns={[]}
                  content={[]}
                />
                <ToastNotification type={NOTIFICATION_TYPE.ERROR} />
              </>
            )
          } else {
            return (
              <ListTable
                noResultText={intl.formatMessage(constantsMessages.noResults)}
                isLoading={loading}
                columns={[
                  {
                    key: 'name',
                    label: intl.formatMessage(messages.fieldAgentColumnHeader, {
                      totalAgents:
                        (data &&
                          data.searchFieldAgents &&
                          data.searchFieldAgents.totalItems) ||
                        0
                    }),
                    width: 17
                  },
                  {
                    key: 'type',
                    label: intl.formatMessage(messages.typeColumnHeader),
                    width: 10
                  },
                  {
                    key: 'officeName',
                    label: intl.formatMessage(messages.officeColumnHeader),
                    width: 18
                  },
                  {
                    key: 'startMonth',
                    label: intl.formatMessage(messages.startMonthColumnHeader),
                    width: 11
                  },
                  {
                    key: 'totalApplications',
                    label: intl.formatMessage(messages.totalSentColumnHeader, {
                      linebreak: <br key={'totalApplications-break'} />
                    }),
                    width: 11,
                    isSortable: true,
                    sortFunction: () => toggleSort('totalApplications'),
                    icon: <ArrowDownBlue />
                  },
                  {
                    key: 'inProgressApplications',
                    label: intl.formatMessage(
                      messages.totalInProgressColumnHeader,
                      {
                        linebreak: <br key={'inProgressApplications-break'} />
                      }
                    ),
                    width: 10
                  },
                  {
                    key: 'avgCompleteApplicationTime',
                    label: intl.formatMessage(
                      messages.avgCompletionTimeColumnHeader,
                      {
                        linebreak: (
                          <br key={'avgCompleteApplicationTime-break'} />
                        )
                      }
                    ),
                    width: 15
                  },
                  {
                    key: 'rejectedApplications',
                    label: intl.formatMessage(
                      messages.totalRejectedColumnHeader
                    ),
                    width: 8,
                    alignment: ColumnContentAlignment.LEFT
                  }
                ]}
                content={getContent(data && data.searchFieldAgents)}
                pageSize={DEFAULT_FIELD_AGENT_LIST_SIZE}
                hideBoxShadow={true}
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
