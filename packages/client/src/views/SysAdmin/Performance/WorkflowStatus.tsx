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
import {
  NOTIFICATION_TYPE,
  ToastNotification
} from '@client/components/interface/ToastNotification'
import { LocationPicker } from '@client/components/LocationPicker'
import { Query } from '@client/components/Query'
import { Event } from '@client/forms'
import {
  constantsMessages,
  dynamicConstantsMessages,
  formMessages,
  userMessages
} from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/performance'
import { goToOperationalReport, goToWorkflowStatus } from '@client/navigation'
import { LANG_EN } from '@client/utils/constants'
import { createNamesMap } from '@client/utils/data-formatting'
import { EVENT_OPTIONS } from '@client/views/Performance/FieldAgentList'
import {
  OPERATIONAL_REPORT_SECTION,
  StatusMapping
} from '@client/views/SysAdmin/Performance/OperationalReport'
import {
  SysAdminContentWrapper,
  SysAdminPageVariant
} from '@client/views/SysAdmin/SysAdminContentWrapper'
import { PerformanceSelect } from '@client/views/SysAdmin/Performance/PerformanceSelect'
import { SORT_ORDER } from '@client/views/SysAdmin/Performance/reports/registrationRates/Within45DaysTable'
import { FilterContainer } from '@client/views/SysAdmin/Performance/utils'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { ArrowDownBlue } from '@opencrvs/components/lib/icons'
import {
  ColumnContentAlignment,
  ListTable
} from '@opencrvs/components/lib/interface'
import { IColumn } from '@opencrvs/components/lib/interface/GridTable/types'
import {
  GQLEventProgressSet,
  GQLHumanName,
  GQLQuery
} from '@opencrvs/gateway/src/graphql/schema'
import { orderBy } from 'lodash'
import moment from 'moment'
import querystring from 'query-string'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { FETCH_EVENTS_WITH_PROGRESS } from './queries'
import { IStatusMapping } from './reports/operational/StatusWiseApplicationCountView'

const { useState } = React

interface SortMap {
  applicationStartedOn: SORT_ORDER
}

const INITIAL_SORT_MAP = {
  applicationStartedOn: SORT_ORDER.DESCENDING
}

const DEFAULT_APPLICATION_STATUS_PAGE_SIZE = 25

const statusOptions = [
  {
    label: constantsMessages.allStatuses,
    value: ''
  }
].concat(
  Object.entries(StatusMapping).map(([status, { labelDescriptor: label }]) => ({
    label,
    value: status
  }))
)

const PrimaryContactLabelMapping = {
  MOTHER: formMessages.contactDetailsMother,
  FATHER: formMessages.contactDetailsFather,
  APPLICANT: formMessages.contactDetailsApplicant
}

type PrimaryContact = keyof typeof PrimaryContactLabelMapping

function isPrimaryContact(contact: string): contact is PrimaryContact {
  return Object.keys(PrimaryContactLabelMapping).includes(contact)
}

interface DispatchProps {
  goToOperationalReport: typeof goToOperationalReport
  goToWorkflowStatus: typeof goToWorkflowStatus
}
interface ISearchParams {
  locationId: string
  status?: keyof IStatusMapping
  event?: Event
}

interface WorkflowStatusProps
  extends RouteComponentProps,
    DispatchProps,
    WrappedComponentProps {}
