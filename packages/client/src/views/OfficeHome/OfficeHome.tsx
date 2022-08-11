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
  filterProcessingDeclarationsFromQuery,
  IDeclaration,
  SUBMISSION_STATUS
} from '@client/declarations'
import { Header } from '@client/components/Header/Header'
import {
  updateRegistrarWorkqueue,
  IWorkqueue,
  updateWorkqueuePagination,
  selectWorkqueuePagination
} from '@client/workqueue'
import { messages as certificateMessage } from '@client/i18n/messages/views/certificate'
import {
  goToEvents,
  goToPage,
  goToPrintCertificate,
  getDefaultPerformanceLocationId
} from '@client/navigation'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import styled from '@client/styledComponents'
import { Scope } from '@client/utils/authUtils'
import { getUserLocation, IUserDetails } from '@client/utils/userUtils'
import NotificationToast from '@client/views/OfficeHome/NotificationToast'
import { FloatingActionButton } from '@opencrvs/components/lib/buttons'
import { PlusTransparentWhite } from '@opencrvs/components/lib/icons'
import {
  PAGE_TRANSITIONS_ENTER_TIME,
  FIELD_AGENT_ROLES,
  NATL_ADMIN_ROLES,
  SYS_ADMIN_ROLES,
  PERFORMANCE_MANAGEMENT_ROLES
} from '@client/utils/constants'
import { Toast } from '@opencrvs/components/lib/Toast'
import { Spinner } from '@opencrvs/components/lib/Spinner'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps, Redirect } from 'react-router'
import { SentForReview } from './sentForReview/SentForReview'
import { InProgress, SELECTOR_ID } from './inProgress/InProgress'
import { ReadyToPrint } from './readyToPrint/ReadyToPrint'
import { RequiresUpdate } from './requiresUpdate/RequiresUpdate'
import { ReadyForReview } from './readyForReview/ReadyForReview'
import { InExternalValidationTab } from './inExternalValidation/InExternalValidationTab'
import {
  Navigation,
  WORKQUEUE_TABS
} from '@client/components/interface/Navigation'
import { isDeclarationInReadyToReviewStatus } from '@client/utils/draftUtils'
import { PERFORMANCE_HOME } from '@client/navigation/routes'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { Frame } from '@opencrvs/components/lib/Frame'

export const StyledSpinner = styled(Spinner)`
  margin: 20% auto;
`
export const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.negative};
  ${({ theme }) => theme.fonts.reg16};
  text-align: center;
  margin-top: 100px;
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
  updateRegistrarWorkqueue: typeof updateRegistrarWorkqueue
  updateWorkqueuePagination: typeof updateWorkqueuePagination
}

interface IBaseOfficeHomeStateProps {
  language: string
  scope: Scope | null
  userLocationId: string
  tabId: string
  selectorId: string
  drafts: IDeclaration[]
  declarations: IDeclaration[]
  workqueue: IWorkqueue
  storedDeclarations: IDeclaration[]
  declarationsReadyToSend: IDeclaration[]
  userDetails: IUserDetails | null
  healthSystemCurrentPage: number
  progressCurrentPage: number
  reviewCurrentPage: number
  approvalCurrentPage: number
  printCurrentPage: number
  externalValidationCurrentPage: number
  requireUpdateCurrentPage: number
}

interface IOfficeHomeState {
  draftCurrentPage: number
  showCertificateToast: boolean
}

type IOfficeHomeProps = IntlShapeProps &
  IDispatchProps &
  IBaseOfficeHomeStateProps

class OfficeHomeView extends React.Component<
  IOfficeHomeProps,
  IOfficeHomeState
