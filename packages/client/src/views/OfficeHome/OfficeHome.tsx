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
  updateRegistrarWorkqueue
} from '@client/declarations'
import { Header } from '@client/components/interface/Header/Header'
import { messages as certificateMessage } from '@client/i18n/messages/views/certificate'
import {
  goToEvents,
  goToPage,
  goToPrintCertificate,
  goToRegistrarHomeTab,
  goToReviewDuplicate
} from '@client/navigation'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import styled from '@client/styledComponents'
import { Scope } from '@client/utils/authUtils'
import { getUserLocation } from '@client/utils/userUtils'
import NotificationToast from '@client/views/OfficeHome/NotificationToast'
import {
  Button,
  FloatingActionButton,
  IButtonProps
} from '@opencrvs/components/lib/buttons'
import { PlusTransparentWhite } from '@opencrvs/components/lib/icons'
import { PAGE_TRANSITIONS_ENTER_TIME } from '@client/utils/constants'
import {
  FloatingNotification,
  NOTIFICATION_TYPE,
  Spinner
} from '@opencrvs/components/lib/interface'
import { GQLEventSearchResultSet } from '@opencrvs/gateway/src/graphql/schema'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { ApprovalTab } from './tabs/approvals/approvalTab'
import { InProgressTab } from './tabs/inProgress/inProgressTab'
import { PrintTab } from './tabs/print/printTab'
import { RejectTab } from './tabs/reject/rejectTab'
import { ReviewTab } from './tabs/review/reviewTab'
import { ExternalValidationTab } from './tabs/externalValidation/externalValidationTab'
import {
  Navigation,
  WORKQUEUE_TABS
} from '@client/components/interface/Navigation'

export interface IProps extends IButtonProps {
  active?: boolean
  disabled?: boolean
  id: string
}
type IOwnProps = RouteComponentProps<{ tabId: string; selectorId?: string }>
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
  goToRegistrarHomeTab: typeof goToRegistrarHomeTab
  goToReviewDuplicate: typeof goToReviewDuplicate
  goToPrintCertificate: typeof goToPrintCertificate
  goToEvents: typeof goToEvents
  updateRegistrarWorkqueue: typeof updateRegistrarWorkqueue
}

interface IBaseOfficeHomeStateProps {
  language: string
  scope: Scope | null
  registrarLocationId: string
  tabId: string
  selectorId: string
  drafts: IDeclaration[]
  declarations: IDeclaration[]
  workqueue: IWorkqueue
  storedDeclarations: IDeclaration[]
}

interface IOfficeHomeState {
  progressCurrentPage: number
  reviewCurrentPage: number
  updatesCurrentPage: number
  approvalCurrentPage: number
  printCurrentPage: number
  externalValidationCurrentPage: number
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
  constructor(props: IOfficeHomeProps) {
    super(props)
    this.state = {
      progressCurrentPage: 1,
      reviewCurrentPage: 1,
      updatesCurrentPage: 1,
      approvalCurrentPage: 1,
      printCurrentPage: 1,
      externalValidationCurrentPage: 1,
      showCertificateToast: Boolean(
        this.props.declarations.filter(
          (item) => item.submissionStatus === SUBMISSION_STATUS.READY_TO_CERTIFY
        ).length
      )
    }
  }

  syncWorkqueue() {
    this.props.updateRegistrarWorkqueue(
      this.state.progressCurrentPage * this.pageSize,
      this.state.reviewCurrentPage * this.pageSize,
      this.state.updatesCurrentPage * this.pageSize,
      this.state.approvalCurrentPage * this.pageSize,
      this.state.externalValidationCurrentPage * this.pageSize,
      this.state.printCurrentPage * this.pageSize,
      0,
      0,
      0,
      0,
      0,
      0
    )
  }

