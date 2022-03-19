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
import { BodyContent } from '@opencrvs/components/lib/layout'
import {
  GridTable,
  ColumnContentAlignment,
  Spinner
} from '@opencrvs/components/lib/interface'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import {
  constantsMessages,
  dynamicConstantsMessages
} from '@client/i18n/messages'
import { StatusWaiting } from '@opencrvs/components/lib/icons'
import { messages } from '@client/i18n/messages/views/notifications'
import { getTheme } from '@opencrvs/components/lib/theme'
import styled from '@client/styledComponents'
import { IDeclaration, SUBMISSION_STATUS } from '@client/declarations'
import { getDefaultLanguage } from '@client/i18n/utils'
const Container = styled(BodyContent)`
  padding-top: 32px;
`

interface IState {
  sentForReviewPageNo: number
}
interface IProps {
  declaration: IDeclaration[]
  showPaginated?: boolean
}
type IFullProps = IProps & IntlShapeProps
class Outbox extends React.Component<IFullProps, IState> {
  submissionStatusMap = (status: string, index: number) => {
    const { formatMessage } = this.props.intl
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

  transformDeclarationsReadyToSend = () => {
    const { intl } = this.props
    const alldeclarations = this.props.declaration || []
    return alldeclarations.map((declaration, index) => {
      let name
      if (declaration.event && declaration.event.toString() === 'birth') {
        name =
          (declaration.data &&
            declaration.data.child &&
            declaration.data.child.familyNameEng &&
            (!declaration.data.child.firstNamesEng
              ? ''
              : declaration.data.child.firstNamesEng + ' ') +
              declaration.data.child.familyNameEng) ||
          (declaration.data &&
            declaration.data.child &&
            declaration.data.child.familyName &&
            (!declaration.data.child.firstNames
              ? ''
              : declaration.data.child.firstNames + ' ') +
              declaration.data.child.familyName) ||
          ''
      } else if (
        declaration.event &&
        declaration.event.toString() === 'death'
      ) {
        name =
          (declaration.data &&
            declaration.data.deceased &&
            declaration.data.deceased.familyNameEng &&
            (!declaration.data.deceased.firstNamesEng
              ? ''
              : declaration.data.deceased.firstNamesEng + ' ') +
              declaration.data.deceased.familyNameEng) ||
          (declaration.data &&
            declaration.data.deceased &&
            declaration.data.deceased.familyName &&
            (!declaration.data.deceased.firstNames
              ? ''
              : declaration.data.deceased.firstNames + ' ') +
              declaration.data.deceased.familyName) ||
          ''
      }

      const { statusText, icon } = this.submissionStatusMap(
        declaration.submissionStatus || '',
        index
      )

      return {
        id: declaration.id,
        event:
          (declaration.event &&
            intl.formatMessage(
              dynamicConstantsMessages[declaration.event.toLowerCase()]
            )) ||
          '',
        name,
        submissionStatus: statusText || '',
        statusIndicator: icon ? [icon()] : null
      }
    })
  }

  onPageChange = (pageNumber: number) => {
    this.setState({ sentForReviewPageNo: pageNumber })
  }

  render() {
    const { intl, declaration } = this.props

    return (
      <Container>
        <GridTable
          hideTableHeader={true}
          content={this.transformDeclarationsReadyToSend()}
          columns={[
            {
              label: this.props.intl.formatMessage(constantsMessages.type),
              width: 15,
              key: 'event'
            },
            {
              width: 45,
              label: this.props.intl.formatMessage(constantsMessages.name),
              key: 'name'
            },
            {
              label: this.props.intl.formatMessage(
                messages.statusWaitingToRegister
              ),
              width: 35,
              key: 'submissionStatus',
              color: getTheme(getDefaultLanguage()).colors.supportingCopy
            },
            {
              label: '',
              width: 5,
              alignment: ColumnContentAlignment.CENTER,
              key: 'statusIndicator'
            }
          ]}
          noResultText={intl.formatMessage(constantsMessages.noResults)}
          totalItems={declaration.length}
          onPageChange={this.onPageChange}
          pageSize={10}
          showPaginated={this.props.showPaginated}
          loadMoreText={intl.formatMessage(constantsMessages.loadMore)}
        />
      </Container>
    )
  }
}

export default injectIntl(Outbox)
