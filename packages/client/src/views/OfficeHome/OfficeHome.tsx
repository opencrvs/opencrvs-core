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
  IWorkqueue,
  SUBMISSION_STATUS,
  updateRegistrarWorkqueue,
  updateFieldAgentDeclaredDeclarations
} from '@client/declarations'
import { Header } from '@client/components/interface/Header/Header'
import { messages as certificateMessage } from '@client/i18n/messages/views/certificate'
import {
  goToEvents,
  goToPage,
  goToPrintCertificate,
  goToReviewDuplicate
} from '@client/navigation'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import styled from '@client/styledComponents'
import { Scope } from '@client/utils/authUtils'
import { getUserLocation, IUserDetails } from '@client/utils/userUtils'
import NotificationToast from '@client/views/OfficeHome/NotificationToast'
import {
  FloatingActionButton,
  IButtonProps
} from '@opencrvs/components/lib/buttons'
import { PlusTransparentWhite } from '@opencrvs/components/lib/icons'
import {
  PAGE_TRANSITIONS_ENTER_TIME,
  FIELD_AGENT_ROLES,
  NATL_ADMIN_ROLES,
  SYS_ADMIN_ROLES,
  PERFORMANCE_MANAGEMENT_ROLES
} from '@client/utils/constants'
import {
  FloatingNotification,
  NOTIFICATION_TYPE,
  Spinner
} from '@opencrvs/components/lib/interface'
import subYears from 'date-fns/subYears'
import { GQLEventSearchResultSet } from '@opencrvs/gateway/src/graphql/schema'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps, Redirect } from 'react-router'
import { SentForApproval } from './sentForApproval/SentForApproval'
import { InProgress, SELECTOR_ID } from './inProgress/InProgress'
import { ReadyToPrint } from './readyToPrint/ReadyToPrint'
import { RequiresUpdateRegistrar } from './requiresUpdate/RequiresUpdateRegistrar'
import { ReadyForReview } from './readyForReview/ReadyForReview'
import { InExternalValidationTab } from './inExternalValidation/InExternalValidationTab'
import {
  Navigation,
  WORKQUEUE_TABS
} from '@client/components/interface/Navigation'
import { isDeclarationInReadyToReviewStatus } from '@client/utils/draftUtils'
import { SentForReview } from './sentForReview/SentForReview'
import { RequiresUpdateFieldAgent } from './requiresUpdate/RequiresUpdateFieldAgent'
import { PERFORMANCE_HOME } from '@client/navigation/routes'
import { getJurisdictionLocationIdFromUserDetails } from '@client/views/SysAdmin/Performance/utils'
import { navigationMessages } from '@client/i18n/messages/views/navigation'

export interface IProps extends IButtonProps {
  active?: boolean
  disabled?: boolean
  id: string
}
type IOwnProps = RouteComponentProps<{
  tabId: string
  selectorId?: string
}>
export interface IQueryData {
  inProgressTab: GQLEventSearchResultSet
  notificationTab: GQLEventSearchResultSet
  reviewTab: GQLEventSearchResultSet
  rejectTab: GQLEventSearchResultSet
  approvalTab: GQLEventSearchResultSet
  printTab: GQLEventSearchResultSet
  externalValidationTab: GQLEventSearchResultSet
}

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

const BodyContainer = styled.div`
  margin-left: 0px;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 265px;
  }
`

interface IDispatchProps {
  goToPage: typeof goToPage
  goToReviewDuplicate: typeof goToReviewDuplicate
  goToPrintCertificate: typeof goToPrintCertificate
  goToEvents: typeof goToEvents
  updateRegistrarWorkqueue: typeof updateRegistrarWorkqueue
  updateFieldAgentDeclaredDeclarations: typeof updateFieldAgentDeclaredDeclarations
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
}