function WorkflowStatusComponent(props: WorkflowStatusProps) {
  const { intl } = props
  const { locationId, status, event } = (querystring.parse(
    props.location.search
  ) as unknown) as ISearchParams
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(1)
  const [sortOrder, setSortOrder] = React.useState<SortMap>(INITIAL_SORT_MAP)
  const recordCount = DEFAULT_APPLICATION_STATUS_PAGE_SIZE * currentPageNumber
  let sectionId = OPERATIONAL_REPORT_SECTION.OPERATIONAL
  let timeStart = moment()
    .subtract(1, 'years')
    .toDate()
  let timeEnd = moment().toDate()
  if (props.location.state) {
    sectionId = props.location.state.sectionId
    timeStart = props.location.state.timeStart
    timeEnd = props.location.state.timeEnd
  }

  function toggleSort(key: keyof SortMap) {
    const invertedOrder =
      sortOrder[key] === SORT_ORDER.DESCENDING
        ? SORT_ORDER.ASCENDING
        : SORT_ORDER.DESCENDING
    setSortOrder({ ...sortOrder, [key]: invertedOrder })
  }

  function getColumns(totalItems = 0): IColumn[] {
    return [
      {
        label: intl.formatMessage(constantsMessages.applications, {
          totalItems
        }),
        key: 'id',
        width: 14
      },
      {
        label: intl.formatMessage(constantsMessages.status),
        key: 'status',
        width: 12
      },
      {
        label: intl.formatMessage(constantsMessages.eventType),
        key: 'eventType',
        width: 8
      },
      {
        label: intl.formatMessage(constantsMessages.eventDate),
        key: 'dateOfEvent',
        width: 12
      },
      {
        label: intl.formatMessage(constantsMessages.nameDefaultLocale),
        key: 'nameIntl',
        width: 12
      },
      {
        label: intl.formatMessage(constantsMessages.nameRegionalLocale),
        key: 'nameLocal',
        width: 12
      },
      {
        label: intl.formatMessage(formMessages.applicantName),
        key: 'applicant',
        width: 14
      },
      {
        label: intl.formatMessage(constantsMessages.applicationStarted),
        key: 'applicationStartedOn',
        width: 12,
        isSortable: true,
        sortFunction: () => toggleSort('applicationStartedOn'),
        icon: <ArrowDownBlue />
      },
      {
        label: intl.formatMessage(constantsMessages.applicationStartedBy),
        key: 'applicationStartedBy',
        width: 10
      },
      {
        label: intl.formatMessage(constantsMessages.timeInProgress),
        key: 'timeLoggedInProgress',
        width: 12
      },
      {
        label: intl.formatMessage(constantsMessages.timeReadyForReview),
        key: 'timeLoggedDeclared',
        width: 12
      },
      {
        label: intl.formatMessage(constantsMessages.timeRequireUpdates),
        key: 'timeLoggedRejected',
        width: 12
      },
      {
        label: intl.formatMessage(constantsMessages.timeWatingApproval),
        key: 'timeLoggedValidated',
        width: 12
      },
      {
        label: intl.formatMessage(
          constantsMessages.timeWaitingExternalValidation
        ),
        key: 'timeLoggedWaitingValidation',
        width: 12
      },
      {
        label: intl.formatMessage(constantsMessages.timeReadyToPrint),
        key: 'timeLoggedRegistered',
        width: 12,
        alignment: ColumnContentAlignment.LEFT
      }
    ]
  }

  function getContent(data: GQLQuery) {
    if (
      !data ||
      !data.getEventsWithProgress ||
      !data.getEventsWithProgress.results
    ) {
      return []
    }

    function formateDateWithRelationalText(date: Date) {
      const dateMoment = moment(date)
      return (
        <>
          {dateMoment.format('MMMM DD, YYYY')}
          <br />
          {`(${dateMoment.fromNow()})`}
        </>
      )
    }

    function conditioanllyFormatContactRelationship(relationshipCode: string) {
      if (isPrimaryContact(relationshipCode)) {
        return intl.formatMessage(PrimaryContactLabelMapping[relationshipCode])
      } else {
        return relationshipCode
      }
    }

    const content = data.getEventsWithProgress.results.map(
      (eventProgress: GQLEventProgressSet | null, index: number) => {
        if (eventProgress !== null) {
          const nameIntl = createNamesMap(
            eventProgress && (eventProgress.name as GQLHumanName[])
          )[LANG_EN] as string
          const localLang = window.config.LANGUAGES.split(',').find(
            (lang: string) => lang !== LANG_EN
          )
          const nameLocal =
            (localLang &&
              (createNamesMap(
                eventProgress && (eventProgress.name as GQLHumanName[])
              )[localLang] as string)) ||
            nameIntl
          let starterPractitionerName = ''
          let starterPractitionerRole = ''

          if (eventProgress.startedBy != null) {
            const user = eventProgress.startedBy
            starterPractitionerName =
              (createNamesMap(user && (user.name as GQLHumanName[]))[
                intl.locale
              ] as string) ||
              (createNamesMap(user && (user.name as GQLHumanName[]))[
                LANG_EN
              ] as string)
            starterPractitionerRole = intl.formatMessage(
              userMessages[user.role as string]
            )
          }

          const event =
            (eventProgress.type &&
              intl.formatMessage(
                dynamicConstantsMessages[eventProgress.type.toLowerCase()]
              )) ||
            ''
          const status =
            (eventProgress.registration &&
              eventProgress.registration.status &&
              intl.formatMessage(
                StatusMapping[eventProgress.registration.status].labelDescriptor
              )) ||
            ''
          let timeLoggedInProgress = '-'
          let timeLoggedDeclared = '-'
          let timeLoggedRejected = '-'
          let timeLoggedValidated = '-'
          let timeLoggedWaitingValidation = '-'
          let timeLoggedRegistered = '-'

          if (eventProgress.progressReport != null) {
            const {
              timeInProgress,
              timeInReadyForReview,
              timeInRequiresUpdates,
              timeInWaitingForApproval,
              timeInWaitingForBRIS,
              timeInReadyToPrint
            } = eventProgress.progressReport

            timeLoggedInProgress =
              (timeInProgress !== null &&
                moment()
                  .startOf('day')
                  .seconds(timeInProgress as number)
                  .format('HH:mm:ss')) ||
              '-'
            timeLoggedDeclared =
              (timeInReadyForReview !== null &&
                moment()
                  .startOf('day')
                  .seconds(timeInReadyForReview as number)
                  .format('HH:mm:ss')) ||
              '-'
            timeLoggedRejected =
              (timeInRequiresUpdates !== null &&
                moment()
                  .startOf('day')
                  .seconds(timeInRequiresUpdates as number)
                  .format('HH:mm:ss')) ||
              '-'
            timeLoggedValidated =
              (timeInWaitingForApproval !== null &&
                moment()
                  .startOf('day')
                  .seconds(timeInWaitingForApproval as number)
                  .format('HH:mm:ss')) ||
              '-'
            timeLoggedWaitingValidation =
              (timeInWaitingForBRIS !== null &&
                moment()
                  .startOf('day')
                  .seconds(timeInWaitingForBRIS as number)
                  .format('HH:mm:ss')) ||
              '-'
            timeLoggedRegistered =
              (timeInReadyToPrint !== null &&
                moment()
                  .startOf('day')
                  .seconds(timeInReadyToPrint as number)
                  .format('HH:mm:ss')) ||
              '-'
          }
          return {
            id: (
              <LinkButton>
                {eventProgress.registration &&
                  eventProgress.registration.trackingId}
              </LinkButton>
            ),
            status,
            eventType: event,
            dateOfEvent: formateDateWithRelationalText(
              eventProgress.dateOfEvent
            ),
            nameIntl,
            nameLocal,
            applicant:
              (eventProgress.registration &&
                ((eventProgress.registration.contactRelationship &&
                  conditioanllyFormatContactRelationship(
                    eventProgress.registration.contactRelationship
                  ) + ' ') ||
                  '') + (eventProgress.registration.contactNumber || '')) ||
              '',
            applicationStartedOn:
              (eventProgress.registration &&
                formateDateWithRelationalText(
                  eventProgress.registration.dateOfApplication
                )) ||
              '',
            applicationStartedOnTime:
              eventProgress.registration &&
              new Date(eventProgress.registration.dateOfApplication)
                .getTime()
                .toString(),
            applicationStartedBy: (
              <>
                {starterPractitionerName}
                <br />
                {`(${starterPractitionerRole})`}
              </>
            ),
            timeLoggedInProgress,
            timeLoggedDeclared,
            timeLoggedRejected,
            timeLoggedValidated,
            timeLoggedWaitingValidation,
            timeLoggedRegistered
          }
        }
        return {}
      }
    )

    return orderBy(
      content,
      ['applicationStartedOnTime'],
      [sortOrder.applicationStartedOn]
    )
  }

  return (
    <SysAdminContentWrapper
      id="workflow-status"
      type={SysAdminPageVariant.SUBPAGE}
      headerTitle={intl.formatMessage(messages.workflowStatusHeader)}
      backActionHandler={() =>
        props.goToOperationalReport(
          locationId,
          sectionId,
          new Date(timeStart),
          new Date(timeEnd)
        )
      }
      toolbarComponent={
        <FilterContainer>
          <LocationPicker
            selectedLocationId={locationId}
            onChangeLocation={(newLocationId: string) => {
              props.goToWorkflowStatus(
                sectionId,
                newLocationId,
                new Date(timeStart),
                new Date(timeEnd),
                status,
                event
              )
            }}
            requiredJurisdictionTypes={
              window.config.APPLICATION_AUDIT_LOCATIONS
            }
          />
          <PerformanceSelect
            onChange={({ value }) => {
              props.goToWorkflowStatus(
                sectionId,
                locationId,
                new Date(timeStart),
                new Date(timeEnd),
                status,
                value as Event
              )
            }}
            id="event-select"
            withLightTheme={true}
            defaultWidth={175}
            value={((event as unknown) as EVENT_OPTIONS) || EVENT_OPTIONS.ALL}
            options={[
              {
                label: intl.formatMessage(constantsMessages.allEvents),
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
            onChange={({ value }) => {
              props.goToWorkflowStatus(
                sectionId,
                locationId,
                new Date(timeStart),
                new Date(timeEnd),
                value,
                event
              )
            }}
            id="status-select"
            withLightTheme={true}
            defaultWidth={175}
            value={(status as string) || ''}
            options={statusOptions.map(option => ({
              ...option,
              label: intl.formatMessage(option.label)
            }))}
          />
        </FilterContainer>
      }
    >
      <Query
        query={FETCH_EVENTS_WITH_PROGRESS}
        variables={{
          parentLocationId: locationId,
          skip: 0,
          count: recordCount,
          status: (status && [status]) || undefined,
          type: (event && [`${event.toLowerCase()}-application`]) || undefined
        }}
      >
        {({ data, loading, error }) => {
          let total = 0
          if (
            data &&
            data.getEventsWithProgress &&
            data.getEventsWithProgress.totalItems
          ) {
            total = data.getEventsWithProgress.totalItems
          }

          return (
            <>
              <ListTable
                id="application-status-list"
                content={getContent(data)}
                columns={getColumns(total)}
                isLoading={loading || Boolean(error)}
                noResultText={intl.formatMessage(constantsMessages.noResults)}
                hideBoxShadow
                currentPage={currentPageNumber}
                pageSize={recordCount}
                totalItems={total}
                highlightRowOnMouseOver
                onPageChange={(currentPage: number) => {
                  setCurrentPageNumber(currentPage)
                }}
                loadMoreText={intl.formatMessage(
                  messages.showMoreUsersLinkLabel,
                  {
                    pageSize: DEFAULT_APPLICATION_STATUS_PAGE_SIZE
                  }
                )}
              />
              {error && <ToastNotification type={NOTIFICATION_TYPE.ERROR} />}
            </>
          )
        }}
      </Query>
    </SysAdminContentWrapper>
  )
}

export const WorkflowStatus = connect(
  null,
  { goToOperationalReport, goToWorkflowStatus }
)(injectIntl(WorkflowStatusComponent))
