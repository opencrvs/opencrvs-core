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
import * as React from 'react'
import { WQContentWrapper } from '@client/views/OfficeHome/WQContentWrapper'
import { useIntl } from 'react-intl'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { getTheme } from '@opencrvs/components/lib/theme'
import {
  constantsMessages,
  dynamicConstantsMessages
} from '@client/i18n/messages'
import {
  ColumnContentAlignment,
  COLUMNS,
  Workqueue,
  SORT_ORDER
} from '@opencrvs/components/lib/Workqueue'
import { messages } from '@client/i18n/messages/views/notifications'
import { IDeclaration, SUBMISSION_STATUS } from '@client/declarations'
import {
  ConnectionError,
  StatusSubmissionWaiting as StatusWaiting
} from '@opencrvs/components/lib/icons'
import { useSelector } from 'react-redux'
import { IStoreState } from '@client/store'
import { formatLongDate } from '@client/utils/date-formatting'
import {
  IconWithName,
  IconWithNameEvent,
  NameContainer,
  NoNameContainer
} from '@client/views/OfficeHome/components'
import {
  changeSortedColumn,
  getSortedItems
} from '@client/views/OfficeHome/utils'
import {
  ALLOWED_STATUS_FOR_RETRY,
  IInProgressStatus,
  INPROGRESS_STATUS,
  IRetryStatus
} from '@client/SubmissionController'
import { useOnlineStatus } from '@client/utils'
import { Spinner } from '@opencrvs/components/lib'
import { getDeclarationFullName } from '@client/utils/draftUtils'

const statusMessageMap = {
  [SUBMISSION_STATUS.READY_TO_SUBMIT]: messages.statusWaitingToSubmit,
  [SUBMISSION_STATUS.READY_TO_APPROVE]: messages.statusWaitingToValidate,
  [SUBMISSION_STATUS.READY_TO_REGISTER]: messages.statusWaitingToRegister,
  [SUBMISSION_STATUS.READY_TO_REQUEST_CORRECTION]:
    messages.statusWaitingToRequestCorrection,
  [SUBMISSION_STATUS.SUBMITTING]: messages.statusSubmitting,
  [SUBMISSION_STATUS.APPROVING]: messages.statusSendingForApproval,
  [SUBMISSION_STATUS.REGISTERING]: messages.statusRegistering,
  [SUBMISSION_STATUS.REQUESTING_CORRECTION]:
    messages.statusRequestingCorrection,
  [SUBMISSION_STATUS.CORRECTION_REQUESTED]: messages.statusRequestingCorrection,
  [SUBMISSION_STATUS.READY_TO_REJECT]: messages.statusWaitingToReject,
  [SUBMISSION_STATUS.REJECTING]: messages.statusRejecting,
  [SUBMISSION_STATUS.READY_TO_REINSTATE]: messages.statusWaitingToBeReinstated,
  [SUBMISSION_STATUS.REINSTATING]: messages.statusReinstating,
  [SUBMISSION_STATUS.READY_TO_ARCHIVE]: messages.statusWaitingToBeArchived,
  [SUBMISSION_STATUS.ARCHIVING]: messages.statusArchiving,
  [SUBMISSION_STATUS.READY_TO_CERTIFY]: messages.statusWaitingToCertify,
  [SUBMISSION_STATUS.READY_TO_ISSUE]: messages.statusWaitingToIssue,
  [SUBMISSION_STATUS.CERTIFYING]: messages.statusCertifying,
  [SUBMISSION_STATUS.ISSUING]: messages.statusIssuing,
  [SUBMISSION_STATUS.FAILED_NETWORK]: messages.waitingToRetry
} as const

const statusInprogressIconIdMap = {
  [SUBMISSION_STATUS.SUBMITTING]: 'submitting',
  [SUBMISSION_STATUS.APPROVING]: 'approving',
  [SUBMISSION_STATUS.REGISTERING]: 'registering',
  [SUBMISSION_STATUS.REJECTING]: 'rejecting',
  [SUBMISSION_STATUS.REQUESTING_CORRECTION]: 'requestingCorrection',
  [SUBMISSION_STATUS.REINSTATING]: 'reinstating',
  [SUBMISSION_STATUS.ARCHIVING]: 'archiving',
  [SUBMISSION_STATUS.CERTIFYING]: 'certifying',
  [SUBMISSION_STATUS.ISSUING]: 'issuing'
}

type OutboxSubmissionStatus = IRetryStatus | IInProgressStatus

function isInprogressStatus(
  status: OutboxSubmissionStatus
): status is IInProgressStatus {
  return INPROGRESS_STATUS.includes(status as IInProgressStatus)
}

function getIcon(
  status: OutboxSubmissionStatus,
  index: number,
  isOnline: boolean
): React.ReactNode {
  let id = `waiting${index}`

  if (!isOnline) {
    id = `noConnection${index}`
    return <ConnectionError id={id} key={id} />
  }

  if (status === SUBMISSION_STATUS.FAILED_NETWORK) {
    id = `failed${index}`
  }

  if (isInprogressStatus(status)) {
    id = `${statusInprogressIconIdMap[status] || `registering`}${index}`
    return <Spinner id={id} key={id} size={24} />
  }

  return <StatusWaiting id={id} key={id} />
}
const isOutboxDeclaration = (
  declaration: IDeclaration
): declaration is IDeclaration & {
  submissionStatus: OutboxSubmissionStatus
} =>
  Boolean(declaration.submissionStatus) &&
  (
    [...ALLOWED_STATUS_FOR_RETRY, ...INPROGRESS_STATUS] as SUBMISSION_STATUS[]
  ).includes(declaration.submissionStatus as SUBMISSION_STATUS)

