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
import * as React from 'react'
import { WrappedComponentProps, injectIntl } from 'react-intl'
import { RouteComponentProps } from 'react-router'
import {
  PerformanceContentWrapper,
  PerformancePageVariant
} from '@client/views/Performance/PerformanceContentWrapper'
import { messages } from '@client/i18n/messages/views/performance'
import querystring from 'query-string'
import { goToOperationalReport, goToWorkflowStatus } from '@client/navigation'
import { connect } from 'react-redux'
import { StatusMapping } from '@client/views/Performance/OperationalReport'
import {
  ListTable,
  ColumnContentAlignment
} from '@opencrvs/components/lib/interface'
import { IColumn } from '@opencrvs/components/lib/interface/GridTable/types'
import {
  GQLQuery,
  GQLEventProgressSet,
  GQLHumanName
} from '@opencrvs/gateway/src/graphql/schema'
import { createNamesMap } from '@client/utils/data-formatting'
import { LANG_EN } from '@client/utils/constants'
import {
  userMessages,
  dynamicConstantsMessages,
  formMessages,
  constantsMessages
} from '@client/i18n/messages'
import moment from 'moment'
import { FETCH_EVENTS_WITH_PROGRESS } from './queries'
import { Query } from '@client/components/Query'
import { getLocationFromPartOfLocationId } from './reports/utils'
import { IStoreState } from '@client/store'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData, ILocation } from '@client/offline/reducer'
import { FilterContainer } from '@client/views/Performance/utils'
import { IStatusMapping } from './reports/operational/StatusWiseApplicationCountView'
import {
  ToastNotification,
  NOTIFICATION_TYPE
} from '@client/components/interface/ToastNotification'
import { EVENT_OPTIONS } from '@client/views/Performance/FieldAgentList'
import { PerformanceSelect } from '@client/views/Performance/PerformanceSelect'
import { generateLocations } from '@client/utils/locationUtils'
import { LocationPicker } from '@client/views/Performance/RegistrationRates'
import { Event } from '@client/forms'

interface ConnectProps {
  offlineResources: IOfflineData
}

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
    ConnectProps,
    DispatchProps,
    WrappedComponentProps {}
function WorkflowStatusComponent(props: WorkflowStatusProps) {
  const { intl } = props
  const { locationId, status, event } = (querystring.parse(
    props.location.search
  ) as unknown) as ISearchParams
  const { sectionId, timeStart, timeEnd } = props.location.state
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
        width: 12
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

    return data.getEventsWithProgress.results.map(
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
            id:
              eventProgress.registration &&
              eventProgress.registration.trackingId,
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
  }
  const searchableLocations = generateLocations(
    props.offlineResources.locations
  )
  const selectedLocation = searchableLocations.find(
    ({ id }) => id === locationId
  )
  const childLocations = (getLocationFromPartOfLocationId(
    locationId,
    props.offlineResources
  ) as ILocation).id

  return (
    <PerformanceContentWrapper
      id="workflow-status"
      type={PerformancePageVariant.SUBPAGE}
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
          <LocationPicker>
            {selectedLocation && selectedLocation.displayLabel}
          </LocationPicker>
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
      hideTopBar
    >
      <Query
        query={FETCH_EVENTS_WITH_PROGRESS}
        variables={{
          locationIds: [childLocations],
          skip: 0,
          count: 10,
          status: (status && [status]) || undefined,
          type: (event && [`${event.toLowerCase()}-application`]) || undefined
        }}
      >
        {({ data, loading, error }) => {
          let total
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
                content={getContent(data)}
                columns={getColumns(total)}
                isLoading={loading || Boolean(error)}
                noResultText={intl.formatMessage(constantsMessages.noResults)}
                hideBoxShadow
              />
              {error && <ToastNotification type={NOTIFICATION_TYPE.ERROR} />}
            </>
          )
        }}
      </Query>
    </PerformanceContentWrapper>
  )
}

export const WorkflowStatus = connect(
  (store: IStoreState) => {
    return {
      offlineResources: getOfflineData(store)
    }
  },
  { goToOperationalReport, goToWorkflowStatus }
)(injectIntl(WorkflowStatusComponent))
