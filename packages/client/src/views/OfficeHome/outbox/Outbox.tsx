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
import { WQContentWrapper } from '@client/views/OfficeHome/WQContentWrapper'
import { useIntl } from 'react-intl'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { getTheme } from '@client/../../components/lib/theme'
import {
  constantsMessages,
  dynamicConstantsMessages
} from '@client/i18n/messages'
import {
  ColumnContentAlignment,
  COLUMNS,
  GridTable,
  SORT_ORDER,
  Spinner
} from '@client/../../components/lib/interface'
import { messages } from '@client/i18n/messages/views/notifications'
import { IDeclaration, SUBMISSION_STATUS } from '@client/declarations'
import {
  ConnectionError,
  StatusSubmissionWaiting as StatusWaiting
} from '@client/../../components/lib/icons'
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
  INPROGRESS_STATUS
} from '@client/SubmissionController'
import { useOnlineStatus } from '@client/views/OfficeHome/LoadingIndicator'
import { getScope } from '@client/profile/profileSelectors'

function getFullName(firstName?: string, lastName?: string) {
  let fullName = ''
  if (firstName) {
    fullName += firstName
  }
  if (lastName) {
    if (fullName) {
      fullName += ' '
    }
    fullName += lastName
  }
  return fullName
}

export function Outbox() {
  const intl = useIntl()
  const [width, setWidth] = React.useState(window.innerWidth)
  const [sortedColumn, setSortedColumn] = React.useState(COLUMNS.ICON_WITH_NAME)
  const [sortOrder, setSortOrder] = React.useState(SORT_ORDER.ASCENDING)
  const isOnline = useOnlineStatus()
  const theme = getTheme()
  const scope = useSelector(getScope)
  const declarations = useSelector<IStoreState, IDeclaration[]>((state) =>
    state.declarationsState?.declarations.filter(
      (declaration) =>
        declaration.submissionStatus &&
        (
          [
            ...ALLOWED_STATUS_FOR_RETRY,
            ...INPROGRESS_STATUS
          ] as SUBMISSION_STATUS[]
        ).includes(declaration.submissionStatus as SUBMISSION_STATUS)
    )
  )

  React.useEffect(() => {
    function recordWindowWidth() {
      setWidth(window.innerWidth)
    }
    window.addEventListener('resize', recordWindowWidth)
    return () => window.removeEventListener('resize', recordWindowWidth)
  }, [])

  function submissionStatusMap(status: string, index: number) {
    const { formatMessage } = intl
    const {
      statusWaitingToBeArchived,
      statusWaitingToBeReinstated,
      statusWaitingToRegister,
      statusWaitingToValidate,
      statusWaitingToCertify,
      statusArchiving,
      statusCertifying,
      statusRegistering,
      statusWaitingToReject,
      statusRejecting,
      statusReinstating,
      statusWaitingToSubmit,
      statusSubmitting,
      statusSendingForApproval,
      waitingToRetry,
      statusRequestingCorrection,
      statusWaitingToRequestCorrection
    } = messages

    let icon: () => React.ReactNode
    let statusText: string
    let iconId: string

    switch (status) {
      // @ts-ignore
      case SUBMISSION_STATUS.READY_TO_SUBMIT:
        if (!(scope?.includes('register') || scope?.includes('validate'))) {
          iconId = `waiting${index}`
          icon = () => <StatusWaiting id={iconId} key={iconId} />
          statusText = formatMessage(statusWaitingToSubmit)
          break
        }
      // @ts-ignore
      // eslint-disable-next-line no-fallthrough
      case SUBMISSION_STATUS.READY_TO_APPROVE:
        if (!scope?.includes('register')) {
          iconId = `waiting${index}`
          icon = () => <StatusWaiting id={iconId} key={iconId} />
          statusText = formatMessage(statusWaitingToValidate)
          break
        }
      // eslint-disable-next-line no-fallthrough
      case SUBMISSION_STATUS.READY_TO_REGISTER:
        iconId = `waiting${index}`
        icon = () => <StatusWaiting id={iconId} key={iconId} />
        statusText = formatMessage(statusWaitingToRegister)
        break
      case SUBMISSION_STATUS.READY_TO_REQUEST_CORRECTION:
        iconId = `waiting${index}`
        icon = () => <StatusWaiting id={iconId} key={iconId} />
        statusText = formatMessage(statusWaitingToRequestCorrection)
        break
      // @ts-ignore
      case SUBMISSION_STATUS.SUBMITTING:
        if (!(scope?.includes('register') || scope?.includes('validate'))) {
          iconId = `registering${index}`
          icon = () => <Spinner id={iconId} key={iconId} size={24} />
          statusText = formatMessage(statusSubmitting)
          break
        }
      // @ts-ignore
      // eslint-disable-next-line no-fallthrough
      case SUBMISSION_STATUS.APPROVING:
        if (!scope?.includes('register')) {
          iconId = `registering${index}`
          icon = () => <Spinner id={iconId} key={iconId} size={24} />
          statusText = formatMessage(statusSendingForApproval)
          break
        }
      // eslint-disable-next-line no-fallthrough
      case SUBMISSION_STATUS.REGISTERING:
        iconId = `registering${index}`
        icon = () => <Spinner id={iconId} key={iconId} size={24} />
        statusText = formatMessage(statusRegistering)
        break
      case SUBMISSION_STATUS.REQUESTING_CORRECTION:
        iconId = `requestingCorrection${index}`
        icon = () => <Spinner id={iconId} key={iconId} size={24} />
        statusText = formatMessage(statusRequestingCorrection)
        break
      case SUBMISSION_STATUS.READY_TO_REJECT:
        iconId = `waiting${index}`
        icon = () => <StatusWaiting id={iconId} key={iconId} />
        statusText = formatMessage(statusWaitingToReject)
        break
      case SUBMISSION_STATUS.REJECTING:
        iconId = `rejecting${index}`
        icon = () => <Spinner id={iconId} key={iconId} size={24} />
        statusText = formatMessage(statusRejecting)
        break
      case SUBMISSION_STATUS.READY_TO_REINSTATE:
        iconId = `waiting${index}`
        icon = () => <Spinner id={iconId} key={iconId} size={24} />
        statusText = formatMessage(statusWaitingToBeReinstated)
        break
      case SUBMISSION_STATUS.REINSTATING:
        iconId = `reinstating${index}`
        icon = () => <Spinner id={iconId} key={iconId} size={24} />
        statusText = formatMessage(statusReinstating)
        break
      case SUBMISSION_STATUS.READY_TO_ARCHIVE:
        iconId = `waiting${index}`
        icon = () => <StatusWaiting id={iconId} key={iconId} />
        statusText = formatMessage(statusWaitingToBeArchived)
        break
      case SUBMISSION_STATUS.ARCHIVING:
        iconId = `registering${index}`
        icon = () => <Spinner id={iconId} key={iconId} size={24} />
        statusText = formatMessage(statusArchiving)
        break
      case SUBMISSION_STATUS.READY_TO_CERTIFY:
        iconId = `waiting${index}`
        icon = () => <StatusWaiting id={iconId} key={iconId} />
        statusText = formatMessage(statusWaitingToCertify)
        break
      case SUBMISSION_STATUS.CERTIFYING:
        iconId = `waiting${index}`
        icon = () => <Spinner id={iconId} key={iconId} size={24} />
        statusText = formatMessage(statusCertifying)
        break
      case SUBMISSION_STATUS.FAILED_NETWORK:
        iconId = `failed${index}`
        icon = () => <StatusWaiting id={iconId} key={iconId} />
        statusText = formatMessage(waitingToRetry)
        break
      default:
        // default act as  SUBMISSION_STATUS[SUBMISSION_STATUS.READY_TO_REGISTER]:
        iconId = `waiting${index}`
        icon = () => <StatusWaiting id={iconId} key={iconId} />
        statusText = formatMessage(statusWaitingToRegister)
    }

    if (!isOnline) {
      iconId = `noConnection${index}`
      icon = () => <ConnectionError id={iconId} key={iconId} />
    }
    return {
      icon,
      statusText
    }
  }

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
      let name
      let dateOfEvent
      if (declaration.event && declaration.event.toString() === 'birth') {
        name =
          getFullName(
            declaration.data?.child?.firstNamesEng as string,
            declaration.data?.child?.familyNameEng as string
          ) ||
          getFullName(
            declaration.data?.child?.firstNames as string,
            declaration.data?.child?.familyName as string
          )
        dateOfEvent = declaration.data?.child?.childBirthDate as string
      } else if (
        declaration.event &&
        declaration.event.toString() === 'death'
      ) {
        name =
          getFullName(
            declaration.data?.deceased?.firstNamesEng as string,
            declaration.data?.deceased?.familyNameEng as string
          ) ||
          getFullName(
            declaration.data?.deceased?.firstNames as string,
            declaration.data?.deceased?.familyName as string
          )
        dateOfEvent = declaration.data?.deathEvent?.deathDate as string
      }

      const { statusText, icon } = submissionStatusMap(
        declaration.submissionStatus || '',
        index
      )

      const NameComponent = name ? (
        <NameContainer isBoldLink>{name}</NameContainer>
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
            event={statusText || ''}
          />
        ),
        submissionStatus: statusText || '',
        statusIndicator: icon ? [{ actionComponent: icon() }] : null,
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
      <GridTable
        content={transformDeclarationsReadyToSend()}
        columns={getColumns()}
        noResultText={intl.formatMessage(constantsMessages.noResultsOutbox)}
        hideLastBorder={true}
        sortOrder={sortOrder}
        sortedCol={sortedColumn}
      />
    </WQContentWrapper>
  )
}
