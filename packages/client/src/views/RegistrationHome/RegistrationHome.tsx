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
  Button,
  FloatingActionButton,
  IButtonProps,
  ICON_ALIGNMENT
} from '@opencrvs/components/lib/buttons'
import {
  PlusTransparentWhite,
  StatusGreen,
  StatusGray,
  StatusOrange,
  StatusProgress,
  StatusRejected
} from '@opencrvs/components/lib/icons'
import {
  ISearchInputProps,
  Spinner,
  TopBar,
  FloatingNotification,
  NOTIFICATION_TYPE
} from '@opencrvs/components/lib/interface'
import {
  IApplication,
  SUBMISSION_STATUS,
  filterProcessingApplicationsFromQuery,
  storeApplication,
  makeApplicationReadyToDownload,
  downloadApplication
} from '@client/applications'
import { Header } from '@client/components/interface/Header/Header'
import { IViewHeadingProps } from '@client/components/ViewHeading'
import {
  goToEvents as goToEventsAction,
  goToPage as goToPageAction,
  goToPrintCertificate as goToPrintCertificateAction,
  goToRegistrarHomeTab as goToRegistrarHomeTabAction,
  goToReviewDuplicate as goToReviewDuplicateAction
} from '@client/navigation'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import styled, { ITheme, withTheme } from '@client/styledComponents'
import { Scope } from '@client/utils/authUtils'
import { getUserLocation, IUserDetails } from '@client/utils/userUtils'
import NotificationToast from '@client/views/RegistrationHome/NotificationToast'
import { REGISTRATION_HOME_QUERY } from '@client/views/RegistrationHome/queries'
import { RowHistoryView } from '@client/views/RegistrationHome/RowHistoryView'
import * as React from 'react'
import { Query } from '@client/components/Query'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { InProgressTab } from './tabs/inProgress/inProgressTab'
import { PrintTab } from './tabs/print/printTab'
import { RejectTab } from './tabs/reject/rejectTab'
import { ReviewTab } from './tabs/review/reviewTab'
import { ApprovalTab } from './tabs/approvals/approvalTab'
import { errorMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/registrarHome'
import { messages as certificateMessage } from '@client/i18n/messages/views/certificate'
import { GQLEventSearchResultSet } from '@opencrvs/gateway/src/graphql/schema'
import { Event, Action } from '@client/forms'
import { withApollo } from 'react-apollo'
import ApolloClient from 'apollo-client'

export interface IProps extends IButtonProps {
  active?: boolean
  disabled?: boolean
  id: string
}

export interface IQueryData {
  inProgressTab: GQLEventSearchResultSet
  notificationTab: GQLEventSearchResultSet
  reviewTab: GQLEventSearchResultSet
  rejectTab: GQLEventSearchResultSet
  approvalTab: GQLEventSearchResultSet
  printTab: GQLEventSearchResultSet
}

export const IconTab = styled(Button)<IProps>`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.subtitleStyle};
  padding-left: 0;
  padding-right: 0;
  border-radius: 0;
  flex-shrink: 0;
  outline: none;
  margin-left: 16px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin-left: 8px;
  }
  ${({ active }) =>
    active
      ? 'border-bottom: 3px solid #5E93ED'
      : 'border-bottom: 3px solid transparent'};
  & > div {
    padding: 0 8px;
  }
  :first-child > div {
    position: relative;
    padding-left: 0;
  }
  & div > div {
    margin-right: 8px;
  }
  &:focus {
    outline: none;
    background: ${({ theme }) => theme.colors.focus};
    color: ${({ theme }) => theme.colors.copy};
  }
  &:not([data-focus-visible-added]) {
    background: transparent;
    outline: none;
    color: ${({ theme }) => theme.colors.copy};
  }
`
export const StyledSpinner = styled(Spinner)`
  margin: 20% auto;
`
export const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  ${({ theme }) => theme.fonts.bodyStyle};
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

interface IBaseRegistrationHomeProps {
  theme: ITheme
  language: string
  scope: Scope | null
  userDetails: IUserDetails | null
  goToPage: typeof goToPageAction
  goToRegistrarHomeTab: typeof goToRegistrarHomeTabAction
  goToReviewDuplicate: typeof goToReviewDuplicateAction
  goToPrintCertificate: typeof goToPrintCertificateAction
  downloadApplication: typeof downloadApplication
  tabId: string
  selectorId: string
  drafts: IApplication[]
  applications: IApplication[]
  goToEvents: typeof goToEventsAction
  storedApplications: IApplication[]
  client: ApolloClient<{}>
}

interface IRegistrationHomeState {
  progressCurrentPage: number
  reviewCurrentPage: number
  updatesCurrentPage: number
  approvalCurrentPage: number
  printCurrentPage: number
  showCertificateToast: boolean
}

type IRegistrationHomeProps = IntlShapeProps &
  IViewHeadingProps &
  ISearchInputProps &
  IBaseRegistrationHomeProps

const TAB_ID = {
  inProgress: 'progress',
  readyForReview: 'review',
  sentForUpdates: 'updates',
  sentForApproval: 'approvals',
  readyForPrint: 'print'
}

export const EVENT_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  DECLARED: 'DECLARED',
  VALIDATED: 'VALIDATED',
  REGISTERED: 'REGISTERED',
  REJECTED: 'REJECTED'
}
export class RegistrationHomeView extends React.Component<
  IRegistrationHomeProps,
  IRegistrationHomeState
