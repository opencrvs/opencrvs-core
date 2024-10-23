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
import { Header } from '@client/components/Header/Header'
import {
  Navigation,
  WORKQUEUE_TABS
} from '@client/components/interface/Navigation'
import { constantsMessages } from '@client/i18n/messages'
import { messages as certificateMessage } from '@client/i18n/messages/views/certificate'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import {
  goToEvents,
  goToHomeTab,
  goToPage,
  goToPrintCertificate
} from '@client/navigation'
import { IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'

import {
  FIELD_AGENT_ROLES,
  PAGE_TRANSITIONS_ENTER_TIME
} from '@client/utils/constants'
import { getUserLocation } from '@client/utils/userUtils'

import { FloatingActionButton } from '@opencrvs/components/lib/buttons'
import { Frame } from '@opencrvs/components/lib/Frame'
import { PlusTransparentWhite } from '@opencrvs/components/lib/icons'
import { Spinner } from '@opencrvs/components/lib/Spinner'
import { Toast } from '@opencrvs/components/lib/Toast'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import styled from 'styled-components'

const StyledSpinner = styled(Spinner)`
  margin: 20% auto;
`

const FABContainer = styled.div`
  position: fixed;
  right: 40px;
  bottom: 55px;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

interface IDispatchProps {
  goToPage: typeof goToPage
  goToPrintCertificate: typeof goToPrintCertificate
  goToEvents: typeof goToEvents
  goToHomeTab: typeof goToHomeTab
  getOfflineData: typeof getOfflineData
}

type IBaseOfficeHomeStateProps = ReturnType<typeof mapStateToProps>

interface IOfficeHomeState {
  draftCurrentPage: number
  showCertificateToast: boolean
  offlineResources: IOfflineData
}

type IOfficeHomeProps = IntlShapeProps &
  IDispatchProps &
  IBaseOfficeHomeStateProps

const DECLARATION_WORKQUEUE_TABS = [
  WORKQUEUE_TABS.inProgress,
  WORKQUEUE_TABS.sentForApproval,
  WORKQUEUE_TABS.sentForReview,
  WORKQUEUE_TABS.readyForReview,
  WORKQUEUE_TABS.requiresUpdate,
  WORKQUEUE_TABS.readyToPrint,
  WORKQUEUE_TABS.readyToIssue,
  WORKQUEUE_TABS.externalValidation
] as const

const WORKQUEUE_TABS_PAGINATION = {
  [WORKQUEUE_TABS.inProgress]: 'inProgressTab',
  [WORKQUEUE_TABS.sentForApproval]: 'approvalTab',
  [WORKQUEUE_TABS.sentForReview]: 'reviewTab',
  [WORKQUEUE_TABS.readyForReview]: 'reviewTab',
  [WORKQUEUE_TABS.requiresUpdate]: 'rejectTab',
  [WORKQUEUE_TABS.readyToPrint]: 'printTab',
  [WORKQUEUE_TABS.readyToIssue]: 'issueTab',
  [WORKQUEUE_TABS.externalValidation]: 'externalValidationTab'
} as const

class OfficeHomeView extends React.Component<
  IOfficeHomeProps,
  IOfficeHomeState
> {
  pageSize = 10
  showPaginated = false
  interval: any = undefined
  role = this.props.userDetails && this.props.userDetails.systemRole
  isFieldAgent = this.role
    ? FIELD_AGENT_ROLES.includes(this.role)
      ? true
      : false
    : false

  constructor(props: IOfficeHomeProps) {
    super(props)
    this.state = {
      draftCurrentPage: 1,
      showCertificateToast: false,
      offlineResources: this.props.offlineResources
    }
  }

  updateWorkqueue() {}

  syncWorkqueue() {
    setTimeout(() => this.updateWorkqueue(), PAGE_TRANSITIONS_ENTER_TIME)
    if (this.interval) {
      clearInterval(this.interval)
    }
    this.interval = setInterval(() => {
      this.updateWorkqueue()
    }, 300000)
  }

  componentDidMount() {
    this.syncWorkqueue()
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  componentDidUpdate(prevProps: IOfficeHomeProps) {
    if (prevProps.tabId !== this.props.tabId) {
      this.updateWorkqueue()
    }
  }

  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
  }

  userHasValidateScope() {
    return this.props.scope && this.props.scope.includes('validate')
  }

  getData = (
    draftCurrentPage: number,
    healthSystemCurrentPage: number,
    progressCurrentPage: number,
    reviewCurrentPage: number,
    approvalCurrentPage: number,
    printCurrentPage: number,
    issueCurrentPage: number,
    externalValidationCurrentPage: number,
    requireUpdateCurrentPage: number
  ) => {
    return <div>@todo</div>
  }

  render() {
    const { intl } = this.props
    const { draftCurrentPage } = this.state

    return (
      <Frame
        header={
          <Header
            title={intl.formatMessage(navigationMessages[this.props.tabId])}
          />
        }
        skipToContentText={intl.formatMessage(
          constantsMessages.skipToMainContent
        )}
        navigation={<Navigation loadWorkqueueStatuses={false} />}
      >
        <FABContainer>
          <FloatingActionButton
            id="new_event_declaration"
            onClick={this.props.goToEvents}
            icon={() => <PlusTransparentWhite />}
          />
        </FABContainer>

        {this.state.showCertificateToast && (
          <Toast
            id="print-cert-notification"
            type="success"
            onClose={() => {
              this.setState({ showCertificateToast: false })
            }}
          >
            {intl.formatMessage(certificateMessage.toastMessage)}
          </Toast>
        )}
      </Frame>
    )
  }
}

function mapStateToProps(
  state: IStoreState,
  props: RouteComponentProps<{
    tabId: string
    selectorId?: string
    pageId?: string
  }>
) {
  const { match } = props
  const userDetails = getUserDetails(state)
  const userLocationId = (userDetails && getUserLocation(userDetails).id) || ''
  const scope = getScope(state)
  const pageId =
    (match.params.pageId && Number.parseInt(match.params.pageId)) ||
    (match.params.selectorId && Number.parseInt(match.params.selectorId)) ||
    1
  return {
    offlineResources: getOfflineData(state),
    language: state.i18n.language,
    scope,
    userLocationId,
    tabId:
      (match && match.params && match.params.tabId) ||
      WORKQUEUE_TABS.inProgress,
    selectorId: (match && match.params && match.params.selectorId) || '',
    pageId,
    userDetails
  }
}

export const OfficeHome = connect(mapStateToProps, {
  goToEvents,
  goToPage,
  goToPrintCertificate,
  goToHomeTab,
  getOfflineData
})(injectIntl(OfficeHomeView))