interface IOfficeHomeState {
  draftCurrentPage: number
  healthSystemCurrentPage: number
  progressCurrentPage: number
  reviewCurrentPage: number
  updatesCurrentPage: number
  approvalCurrentPage: number
  printCurrentPage: number
  externalValidationCurrentPage: number
  sentForReviewCurrentPage: number
  requireUpdatePage: number
  showCertificateToast: boolean
}

type IOfficeHomeProps = IntlShapeProps &
  IDispatchProps &
  IBaseOfficeHomeStateProps

export const EVENT_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  DECLARED: 'DECLARED',
  VALIDATED: 'VALIDATED',
  REGISTERED: 'REGISTERED',
  REJECTED: 'REJECTED',
  WAITING_VALIDATION: 'WAITING_VALIDATION'
}
export class OfficeHomeView extends React.Component<
  IOfficeHomeProps,
  IOfficeHomeState
> {
  pageSize = 10
  showPaginated = false
  interval: any = undefined
  role = this.props.userDetails && this.props.userDetails.role
  jurisdictionLocationId =
    this.props.userDetails &&
    getJurisdictionLocationIdFromUserDetails(this.props.userDetails)
  isFieldAgent = this.role
    ? FIELD_AGENT_ROLES.includes(this.role)
      ? true
      : false
    : false

  constructor(props: IOfficeHomeProps) {
    super(props)
    this.state = {
      draftCurrentPage: 1,
      healthSystemCurrentPage: 1,
      progressCurrentPage: 1,
      reviewCurrentPage: 1,
      updatesCurrentPage: 1,
      approvalCurrentPage: 1,
      printCurrentPage: 1,
      sentForReviewCurrentPage: 1,
      requireUpdatePage: 1,
      externalValidationCurrentPage: 1,
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
      this.isFieldAgent,
      Math.max(this.state.progressCurrentPage - 1, 0) * this.pageSize,
      Math.max(this.state.healthSystemCurrentPage - 1, 0) * this.pageSize,
      Math.max(this.state.reviewCurrentPage - 1, 0) * this.pageSize,
      Math.max(this.state.updatesCurrentPage - 1, 0) * this.pageSize,
      Math.max(this.state.approvalCurrentPage - 1, 0) * this.pageSize,
      Math.max(this.state.externalValidationCurrentPage - 1, 0) * this.pageSize,
      Math.max(this.state.printCurrentPage - 1, 0) * this.pageSize
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

  componentDidUpdate(prevProps: IOfficeHomeProps, prevState: IOfficeHomeState) {
    if (prevProps.tabId !== this.props.tabId) {
      this.setState({
        draftCurrentPage: 1,
        healthSystemCurrentPage: 1,
        progressCurrentPage: 1,
        reviewCurrentPage: 1,
        updatesCurrentPage: 1,
        approvalCurrentPage: 1,
        printCurrentPage: 1,
        sentForReviewCurrentPage: 1,
        requireUpdatePage: 1
      })
      if (!this.isFieldAgent) {
        this.syncWorkqueue()
      }
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
          this.setState({ progressCurrentPage: newPageNumber }, () => {
            this.syncWorkqueue()
          })
        } else if (
          this.props.selectorId &&
          this.props.selectorId === SELECTOR_ID.hospitalDrafts
        ) {
          this.setState({ healthSystemCurrentPage: newPageNumber }, () => {
            this.syncWorkqueue()
          })
        } else {
          this.setState({ draftCurrentPage: newPageNumber }, () => {
            this.syncWorkqueue()
          })
        }

        break
      case WORKQUEUE_TABS.readyForReview:
        this.setState({ reviewCurrentPage: newPageNumber }, () => {
          this.syncWorkqueue()
        })
        break
      case WORKQUEUE_TABS.requiresUpdateRegistrar:
        this.setState({ updatesCurrentPage: newPageNumber }, () => {
          this.syncWorkqueue()
        })
        break
      case WORKQUEUE_TABS.sentForApproval:
        this.setState({ approvalCurrentPage: newPageNumber }, () => {
          this.syncWorkqueue()
        })
        break
      case WORKQUEUE_TABS.readyToPrint:
        this.setState({ printCurrentPage: newPageNumber }, () => {
          this.syncWorkqueue()
        })
        break
      case WORKQUEUE_TABS.externalValidation:
        this.setState(
          { externalValidationCurrentPage: newPageNumber },
          this.syncWorkqueue
        )
        break
      case WORKQUEUE_TABS.requiresUpdateAgent:
        this.setState({ requireUpdatePage: newPageNumber })
        break
      case WORKQUEUE_TABS.sentForReview:
        this.setState({ sentForReviewCurrentPage: newPageNumber })
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
    updatesCurrentPage: number,
    approvalCurrentPage: number,
    printCurrentPage: number,
    externalValidationCurrentPage: number,
    sentForReviewCurrentPage: number,
    requireUpdatePage: number
  ) => {
    const {
      workqueue,
      tabId,
      drafts,
      selectorId,
      storedDeclarations,
      declarationsReadyToSend
    } = this.props
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
              search: `?locationId=${this.jurisdictionLocationId}`
            }}
          />
        )}
        <Navigation />
        <BodyContainer>
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
              {tabId === WORKQUEUE_TABS.requiresUpdateRegistrar && (
                <RequiresUpdateRegistrar
                  queryData={{
                    data: filteredData.rejectTab
                  }}
                  paginationId={updatesCurrentPage}
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
                <SentForApproval
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
                <SentForApproval
                  queryData={{
                    data: filteredData.reviewTab
                  }}
                  paginationId={approvalCurrentPage}
                  pageSize={this.pageSize}
                  onPageChange={this.onPageChange}
                  loading={loading}
                  error={error}
                />
              )}
              {tabId === WORKQUEUE_TABS.requiresUpdateAgent && (
                <RequiresUpdateRegistrar
                  queryData={{
                    data: filteredData.rejectTab
                  }}
                  paginationId={updatesCurrentPage}
                  pageSize={this.pageSize}
                  onPageChange={this.onPageChange}
                  loading={loading}
                  error={error}
                />
              )}
            </>
          )}
        </BodyContainer>
      </>
    )
  }

  render() {
    const { intl } = this.props
    const {
      draftCurrentPage,
      healthSystemCurrentPage,
      progressCurrentPage,
      reviewCurrentPage,
      updatesCurrentPage,
      approvalCurrentPage,
      printCurrentPage,
      sentForReviewCurrentPage,
      externalValidationCurrentPage,
      requireUpdatePage
    } = this.state

    return (
      <>
        <Header
          title={intl.formatMessage(navigationMessages[this.props.tabId])}
        />
        {this.getData(
          draftCurrentPage,
          healthSystemCurrentPage,
          progressCurrentPage,
          reviewCurrentPage,
          updatesCurrentPage,
          approvalCurrentPage,
          printCurrentPage,
          externalValidationCurrentPage,
          sentForReviewCurrentPage,
          requireUpdatePage
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
          <FloatingNotification
            id="print-cert-notification"
            type={NOTIFICATION_TYPE.SUCCESS}
            show={this.state.showCertificateToast}
            callback={() => {
              this.setState({ showCertificateToast: false })
            }}
          >
            {intl.formatMessage(certificateMessage.toastMessage)}
          </FloatingNotification>
        )}
      </>
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
    userDetails
  }
}
export const OfficeHome = connect<
  IBaseOfficeHomeStateProps,
  IDispatchProps,
  IOwnProps,
  IStoreState
>(mapStateToProps, {
  goToEvents,
  goToPage,
  goToReviewDuplicate,
  goToPrintCertificate,
  updateRegistrarWorkqueue,
  updateFieldAgentDeclaredDeclarations
})(injectIntl(OfficeHomeView))
