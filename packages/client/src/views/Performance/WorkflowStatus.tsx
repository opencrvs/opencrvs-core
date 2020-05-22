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
import { goToOperationalReport } from '@client/navigation'
import { connect } from 'react-redux'
import { OPERATIONAL_REPORT_SECTION, StatusMapping } from './OperationalReport'
import { ListTable } from '@opencrvs/components/lib/interface'
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

interface ConnectProps {
  offlineResources: IOfflineData
}

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
}
interface ISearchParams {
  locationId: string
  sectionId: OPERATIONAL_REPORT_SECTION
  timeStart: string
  timeEnd: string
}

interface WorkflowStatusProps
  extends RouteComponentProps,
    ConnectProps,
    DispatchProps,
    WrappedComponentProps {}
function WorkflowStatusComponent(props: WorkflowStatusProps) {
  const { intl } = props
  const { locationId, sectionId, timeStart, timeEnd } = (querystring.parse(
    props.location.search
  ) as unknown) as ISearchParams

  function getColumns(totalItems = 0): IColumn[] {
    return [
      {
        label: intl.formatMessage(constantsMessages.applications, {
          totalItems
        }),
        key: 'id',
        width: 6
      },
      {
        label: intl.formatMessage(constantsMessages.status),
        key: 'status',
        width: 9
      },
      {
        label: intl.formatMessage(constantsMessages.eventType),
        key: 'eventType',
        width: 3
      },
      {
        label: intl.formatMessage(constantsMessages.eventDate),
        key: 'dateOfEvent',
        width: 8
      },
      {
        label: intl.formatMessage(constantsMessages.nameDefaultLocale),
        key: 'nameIntl',
        width: 8
      },
      {
        label: intl.formatMessage(constantsMessages.nameRegionalLocale),
        key: 'nameLocal',
        width: 8
      },
      {
        label: intl.formatMessage(formMessages.applicantName),
        key: 'applicant',
        width: 6
      },
      {
        label: intl.formatMessage(constantsMessages.applicationStarted),
        key: 'applicationStartedOn',
        width: 8
      },
      {
        label: intl.formatMessage(constantsMessages.applicationStartedBy),
        key: 'applicationStartedBy',
        width: 8
      },
      {
        label: intl.formatMessage(constantsMessages.timeInProgress),
        key: 'timeLoggedInProgress',
        width: 6
      },
      {
        label: intl.formatMessage(constantsMessages.timeReadyForReview),
        key: 'timeLoggedDeclared',
        width: 6
      },
      {
        label: intl.formatMessage(constantsMessages.timeRequireUpdates),
        key: 'timeLoggedRejected',
        width: 6
      },
      {
        label: intl.formatMessage(constantsMessages.timeWatingApproval),
        key: 'timeLoggedValidated',
        width: 6
      },
      {
        label: intl.formatMessage(
          constantsMessages.timeWaitingExternalValidation
        ),
        key: 'timeLoggedWaitingValidation',
        width: 6
      },
      {
        label: intl.formatMessage(constantsMessages.timeReadyToPrint),
        key: 'timeLoggedRegistered',
        width: 6
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
      hideTopBar
    >
      <Query
        query={FETCH_EVENTS_WITH_PROGRESS}
        variables={{ locationIds: [childLocations], skip: 0, count: 10 }}
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
            <ListTable
              content={getContent(data)}
              columns={getColumns(total)}
              isLoading={loading}
              noResultText={intl.formatMessage(constantsMessages.noResults)}
              hideBoxShadow
            />
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
  { goToOperationalReport }
)(injectIntl(WorkflowStatusComponent))