> {
  pageSize = 10
  constructor(props: IRegistrationHomeProps) {
    super(props)
    this.state = {
      progressCurrentPage: 1,
      reviewCurrentPage: 1,
      updatesCurrentPage: 1,
      approvalCurrentPage: 1,
      printCurrentPage: 1,
      showCertificateToast: Boolean(
        this.props.applications.filter(
          item => item.submissionStatus === SUBMISSION_STATUS.READY_TO_CERTIFY
        ).length
      )
    }
  }

  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
  }
  userHasValidateScope() {
    return this.props.scope && this.props.scope.includes('validate')
  }

  renderExpandedComponent = (itemId: string) => {
    return <RowHistoryView eventId={itemId} />
  }

  subtractApplicationsWithStatus(count: number, status: string[]) {
    const outboxCount = this.props.storedApplications.filter(
      app => app.submissionStatus && status.includes(app.submissionStatus)
    ).length
    return count - outboxCount
  }

  onPageChange = (newPageNumber: number) => {
    switch (this.props.tabId) {
      case TAB_ID.inProgress:
        this.setState({ progressCurrentPage: newPageNumber })
        break
      case TAB_ID.readyForReview:
        this.setState({ reviewCurrentPage: newPageNumber })
        break
      case TAB_ID.sentForUpdates:
        this.setState({ updatesCurrentPage: newPageNumber })
        break
      case TAB_ID.sentForApproval:
        this.setState({ approvalCurrentPage: newPageNumber })
        break
      case TAB_ID.readyForPrint:
        this.setState({ printCurrentPage: newPageNumber })
        break
      default:
        throw new Error(`Unknown tab id when changing page ${this.props.tabId}`)
    }
  }

  downloadApplication = (
    event: string,
    compositionId: string,
    action: Action
  ) => {
    const downloadableApplication = makeApplicationReadyToDownload(
      event.toLowerCase() as Event,
      compositionId,
      action
    )
    this.props.downloadApplication(downloadableApplication, this.props.client)
  }

  render() {
    const {
      theme,
      intl,
      userDetails,
      tabId,
      selectorId,
      drafts,
      storedApplications
    } = this.props
    const {
      progressCurrentPage,
      reviewCurrentPage,
      updatesCurrentPage,
      approvalCurrentPage,
      printCurrentPage
    } = this.state
    const registrarLocationId = userDetails && getUserLocation(userDetails).id

    const reviewStatuses = this.userHasRegisterScope()
      ? [EVENT_STATUS.DECLARED, EVENT_STATUS.VALIDATED]
      : [EVENT_STATUS.DECLARED]

    return (
      <>
        <Header />
        <Query
          query={REGISTRATION_HOME_QUERY}
          variables={{
            locationIds: [registrarLocationId],
            count: 10,
            reviewStatuses: reviewStatuses,
            inProgressSkip: (progressCurrentPage - 1) * 10,
            reviewSkip: (reviewCurrentPage - 1) * 10,
            rejectSkip: (updatesCurrentPage - 1) * 10,
            approvalSkip: (approvalCurrentPage - 1) * 10,
            printSkip: (printCurrentPage - 1) * 10
          }}
          pollInterval={window.config.UI_POLLING_INTERVAL}
        >
          {({
            loading,
            error,
            data
          }: {
            loading: boolean
            error?: Error
            data: IQueryData
          }) => {
            if (loading) {
              return (
                <StyledSpinner
                  id="search-result-spinner"
                  baseColor={theme.colors.background}
                />
              )
            }
            if (!data && error) {
              return (
                <ErrorText id="search-result-error-text-count">
                  {intl.formatMessage(errorMessages.queryError)}
                </ErrorText>
              )
            }

            const filteredData = filterProcessingApplicationsFromQuery(
              data,
              storedApplications
            )

            return (
              <>
                <TopBar>
                  <IconTab
                    id={`tab_${TAB_ID.inProgress}`}
                    key={TAB_ID.inProgress}
                    active={tabId === TAB_ID.inProgress}
                    align={ICON_ALIGNMENT.LEFT}
                    icon={() => <StatusProgress />}
                    onClick={() =>
                      this.props.goToRegistrarHomeTab(TAB_ID.inProgress)
                    }
                  >
                    {intl.formatMessage(messages.inProgress)} (
                    {drafts.filter(
                      draft =>
                        draft.submissionStatus ===
                        SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
                    ).length +
                      (filteredData.inProgressTab.totalItems || 0) +
                      (filteredData.notificationTab.totalItems || 0)}
                    )
                  </IconTab>
                  <IconTab
                    id={`tab_${TAB_ID.readyForReview}`}
                    key={TAB_ID.readyForReview}
                    active={tabId === TAB_ID.readyForReview}
                    align={ICON_ALIGNMENT.LEFT}
                    icon={() => <StatusOrange />}
                    onClick={() =>
                      this.props.goToRegistrarHomeTab(TAB_ID.readyForReview)
                    }
                  >
                    {intl.formatMessage(messages.readyForReview)} (
                    {filteredData.reviewTab.totalItems})
                  </IconTab>
                  <IconTab
                    id={`tab_${TAB_ID.sentForUpdates}`}
                    key={TAB_ID.sentForUpdates}
                    active={tabId === TAB_ID.sentForUpdates}
                    align={ICON_ALIGNMENT.LEFT}
                    icon={() => <StatusRejected />}
                    onClick={() =>
                      this.props.goToRegistrarHomeTab(TAB_ID.sentForUpdates)
                    }
                  >
                    {intl.formatMessage(messages.sentForUpdates)} (
                    {filteredData.rejectTab.totalItems})
                  </IconTab>
                  {this.userHasValidateScope() && (
                    <IconTab
                      id={`tab_${TAB_ID.sentForApproval}`}
                      key={TAB_ID.sentForApproval}
                      active={tabId === TAB_ID.sentForApproval}
                      align={ICON_ALIGNMENT.LEFT}
                      icon={() => <StatusGray />}
                      onClick={() =>
                        this.props.goToRegistrarHomeTab(TAB_ID.sentForApproval)
                      }
                    >
                      {intl.formatMessage(messages.sentForApprovals)} (
                      {filteredData.approvalTab.totalItems})
                    </IconTab>
                  )}
                  <IconTab
                    id={`tab_${TAB_ID.readyForPrint}`}
                    key={TAB_ID.readyForPrint}
                    active={tabId === TAB_ID.readyForPrint}
                    align={ICON_ALIGNMENT.LEFT}
                    icon={() => <StatusGreen />}
                    onClick={() =>
                      this.props.goToRegistrarHomeTab(TAB_ID.readyForPrint)
                    }
                  >
                    {intl.formatMessage(messages.readyToPrint)} (
                    {filteredData.printTab.totalItems})
                  </IconTab>
                </TopBar>
                {tabId === TAB_ID.inProgress && (
                  <InProgressTab
                    drafts={drafts}
                    selectorId={selectorId}
                    registrarLocationId={registrarLocationId}
                    queryData={{
                      inProgressData: filteredData.inProgressTab,
                      notificationData: filteredData.notificationTab
                    }}
                    page={progressCurrentPage}
                    onPageChange={this.onPageChange}
                    onDownloadApplication={this.downloadApplication}
                  />
                )}
                {tabId === TAB_ID.readyForReview && (
                  <ReviewTab
                    registrarLocationId={registrarLocationId}
                    queryData={{
                      data: filteredData.reviewTab
                    }}
                    page={reviewCurrentPage}
                    onPageChange={this.onPageChange}
                    onDownloadApplication={this.downloadApplication}
                  />
                )}
                {tabId === TAB_ID.sentForUpdates && (
                  <RejectTab
                    registrarLocationId={registrarLocationId}
                    queryData={{
                      data: filteredData.rejectTab
                    }}
                    page={updatesCurrentPage}
                    onPageChange={this.onPageChange}
                    onDownloadApplication={this.downloadApplication}
                  />
                )}
                {tabId === TAB_ID.sentForApproval && (
                  <ApprovalTab
                    registrarLocationId={registrarLocationId}
                    queryData={{
                      data: filteredData.approvalTab
                    }}
                    page={approvalCurrentPage}
                    onPageChange={this.onPageChange}
                  />
                )}
                {tabId === TAB_ID.readyForPrint && (
                  <PrintTab
                    registrarLocationId={registrarLocationId}
                    queryData={{
                      data: filteredData.printTab
                    }}
                    page={printCurrentPage}
                    onPageChange={this.onPageChange}
                    onDownloadApplication={this.downloadApplication}
                  />
                )}
              </>
            )
          }}
        </Query>

        <FABContainer>
          <FloatingActionButton
            id="new_event_declaration"
            onClick={this.props.goToEvents}
            icon={() => <PlusTransparentWhite />}
          />
        </FABContainer>
        <NotificationToast />

        {this.state.showCertificateToast && (
          <FloatingNotification
            type={NOTIFICATION_TYPE.SUCCESS}
            show={this.state.showCertificateToast}
            callback={() => {
              this.setState({ showCertificateToast: false })
            }}
          >
            {intl.formatHTMLMessage(certificateMessage.toastMessage)}
          </FloatingNotification>
        )}
      </>
    )
  }
}

function mapStateToProps(
  state: IStoreState,
  props: RouteComponentProps<{ tabId: string; selectorId?: string }>
) {
  const { match } = props

  return {
    applications: state.applicationsState.applications,
    language: state.i18n.language,
    scope: getScope(state),
    userDetails: getUserDetails(state),
    tabId: (match && match.params && match.params.tabId) || 'review',
    selectorId: (match && match.params && match.params.selectorId) || '',
    storedApplications: state.applicationsState.applications,
    drafts:
      (state.applicationsState.applications &&
        state.applicationsState.applications.filter(
          (application: IApplication) =>
            application.submissionStatus ===
            SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
        )) ||
      []
  }
}

export const RegistrationHome = connect(
  mapStateToProps,
  {
    goToEvents: goToEventsAction,
    goToPage: goToPageAction,
    goToRegistrarHomeTab: goToRegistrarHomeTabAction,
    goToReviewDuplicate: goToReviewDuplicateAction,
    goToPrintCertificate: goToPrintCertificateAction,
    downloadApplication
  }
)(injectIntl(withTheme(withApollo(RegistrationHomeView))))