  componentDidMount() {
    setTimeout(() => {
      this.syncWorkqueue()
    }, PAGE_TRANSITIONS_ENTER_TIME)
    this.interval = setInterval(() => {
      this.syncWorkqueue()
    }, 300000)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  componentDidUpdate(prevProps: IOfficeHomeProps, prevState: IOfficeHomeState) {
    if (prevProps.tabId !== this.props.tabId) {
      this.setState({
        progressCurrentPage: 1,
        reviewCurrentPage: 1,
        updatesCurrentPage: 1,
        approvalCurrentPage: 1,
        printCurrentPage: 1
      })
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
        this.setState({ progressCurrentPage: newPageNumber }, () => {
          this.syncWorkqueue()
        })
        break
      case WORKQUEUE_TABS.readyForReview:
        this.setState({ reviewCurrentPage: newPageNumber }, () => {
          this.syncWorkqueue()
        })
        break
      case WORKQUEUE_TABS.sentForUpdates:
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
      default:
        throw new Error(`Unknown tab id when changing page ${this.props.tabId}`)
    }
  }

  getData = (
    progressCurrentPage: number,
    reviewCurrentPage: number,
    updatesCurrentPage: number,
    approvalCurrentPage: number,
    printCurrentPage: number,
    externalValidationCurrentPage: number
  ) => {
    const {
      workqueue,
      tabId,
      drafts,
      selectorId,
      registrarLocationId,
      storedDeclarations
    } = this.props
    const { loading, error, data } = workqueue
    const filteredData = filterProcessingDeclarationsFromQuery(
      data,
      storedDeclarations
    )

    return (
      <>
        <Navigation />
        <BodyContainer>
          {tabId === WORKQUEUE_TABS.inProgress && (
            <InProgressTab
              drafts={drafts}
              selectorId={selectorId}
              registrarLocationId={registrarLocationId}
              queryData={{
                inProgressData: filteredData.inProgressTab,
                notificationData: filteredData.notificationTab
              }}
              showPaginated={this.showPaginated}
              page={progressCurrentPage}
              onPageChange={this.onPageChange}
              loading={loading}
              error={error}
            />
          )}
          {tabId === WORKQUEUE_TABS.readyForReview && (
            <ReviewTab
              registrarLocationId={registrarLocationId}
              queryData={{
                data: filteredData.reviewTab
              }}
              showPaginated={this.showPaginated}
              page={reviewCurrentPage}
              onPageChange={this.onPageChange}
              loading={loading}
              error={error}
            />
          )}
          {tabId === WORKQUEUE_TABS.sentForUpdates && (
            <RejectTab
              registrarLocationId={registrarLocationId}
              queryData={{
                data: filteredData.rejectTab
              }}
              showPaginated={this.showPaginated}
              page={updatesCurrentPage}
              onPageChange={this.onPageChange}
              loading={loading}
              error={error}
            />
          )}

          {tabId === WORKQUEUE_TABS.externalValidation &&
            window.config.EXTERNAL_VALIDATION_WORKQUEUE && (
              <ExternalValidationTab
                registrarLocationId={registrarLocationId}
                queryData={{
                  data: filteredData.externalValidationTab
                }}
                showPaginated={this.showPaginated}
                page={externalValidationCurrentPage}
                onPageChange={this.onPageChange}
                loading={loading}
                error={error}
              />
            )}
          {tabId === WORKQUEUE_TABS.sentForApproval && (
            <ApprovalTab
              registrarLocationId={registrarLocationId}
              queryData={{
                data: filteredData.approvalTab
              }}
              showPaginated={this.showPaginated}
              page={approvalCurrentPage}
              onPageChange={this.onPageChange}
              loading={loading}
              error={error}
            />
          )}
          {tabId === WORKQUEUE_TABS.readyToPrint && (
            <PrintTab
              registrarLocationId={registrarLocationId}
              queryData={{
                data: filteredData.printTab
              }}
              showPaginated={this.showPaginated}
              page={printCurrentPage}
              onPageChange={this.onPageChange}
              loading={loading}
              error={error}
            />
          )}
        </BodyContainer>
      </>
    )
  }

  render() {
    const { intl } = this.props
    const {
      progressCurrentPage,
      reviewCurrentPage,
      updatesCurrentPage,
      approvalCurrentPage,
      printCurrentPage,
      externalValidationCurrentPage
    } = this.state

    return (
      <>
        <Header />
        {this.getData(
          progressCurrentPage,
          reviewCurrentPage,
          updatesCurrentPage,
          approvalCurrentPage,
          printCurrentPage,
          externalValidationCurrentPage
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
  props: RouteComponentProps<{ tabId: string; selectorId?: string }>
): IBaseOfficeHomeStateProps {
  const { match } = props
  const userDetails = getUserDetails(state)
  const registrarLocationId =
    (userDetails && getUserLocation(userDetails).id) || ''
  const scope = getScope(state)

  return {
    declarations: state.declarationsState.declarations,
    workqueue: state.workqueueState.workqueue,
    language: state.i18n.language,
    scope,
    registrarLocationId,
    tabId: (match && match.params && match.params.tabId) || 'review',
    selectorId: (match && match.params && match.params.selectorId) || '',
    storedDeclarations: state.declarationsState.declarations,
    drafts:
      (state.declarationsState.declarations &&
        state.declarationsState.declarations.filter(
          (declaration: IDeclaration) =>
            declaration.submissionStatus ===
            SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
        )) ||
      []
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
  goToRegistrarHomeTab,
  goToReviewDuplicate,
  goToPrintCertificate,
  updateRegistrarWorkqueue
})(injectIntl(OfficeHomeView))