> {
  pageSize = 4
  showPaginated = false
  interval: any = undefined
  role = this.props.userDetails && this.props.userDetails.role
  isFieldAgent = this.role
    ? FIELD_AGENT_ROLES.includes(this.role)
      ? true
      : false
    : false

  constructor(props: IOfficeHomeProps) {
    super(props)
    this.state = {
      draftCurrentPage: 1,
      showCertificateToast: Boolean(
        this.props.declarations.filter(
          (item) => item.submissionStatus === SUBMISSION_STATUS.READY_TO_CERTIFY
        ).length
      )
    }
  }

  updateWorkqueue() {
    this.props.updateRegistrarWorkqueue(
      this.props.userDetails?.practitionerId,
      this.pageSize,
      this.isFieldAgent
    )
  }

  syncWorkqueue() {
    setTimeout(() => this.updateWorkqueue(), PAGE_TRANSITIONS_ENTER_TIME)
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
      this.syncWorkqueue()
    }
  }
  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
  }

  userHasValidateScope() {
    return this.props.scope && this.props.scope.includes('validate')
  }

  subtractDeclarationsWithStatus(count: number, status: string[]) {
    const outboxCount = this.props.storedDeclarations.filter(
      (app) => app.submissionStatus && status.includes(app.submissionStatus)
    ).length
    return count - outboxCount
  }

  onPageChange = (newPageNumber: number) => {
    switch (this.props.tabId) {
      case WORKQUEUE_TABS.inProgress:
        if (
          this.props.selectorId &&
          this.props.selectorId === SELECTOR_ID.fieldAgentDrafts
        ) {
          this.props.updateWorkqueuePagination({ inProgressTab: newPageNumber })
          this.syncWorkqueue()
        } else if (
          this.props.selectorId &&
          this.props.selectorId === SELECTOR_ID.hospitalDrafts
        ) {
          this.props.updateWorkqueuePagination({
            notificationTab: newPageNumber
          })
          this.syncWorkqueue()
        } else {
          this.setState({ draftCurrentPage: newPageNumber }, () => {
            this.syncWorkqueue()
          })
        }

        break
      case WORKQUEUE_TABS.readyForReview:
        this.props.updateWorkqueuePagination({ reviewTab: newPageNumber })
        this.syncWorkqueue()
        break
      case WORKQUEUE_TABS.requiresUpdate:
        this.props.updateWorkqueuePagination({ rejectTab: newPageNumber })
        this.syncWorkqueue()
        break
      case WORKQUEUE_TABS.sentForApproval:
        this.props.updateWorkqueuePagination({ approvalTab: newPageNumber })
        this.syncWorkqueue()
        break
      case WORKQUEUE_TABS.readyToPrint:
        this.props.updateWorkqueuePagination({ printTab: newPageNumber })
        this.syncWorkqueue()
        break
      case WORKQUEUE_TABS.externalValidation:
        this.props.updateWorkqueuePagination({
          externalValidationTab: newPageNumber
        })
        this.syncWorkqueue()
        break
      case WORKQUEUE_TABS.sentForReview:
        this.props.updateWorkqueuePagination({ reviewTab: newPageNumber })
        this.syncWorkqueue()
        break
      default:
        throw new Error(`Unknown tab id when changing page ${this.props.tabId}`)
    }
  }

  getData = (
    draftCurrentPage: number,
    healthSystemCurrentPage: number,
    progressCurrentPage: number,
    reviewCurrentPage: number,
    approvalCurrentPage: number,
    printCurrentPage: number,
    externalValidationCurrentPage: number,
    requireUpdateCurrentPage: number
  ) => {
    const { workqueue, tabId, drafts, selectorId, storedDeclarations } =
      this.props
    const { loading, error, data } = workqueue
    const filteredData = filterProcessingDeclarationsFromQuery(
      data,
      storedDeclarations
    )

    return (
      <>
        {this.role &&
          (NATL_ADMIN_ROLES.includes(this.role) ||
            PERFORMANCE_MANAGEMENT_ROLES.includes(this.role)) && (
            <Redirect to={PERFORMANCE_HOME} />
          )}
        {this.role && SYS_ADMIN_ROLES.includes(this.role) && (
          <Redirect
            to={{
              pathname: PERFORMANCE_HOME,
              search: `?locationId=${getDefaultPerformanceLocationId(
                this.props.userDetails as IUserDetails
              )}`
            }}
          />
        )}

        {tabId === WORKQUEUE_TABS.inProgress && (
          <InProgress
            drafts={drafts}
            selectorId={selectorId}
            isFieldAgent={this.isFieldAgent}
            queryData={{
              inProgressData: filteredData.inProgressTab,
              notificationData: filteredData.notificationTab
            }}
            paginationId={{
              draftId: draftCurrentPage,
              fieldAgentId: progressCurrentPage,
              healthSystemId: healthSystemCurrentPage
            }}
            pageSize={this.pageSize}
            onPageChange={this.onPageChange}
            loading={loading}
            error={error}
          />
        )}
        {!this.isFieldAgent ? (
          <>
            {tabId === WORKQUEUE_TABS.readyForReview && (
              <ReadyForReview
                queryData={{
                  data: filteredData.reviewTab
                }}
                paginationId={reviewCurrentPage}
                pageSize={this.pageSize}
                onPageChange={this.onPageChange}
                loading={loading}
                error={error}
              />
            )}
            {tabId === WORKQUEUE_TABS.requiresUpdate && (
              <RequiresUpdate
                queryData={{
                  data: filteredData.rejectTab
                }}
                paginationId={requireUpdateCurrentPage}
                pageSize={this.pageSize}
                onPageChange={this.onPageChange}
                loading={loading}
                error={error}
              />
            )}

            {tabId === WORKQUEUE_TABS.externalValidation &&
              window.config.EXTERNAL_VALIDATION_WORKQUEUE && (
                <InExternalValidationTab
                  queryData={{
                    data: filteredData.externalValidationTab
                  }}
                  paginationId={externalValidationCurrentPage}
                  pageSize={this.pageSize}
                  onPageChange={this.onPageChange}
                  loading={loading}
                  error={error}
                />
              )}
            {tabId === WORKQUEUE_TABS.sentForApproval && (
              <SentForReview
                queryData={{
                  data: filteredData.approvalTab
                }}
                paginationId={approvalCurrentPage}
                pageSize={this.pageSize}
                onPageChange={this.onPageChange}
                loading={loading}
                error={error}
              />
            )}
            {tabId === WORKQUEUE_TABS.readyToPrint && (
              <ReadyToPrint
                queryData={{
                  data: filteredData.printTab
                }}
                paginationId={printCurrentPage}
                pageSize={this.pageSize}
                onPageChange={this.onPageChange}
                loading={loading}
                error={error}
              />
            )}
          </>
        ) : (
          <>
            {tabId === WORKQUEUE_TABS.sentForReview && (
              <SentForReview
                queryData={{
                  data: filteredData.reviewTab
                }}
                paginationId={reviewCurrentPage}
                pageSize={this.pageSize}
                onPageChange={this.onPageChange}
                loading={loading}
                error={error}
              />
            )}
            {tabId === WORKQUEUE_TABS.requiresUpdate && (
              <RequiresUpdate
                queryData={{
                  data: filteredData.rejectTab
                }}
                paginationId={requireUpdateCurrentPage}
                pageSize={this.pageSize}
                onPageChange={this.onPageChange}
                loading={loading}
                error={error}
              />
            )}
          </>
        )}
      </>
    )
  }

  render() {
    const { intl } = this.props
    const { draftCurrentPage } = this.state

    const {
      healthSystemCurrentPage,
      progressCurrentPage,
      reviewCurrentPage,
      approvalCurrentPage,
      printCurrentPage,
      externalValidationCurrentPage,
      requireUpdateCurrentPage
    } = this.props

    return (
      <Frame
        header={
          <Header
            title={intl.formatMessage(navigationMessages[this.props.tabId])}
          />
        }
        navigation={<Navigation loadWorkqueueStatuses={false} />}
      >
        {this.getData(
          draftCurrentPage,
          healthSystemCurrentPage,
          progressCurrentPage,
          reviewCurrentPage,
          approvalCurrentPage,
          printCurrentPage,
          externalValidationCurrentPage,
          requireUpdateCurrentPage
        )}

        <FABContainer>
          <FloatingActionButton
            id="new_event_declaration"
            onClick={this.props.goToEvents}
            icon={() => <PlusTransparentWhite />}
          />
        </FABContainer>
        <NotificationToast showPaginated={this.showPaginated} />

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
  }>
): IBaseOfficeHomeStateProps {
  const { match } = props
  const userDetails = getUserDetails(state)
  const userLocationId = (userDetails && getUserLocation(userDetails).id) || ''
  const scope = getScope(state)
  const {
    printTab,
    reviewTab,
    approvalTab,
    inProgressTab,
    externalValidationTab,
    rejectTab,
    notificationTab
  } = selectWorkqueuePagination(state)
  return {
    declarations: state.declarationsState.declarations,
    workqueue: state.workqueueState.workqueue,
    language: state.i18n.language,
    scope,
    userLocationId,
    tabId:
      (match && match.params && match.params.tabId) ||
      WORKQUEUE_TABS.inProgress,
    selectorId: (match && match.params && match.params.selectorId) || '',
    storedDeclarations: state.declarationsState.declarations,
    drafts:
      (
        state.declarationsState.declarations &&
        state.declarationsState.declarations.filter(
          (declaration: IDeclaration) =>
            declaration.submissionStatus ===
            SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
        )
      ).reverse() || [],
    declarationsReadyToSend: (
      (state.declarationsState.declarations &&
        state.declarationsState.declarations.filter(
          (declaration: IDeclaration) =>
            isDeclarationInReadyToReviewStatus(declaration.submissionStatus)
        )) ||
      []
    ).reverse(),
    userDetails,
    printCurrentPage: printTab,
    reviewCurrentPage: reviewTab,
    approvalCurrentPage: approvalTab,
    progressCurrentPage: inProgressTab,
    healthSystemCurrentPage: notificationTab,
    requireUpdateCurrentPage: rejectTab,
    externalValidationCurrentPage: externalValidationTab
  }
}

export const OfficeHome = connect(mapStateToProps, {
  goToEvents,
  goToPage,
  goToPrintCertificate,
  updateRegistrarWorkqueue,
  updateWorkqueuePagination
})(injectIntl(OfficeHomeView))
