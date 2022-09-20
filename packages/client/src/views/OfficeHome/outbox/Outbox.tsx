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
  GridTable,
  Spinner
} from '@client/../../components/lib/interface'
import { messages } from '@client/i18n/messages/views/notifications'
import { IDeclaration, SUBMISSION_STATUS } from '@client/declarations'
import { StatusWaiting } from '@client/../../components/lib/icons'
import { useSelector } from 'react-redux'
import { IStoreState } from '@client/store'
import { formatLongDate } from '@client/utils/date-formatting'
import styled from '@client/styledComponents'
import {
  IconWithName,
  NameContainer,
  NoNameContainer
} from '@client/views/OfficeHome/components'

const IconContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`
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
  const theme = getTheme()
  const declarations = useSelector<IStoreState, IDeclaration[]>(
    (state) => state.declarationsState && state.declarationsState.declarations
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
      statusArchiving,
      statusRegistering,
      statusWaitingToReject,
      statusRejecting,
      statusReinstating,
      statusWaitingToSubmit,
      statusSubmitting,
      waitingToRetry,
      statusRequestingCorrection,
      statusWaitingToRequestCorrection
    } = messages

    let icon: () => React.ReactNode
    let statusText: string
    let iconId: string

    switch (status) {
      case SUBMISSION_STATUS.READY_TO_SUBMIT:
        iconId = `waiting${index}`
        icon = () => <StatusWaiting id={iconId} key={iconId} />
        statusText = formatMessage(statusWaitingToSubmit)
        break
      case SUBMISSION_STATUS.READY_TO_APPROVE:
        iconId = `waiting${index}`
        icon = () => <StatusWaiting id={iconId} key={iconId} />
        statusText = formatMessage(statusWaitingToValidate)
        break
      case SUBMISSION_STATUS.READY_TO_REQUEST_CORRECTION:
        iconId = `waiting${index}`
        icon = () => <StatusWaiting id={iconId} key={iconId} />
        statusText = formatMessage(statusWaitingToRequestCorrection)
        break
      case SUBMISSION_STATUS.APPROVING:
        iconId = `registering${index}`
        icon = () => <Spinner id={iconId} key={iconId} size={24} />
        statusText = formatMessage(statusSubmitting)
        break
      case SUBMISSION_STATUS.SUBMITTING:
        iconId = `registering${index}`
        icon = () => <Spinner id={iconId} key={iconId} size={24} />
        statusText = formatMessage(statusSubmitting)
        break
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

    return {
      icon,
      statusText
    }
  }

  function transformDeclarationsReadyToSend() {
    return declarations.map((declaration, index) => {
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
        event:
          (declaration.event &&
            intl.formatMessage(
              dynamicConstantsMessages[declaration.event.toLowerCase()]
            )) ||
          '',
        statusIconAndName: (
          <IconWithName
            status={declaration.registrationStatus || 'IN_PROGRESS'}
            name={NameComponent}
          />
        ),
        submissionStatus: statusText || '',
        statusIndicator: icon ? <IconContainer>{icon()}</IconContainer> : null,
        dateOfEvent: dateOfEvent ? formatLongDate(dateOfEvent) : ''
      }
    })
  }

  return (
    <WQContentWrapper
      title={intl.formatMessage(navigationMessages.outbox)}
      isMobileSize={width < theme.grid.breakpoints.lg}
    >
      <GridTable
        content={transformDeclarationsReadyToSend()}
        columns={[
          {
            width: 25,
            label: intl.formatMessage(constantsMessages.name),
            key: 'statusIconAndName'
          },
          {
            label: intl.formatMessage(constantsMessages.event),
            width: 25,
            key: 'event'
          },
          {
            label: intl.formatMessage(constantsMessages.eventDate),
            width: 25,
            key: 'dateOfEvent'
          },
          {
            label: '',
            width: 21,
            key: 'submissionStatus',
            alignment: ColumnContentAlignment.RIGHT,
            color: getTheme().colors.supportingCopy
          },
          {
            label: '',
            width: 4,
            key: 'statusIndicator'
          }
        ]}
        noResultText={intl.formatMessage(constantsMessages.noResultsOutbox)}
        hideLastBorder={true}
      />
    </WQContentWrapper>
  )
}