export function Outbox() {
  const intl = useIntl()
  const [width, setWidth] = React.useState(window.innerWidth)
  const [sortedColumn, setSortedColumn] = React.useState(COLUMNS.ICON_WITH_NAME)
  const [sortOrder, setSortOrder] = React.useState(SORT_ORDER.ASCENDING)
  const isOnline = useOnlineStatus()
  const theme = getTheme()
  const declarations = useSelector((state: IStoreState) =>
    state.declarationsState?.declarations.filter(isOutboxDeclaration)
  )

  React.useEffect(() => {
    function recordWindowWidth() {
      setWidth(window.innerWidth)
    }
    window.addEventListener('resize', recordWindowWidth)
    return () => window.removeEventListener('resize', recordWindowWidth)
  }, [])

  const onColumnClick = (columnName: string) => {
    const { newSortedCol, newSortOrder } = changeSortedColumn(
      columnName,
      sortedColumn,
      sortOrder
    )
    setSortedColumn(newSortedCol)
    setSortOrder(newSortOrder)
  }

  function transformDeclarationsReadyToSend() {
    const items = declarations.map((declaration, index) => {
      const name = getDeclarationFullName(declaration)
      let dateOfEvent
      if (declaration.event && declaration.event.toString() === 'birth') {
        dateOfEvent = declaration.data?.child?.childBirthDate as string
      } else if (
        declaration.event &&
        declaration.event.toString() === 'death'
      ) {
        dateOfEvent = declaration.data?.deathEvent?.deathDate as string
      } else if (declaration?.event?.toString() === 'marriage') {
        dateOfEvent = declaration.data?.marriageEvent?.marriageDate?.toString()
      }

      const statusText = intl.formatMessage(
        statusMessageMap[declaration.submissionStatus] ||
          messages.statusWaitingToRegister
      )
      const icon = getIcon(declaration.submissionStatus, index, isOnline)

      const NameComponent = name ? (
        <NameContainer>{name}</NameContainer>
      ) : (
        <NoNameContainer>
          {intl.formatMessage(constantsMessages.noNameProvided)}
        </NoNameContainer>
      )

      return {
        id: declaration.id,
        name,
        event:
          (declaration.event &&
            intl.formatMessage(
              dynamicConstantsMessages[declaration.event.toLowerCase()]
            )) ||
          '',
        iconWithName: (
          <IconWithName
            status={declaration.registrationStatus || 'IN_PROGRESS'}
            name={NameComponent}
          />
        ),
        iconWithNameEvent: (
          <IconWithNameEvent
            status={declaration.registrationStatus || 'IN_PROGRESS'}
            name={NameComponent}
            event={statusText}
          />
        ),
        submissionStatus: statusText,
        statusIndicator: icon ? [{ actionComponent: icon }] : null,
        dateOfEvent
      }
    })

    const sortedItems = getSortedItems(items, sortedColumn, sortOrder)
    return sortedItems.map((item) => ({
      ...item,
      dateOfEvent:
        item.dateOfEvent && typeof item.dateOfEvent === 'string'
          ? formatLongDate(item.dateOfEvent)
          : ''
    }))
  }

  function getColumns() {
    return width < theme.grid.breakpoints.lg
      ? [
          {
            label: intl.formatMessage(constantsMessages.record),
            width: 70,
            key: COLUMNS.ICON_WITH_NAME_EVENT
          },
          {
            width: 30,
            alignment: ColumnContentAlignment.RIGHT,
            key: 'statusIndicator',
            isActionColumn: true
          }
        ]
      : [
          {
            width: 25,
            label: intl.formatMessage(constantsMessages.record),
            key: COLUMNS.ICON_WITH_NAME,
            isSorted: sortedColumn === COLUMNS.NAME,
            sortFunction: onColumnClick
          },
          {
            label: intl.formatMessage(constantsMessages.event),
            width: 25,
            key: COLUMNS.EVENT,
            isSorted: sortedColumn === COLUMNS.EVENT,
            sortFunction: onColumnClick
          },
          {
            label: intl.formatMessage(constantsMessages.eventDate),
            width: 25,
            key: COLUMNS.DATE_OF_EVENT,
            isSorted: sortedColumn === COLUMNS.DATE_OF_EVENT,
            sortFunction: onColumnClick
          },
          {
            label: '',
            width: 21,
            key: 'submissionStatus',
            alignment: ColumnContentAlignment.RIGHT,
            color: theme.colors.supportingCopy
          },
          {
            label: '',
            width: 4,
            key: 'statusIndicator',
            isActionColumn: true
          }
        ]
  }

  return (
    <WQContentWrapper
      title={intl.formatMessage(navigationMessages.outbox)}
      isMobileSize={width < theme.grid.breakpoints.lg}
    >
      <Workqueue
        content={transformDeclarationsReadyToSend()}
        columns={getColumns()}
        noResultText={intl.formatMessage(constantsMessages.noResultsOutbox)}
        hideLastBorder={true}
        sortOrder={sortOrder}
      />
    </WQContentWrapper>
  )
}
