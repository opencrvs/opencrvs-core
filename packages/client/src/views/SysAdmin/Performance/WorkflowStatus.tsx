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
import { formatTimeDuration } from '@client/DateUtils'
import { Event } from '@client/forms'
import {
  constantsMessages,
  dynamicConstantsMessages,
  formMessages,
  userMessages
} from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/performance'
import { goToPerformanceHome, goToWorkflowStatus } from '@client/navigation'
import { LANG_EN } from '@client/utils/constants'
import { createNamesMap } from '@client/utils/data-formatting'
import { EVENT_OPTIONS } from '@client/views/Performance/FieldAgentList'
import { PerformanceSelect } from '@client/views/SysAdmin/Performance/PerformanceSelect'
import { SORT_ORDER } from '@client/views/SysAdmin/Performance/reports/completenessRates/CompletenessDataTable'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { ArrowDownBlue } from '@opencrvs/components/lib/icons'
import { ColumnContentAlignment } from '@opencrvs/components/lib/interface'
import { IColumn } from '@opencrvs/components/lib/interface/GridTable/types'
import {
  GQLEventProgressSet,
  GQLHumanName,
  GQLQuery
} from '@opencrvs/gateway/src/graphql/schema'
import { orderBy } from 'lodash'
import { parse } from 'query-string'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'
import { checkExternalValidationStatus } from '@client/views/SysAdmin/Team/utils'
import { FETCH_EVENTS_WITH_PROGRESS } from './queries'
import { IStatusMapping } from './reports/operational/StatusWiseDeclarationCountView'
import format, { formattedDuration } from '@client/utils/date-formatting'
import subYears from 'date-fns/subYears'
import differenceInSeconds from 'date-fns/differenceInSeconds'
import { messages as statusMessages } from '@client/i18n/messages/views/registrarHome'
import { colors } from '@opencrvs/components/lib/colors'
import {
  Content,
  ContentSize
} from '@opencrvs/components/lib/interface/Content'
import { Spinner } from '@opencrvs/components/lib/interface/Spinner'
import { TableView } from '@opencrvs/components/lib/interface/TableView'

const ToolTipContainer = styled.span`
  text-align: center;
`
const DoubleLineValueWrapper = styled.div`
  margin: 0px 0px;
`

const { useState } = React

interface SortMap {
  id: SORT_ORDER
  status: SORT_ORDER
  eventType: SORT_ORDER
  dateOfEvent: SORT_ORDER
  informant: SORT_ORDER
  declarationStartedOn: SORT_ORDER
  nameIntl: SORT_ORDER
  declarationStartedBy: SORT_ORDER
  timeLoggedInProgress: SORT_ORDER
  timeLoggedDeclared: SORT_ORDER
  timeLoggedRejected: SORT_ORDER
  timeLoggedValidated: SORT_ORDER
  timeLoggedWaitingValidation: SORT_ORDER
  timeLoggedRegistered: SORT_ORDER
}

const INITIAL_SORT_MAP = {
  id: SORT_ORDER.ASCENDING,
  status: SORT_ORDER.ASCENDING,
  eventType: SORT_ORDER.ASCENDING,
  dateOfEvent: SORT_ORDER.ASCENDING,
  informant: SORT_ORDER.ASCENDING,
  declarationStartedOn: SORT_ORDER.DESCENDING,
  nameIntl: SORT_ORDER.ASCENDING,
  declarationStartedBy: SORT_ORDER.ASCENDING,
  timeLoggedInProgress: SORT_ORDER.ASCENDING,
  timeLoggedDeclared: SORT_ORDER.ASCENDING,
  timeLoggedRejected: SORT_ORDER.ASCENDING,
  timeLoggedValidated: SORT_ORDER.ASCENDING,
  timeLoggedWaitingValidation: SORT_ORDER.ASCENDING,
  timeLoggedRegistered: SORT_ORDER.ASCENDING
}

const DEFAULT_DECLARATION_STATUS_PAGE_SIZE = 25

export const StatusMapping: IStatusMapping = {
  IN_PROGRESS: {
    labelDescriptor: statusMessages.inProgress,
    color: colors.purple
  },
  DECLARED: {
    labelDescriptor: statusMessages.readyForReview,
    color: colors.orange
  },
  REJECTED: {
    labelDescriptor: statusMessages.sentForUpdates,
    color: colors.red
  },
  VALIDATED: {
    labelDescriptor: statusMessages.sentForApprovals,
    color: colors.grey300
  },
  WAITING_VALIDATION: {
    labelDescriptor: statusMessages.sentForExternalValidation,
    color: colors.grey500
  },
  REGISTERED: {
    labelDescriptor: statusMessages.readyToPrint,
    color: colors.green
  },
  CERTIFIED: {
    labelDescriptor: statusMessages.certified,
    color: colors.blue
  },
  REQUESTED_CORRECTION: {
    labelDescriptor: statusMessages.requestedCorrection,
    color: colors.blue
  },
  ARCHIVED: {
    labelDescriptor: statusMessages.archived,
    color: colors.blue
  }
}

const statusOptions = [
  {
    label: constantsMessages.allStatuses,
    value: ''
  }
].concat(
  Object.entries(StatusMapping)
    .filter((item) => checkExternalValidationStatus(item[0]))
    .map(([status, { labelDescriptor: label }]) => ({
      label,
      value: status
    }))
)

const PrimaryContactLabelMapping = {
  MOTHER: formMessages.contactDetailsMother,
  FATHER: formMessages.contactDetailsFather,
  INFORMANT: formMessages.contactDetailsInformant
}

type PrimaryContact = keyof typeof PrimaryContactLabelMapping

function isPrimaryContact(contact: string): contact is PrimaryContact {
  return Object.keys(PrimaryContactLabelMapping).includes(contact)
}

interface DispatchProps {
  goToPerformanceHome: typeof goToPerformanceHome
  goToWorkflowStatus: typeof goToWorkflowStatus
}
interface ISearchParams {
  locationId: string
  status?: keyof IStatusMapping
  event?: Event
}
export interface IHistoryStateProps {
  timeStart: Date | string
  timeEnd: Date | string
}
interface WorkflowStatusProps
  extends RouteComponentProps<{}, {}, IHistoryStateProps>,
    DispatchProps,
    WrappedComponentProps {}
function WorkflowStatusComponent(props: WorkflowStatusProps) {
  const { intl } = props
  const { locationId, status, event } = parse(
    props.location.search
  ) as unknown as ISearchParams
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(1)
  const [sortOrder, setSortOrder] = React.useState<SortMap>(INITIAL_SORT_MAP)
  const [columnToBeSort, setColumnToBeSort] = useState<keyof SortMap>(
    'declarationStartedOn'
  )
  const recordCount = DEFAULT_DECLARATION_STATUS_PAGE_SIZE * currentPageNumber

  let timeStart: string | Date = subYears(new Date(Date.now()), 1)
  let timeEnd: string | Date = new Date(Date.now())
  const historyState = props.history.location.state

  if (props.location.state) {
    timeStart = historyState.timeStart
    timeEnd = historyState.timeEnd
  }

  function toggleSort(key: keyof SortMap) {
    const invertedOrder =
      sortOrder[key] === SORT_ORDER.DESCENDING
        ? SORT_ORDER.ASCENDING
        : SORT_ORDER.DESCENDING
    setSortOrder({ ...sortOrder, [key]: invertedOrder })
    setColumnToBeSort(key)
  }

  function getColumns(): IColumn[] {
    const keys = [
      {
        label: intl.formatMessage(constantsMessages.trackingId),
        key: 'id',
        width: 12,
        isSortable: true,
        sortFunction: () => toggleSort('id'),
        icon: columnToBeSort === 'id' ? <ArrowDownBlue /> : <></>,
        isSorted: columnToBeSort === 'id' ? true : false
      },
      {
        label: intl.formatMessage(constantsMessages.status),
        key: 'status',
        width: 12,
        isSortable: true,
        sortFunction: () => toggleSort('status'),
        icon: columnToBeSort === 'status' ? <ArrowDownBlue /> : <></>,
        isSorted: columnToBeSort === 'status' ? true : false
      },
      {
        label: intl.formatMessage(constantsMessages.eventType),
        key: 'eventType',
        width: 8,
        isSortable: true,
        sortFunction: () => toggleSort('eventType'),
        icon: columnToBeSort === 'eventType' ? <ArrowDownBlue /> : <></>,
        isSorted: columnToBeSort === 'eventType' ? true : false
      },
      {
        label: intl.formatMessage(constantsMessages.name),
        key: 'nameIntl',
        width: 12,
        isSortable: true,
        sortFunction: () => toggleSort('nameIntl'),
        icon: columnToBeSort === 'nameIntl' ? <ArrowDownBlue /> : <></>,
        isSorted: columnToBeSort === 'nameIntl' ? true : false
      },
      {
        label: intl.formatMessage(formMessages.informantName),
        key: 'informant',
        width: 12,
        isSortable: true,
        sortFunction: () => toggleSort('informant'),
        icon: columnToBeSort === 'informant' ? <ArrowDownBlue /> : <></>,
        isSorted: columnToBeSort === 'informant' ? true : false
      },
      {
        label: intl.formatMessage(constantsMessages.declarationStarted),
        key: 'declarationStartedOn',
        width: 10,
        isSortable: true,
        sortFunction: () => toggleSort('declarationStartedOn'),
        icon:
          columnToBeSort === 'declarationStartedOn' ? <ArrowDownBlue /> : <></>,
        isSorted: columnToBeSort === 'declarationStartedOn' ? true : false
      },
      {
        label: intl.formatMessage(constantsMessages.declarationStartedBy),
        key: 'declarationStartedBy',
        width: 10,
        isSortable: true,
        sortFunction: () => toggleSort('declarationStartedBy'),
        icon:
          columnToBeSort === 'declarationStartedBy' ? <ArrowDownBlue /> : <></>,
        isSorted: columnToBeSort === 'declarationStartedBy' ? true : false
      },
      {
        label: intl.formatMessage(constantsMessages.eventDate),
        key: 'dateOfEvent',
        width: 12,
        isSortable: true,
        sortFunction: () => toggleSort('dateOfEvent'),
        icon: columnToBeSort === 'dateOfEvent' ? <ArrowDownBlue /> : <></>,
        isSorted: columnToBeSort === 'dateOfEvent' ? true : false
      },
      {
        label: intl.formatMessage(constantsMessages.timeInProgress),
        key: 'timeLoggedInProgress',
        width: 12,
        isSortable: true,
        sortFunction: () => toggleSort('timeLoggedInProgress'),
        icon:
          columnToBeSort === 'timeLoggedInProgress' ? <ArrowDownBlue /> : <></>,
        isSorted: columnToBeSort === 'timeLoggedInProgress' ? true : false
      },
      {
        label: intl.formatMessage(constantsMessages.timeReadyForReview),
        key: 'timeLoggedDeclared',
        width: 12,
        isSortable: true,
        sortFunction: () => toggleSort('timeLoggedDeclared'),
        icon:
          columnToBeSort === 'timeLoggedDeclared' ? <ArrowDownBlue /> : <></>,
        isSorted: columnToBeSort === 'timeLoggedDeclared' ? true : false
      },
      {
        label: intl.formatMessage(constantsMessages.timeRequireUpdates),
        key: 'timeLoggedRejected',
        width: 12,
        isSortable: true,
        sortFunction: () => toggleSort('timeLoggedRejected'),
        icon:
          columnToBeSort === 'timeLoggedRejected' ? <ArrowDownBlue /> : <></>,
        isSorted: columnToBeSort === 'timeLoggedRejected' ? true : false
      },
      {
        label: intl.formatMessage(constantsMessages.timeWatingApproval),
        key: 'timeLoggedValidated',
        width: 12,
        isSortable: true,
        sortFunction: () => toggleSort('timeLoggedValidated'),
        icon:
          columnToBeSort === 'timeLoggedValidated' ? <ArrowDownBlue /> : <></>,
        isSorted: columnToBeSort === 'timeLoggedValidated' ? true : false
      },
      {
        label: intl.formatMessage(
          constantsMessages.timeWaitingExternalValidation
        ),
        key: 'timeLoggedWaitingValidation',
        width: 12,
        isSortable: true,
        sortFunction: () => toggleSort('timeLoggedWaitingValidation'),
        icon:
          columnToBeSort === 'timeLoggedWaitingValidation' ? (
            <ArrowDownBlue />
          ) : (
            <></>
          ),
        isSorted:
          columnToBeSort === 'timeLoggedWaitingValidation' ? true : false
      },
      {
        label: intl.formatMessage(constantsMessages.timeReadyToPrint),
        key: 'timeLoggedRegistered',
        width: 12,
        alignment: ColumnContentAlignment.RIGHT,
        isSortable: true,
        sortFunction: () => toggleSort('timeLoggedRegistered'),
        icon:
          columnToBeSort === 'timeLoggedRegistered' ? <ArrowDownBlue /> : <></>,
        isSorted: columnToBeSort === 'timeLoggedRegistered' ? true : false
      }
    ] as IColumn[]
    return keys.filter((item) => {
      return !(
        !window.config.EXTERNAL_VALIDATION_WORKQUEUE &&
        item.key === 'timeLoggedWaitingValidation'
      )
    })
  }

  function getContent(data: GQLQuery) {
    if (
      !data ||
      !data.getEventsWithProgress ||
      !data.getEventsWithProgress.results
    ) {
      return []
    }

    function formateDateWithRelationalText(date: Date | null) {
      date = date
        ? Number.isNaN(Number(date))
          ? new Date(date)
          : new Date(Number(date))
        : null
      return (
        (date && (
          <DoubleLineValueWrapper>
            {format(date, 'MMMM dd, yyyy')}
            <br />
            {`(${formattedDuration(date)})`}
          </DoubleLineValueWrapper>
        )) || <></>
      )
    }

    function conditioanllyFormatContactRelationship(relationshipCode: string) {
      if (isPrimaryContact(relationshipCode)) {
        return intl.formatMessage(PrimaryContactLabelMapping[relationshipCode])
      } else {
        return relationshipCode
      }
    }

    function getTimeDifferenceFromLastModification(
      eventProgress: GQLEventProgressSet
    ) {
      const lastUpdateDate =
        eventProgress.registration &&
        (eventProgress.registration.modifiedAt ||
          eventProgress.registration.createdAt)
      if (!lastUpdateDate) {
        return 0
      }
      return differenceInSeconds(Date.now(), Number(lastUpdateDate))
    }

    function getTimeDurationElements(
      timeDuration: number,
      tooltipId: string,
      rowIndex: number
    ) {
      if (timeDuration === 0) return <>-</>

      const timeStructure = formatTimeDuration(timeDuration)
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
          <ReactTooltip id={`${tooltipId}_${rowIndex}`}>
            <ToolTipContainer>{tooltip}</ToolTipContainer>
          </ReactTooltip>
          <span data-tip data-for={`${tooltipId}_${rowIndex}`}>
            {label}
          </span>
        </>
      )
    }

    function getTimeDuration(
      timeDuration: number,
      checkStatus: string,
      eventProgress: GQLEventProgressSet
    ) {
      const timeStructure =
        eventProgress.registration &&
        eventProgress.registration.status === checkStatus
          ? getTimeDifferenceFromLastModification(eventProgress)
          : timeDuration
      return timeStructure === null ? 0 : timeStructure
    }

    const content = data.getEventsWithProgress.results.map(
      (eventProgress: GQLEventProgressSet | null) => {
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
              (user &&
                user.name &&
                ((createNamesMap(user.name as GQLHumanName[])[
                  intl.locale
                ] as string) ||
                  (createNamesMap(user.name as GQLHumanName[])[
                    LANG_EN
                  ] as string))) ||
              eventProgress.startedByFacility ||
              ''
            starterPractitionerRole =
              (user.role &&
                intl.formatMessage(userMessages[user.role as string])) ||
              ''
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

          let timeLoggedInProgress = 0
          let timeLoggedDeclared = 0
          let timeLoggedRejected = 0
          let timeLoggedValidated = 0
          let timeLoggedWaitingValidation = 0
          let timeLoggedRegistered = 0

          if (eventProgress.progressReport != null) {
            const {
              timeInProgress,
              timeInReadyForReview,
              timeInRequiresUpdates,
              timeInWaitingForApproval,
              timeInWaitingForBRIS,
              timeInReadyToPrint
            } = eventProgress.progressReport

            timeLoggedInProgress = getTimeDuration(
              timeInProgress as number,
              'IN_PROGRESS',
              eventProgress
            )

            timeLoggedDeclared = getTimeDuration(
              timeInReadyForReview as number,
              'DECLARED',
              eventProgress
            )

            timeLoggedRejected = getTimeDuration(
              timeInRequiresUpdates as number,
              'REJECTED',
              eventProgress
            )

            timeLoggedValidated = getTimeDuration(
              timeInWaitingForApproval as number,
              'VALIDATED',
              eventProgress
            )

            timeLoggedWaitingValidation = getTimeDuration(
              timeInWaitingForBRIS as number,
              'WAITING_VALIDATION',
              eventProgress
            )

            timeLoggedRegistered = getTimeDuration(
              timeInReadyToPrint as number,
              'REGISTERED',
              eventProgress
            )
          }
          return {
            id:
              eventProgress.registration &&
              eventProgress.registration.trackingId,
            status,
            eventType: event,
            dateOfEvent: eventProgress.dateOfEvent,
            nameIntl,
            nameLocal,
            informant:
              (eventProgress.registration &&
                ((eventProgress.registration.contactRelationship &&
                  conditioanllyFormatContactRelationship(
                    eventProgress.registration.contactRelationship
                  ) + ' ') ||
                  '') + (eventProgress.registration.contactNumber || '')) ||
              '',
            declarationStartedOn: formateDateWithRelationalText(
              eventProgress.startedAt
            ),
            declarationStartedOnTime:
              eventProgress.registration &&
              new Date(eventProgress.registration.dateOfDeclaration)
                .getTime()
                .toString(),
            declarationStartedBy:
              starterPractitionerRole !== ''
                ? starterPractitionerName +
                  '\n' +
                  `(${starterPractitionerRole})`
                : starterPractitionerName,
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
      columnToBeSort === 'nameIntl'
        ? [(content) => content[columnToBeSort]!.toString().toLowerCase()]
        : columnToBeSort === 'declarationStartedOn'
        ? ['declarationStartedOnTime']
        : [columnToBeSort],
      [sortOrder[columnToBeSort]]
    ).map((row, idx) => {
      return {
        ...row,
        id: <LinkButton>{row.id}</LinkButton>,
        declarationStartedBy: (
          <DoubleLineValueWrapper>
            {row.declarationStartedBy}
          </DoubleLineValueWrapper>
        ),
        dateOfEvent: formateDateWithRelationalText(row.dateOfEvent),
        timeLoggedInProgress: getTimeDurationElements(
          Number(row.timeLoggedInProgress),
          'in_prog_tltp',
          idx
        ),
        timeLoggedDeclared: getTimeDurationElements(
          Number(row.timeLoggedDeclared),
          'dclrd_tltp',
          idx
        ),
        timeLoggedRejected: getTimeDurationElements(
          Number(row.timeLoggedRejected),
          'rjctd_tltp',
          idx
        ),
        timeLoggedValidated: getTimeDurationElements(
          Number(row.timeLoggedValidated),
          'vldtd_tltp',
          idx
        ),
        timeLoggedWaitingValidation: getTimeDurationElements(
          Number(row.timeLoggedWaitingValidation),
          'wtng_vldtn_tltp',
          idx
        ),
        timeLoggedRegistered: getTimeDurationElements(
          Number(row.timeLoggedRegistered),
          'rgstrd_tltp_tltp',
          idx
        )
      }
    })
  }

  return (
    <SysAdminContentWrapper id="workflow-status" isCertificatesConfigPage>
      <Content
        title={intl.formatMessage(messages.registrationByStatus)}
        size={ContentSize.LARGE}
        filterContent={
          <>
            <LocationPicker
              selectedLocationId={locationId}
              disabled={true}
              onChangeLocation={(newLocationId: string) => {
                props.goToWorkflowStatus(
                  newLocationId,
                  new Date(timeStart),
                  new Date(timeEnd),
                  status,
                  event
                )
              }}
              requiredJurisdictionTypes={
                window.config.DECLARATION_AUDIT_LOCATIONS
              }
            />
            <PerformanceSelect
              onChange={({ value }) => {
                props.goToWorkflowStatus(
                  locationId,
                  new Date(timeStart),
                  new Date(timeEnd),
                  status,
                  value as Event
                )
              }}
              id="event-select"
              withLightTheme={true}
              defaultWidth={110}
              value={(event as unknown as EVENT_OPTIONS) || EVENT_OPTIONS.BIRTH}
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
            <PerformanceSelect
              onChange={({ value }) => {
                props.goToWorkflowStatus(
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
              options={statusOptions.map((option) => ({
                ...option,
                label: intl.formatMessage(option.label)
              }))}
            />
          </>
        }
      >
        <Query
          query={FETCH_EVENTS_WITH_PROGRESS}
          variables={{
            locationId: locationId,
            skip: 0,
            count: recordCount,
            status: (status && [status]) || undefined,
            type: (event && [`${event.toLowerCase()}-declaration`]) || undefined
          }}
          fetchPolicy={'no-cache'}
        >
          {({ data, loading, error }) => {
            let total = 0
            if (loading) {
              return <Spinner id="status-view-loader" />
            }
            if (
              data &&
              data.getEventsWithProgress &&
              data.getEventsWithProgress.totalItems
            ) {
              total = data.getEventsWithProgress.totalItems
            }

            return (
              <>
                <TableView
                  id="declaration-status-list"
                  content={getContent(data)}
                  columns={getColumns()}
                  isLoading={loading || Boolean(error)}
                  noResultText={intl.formatMessage(constantsMessages.noResults)}
                  hideBoxShadow
                  fixedWidth={2050}
                  tableHeight={150}
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
                      pageSize: DEFAULT_DECLARATION_STATUS_PAGE_SIZE
                    }
                  )}
                  isFullPage
                />
                {error && <ToastNotification type={NOTIFICATION_TYPE.ERROR} />}
              </>
            )
          }}
        </Query>
      </Content>
    </SysAdminContentWrapper>
  )
}

export const WorkflowStatus = connect(null, {
  goToPerformanceHome,
  goToWorkflowStatus
})(injectIntl(WorkflowStatusComponent))
