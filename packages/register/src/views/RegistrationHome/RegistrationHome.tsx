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
import { IApplication, SUBMISSION_STATUS } from '@register/applications'
import { Header } from '@register/components/interface/Header/Header'
import { IViewHeadingProps } from '@register/components/ViewHeading'
import {
  goToEvents as goToEventsAction,
  goToPage as goToPageAction,
  goToPrintCertificate as goToPrintCertificateAction,
  goToRegistrarHomeTab as goToRegistrarHomeTabAction,
  goToReviewDuplicate as goToReviewDuplicateAction
} from '@register/navigation'
import { getScope, getUserDetails } from '@register/profile/profileSelectors'
import { IStoreState } from '@register/store'
import styled, { ITheme, withTheme } from '@register/styledComponents'
import { Scope } from '@register/utils/authUtils'
import { getUserLocation, IUserDetails } from '@register/utils/userUtils'
import NotificationToast from '@register/views/RegistrationHome/NotificationToast'
import {
  COUNT_EVENT_REGISTRATION_BY_STATUS,
  COUNT_REGISTRATION_QUERY
} from '@register/views/RegistrationHome/queries'
import { RowHistoryView } from '@register/views/RegistrationHome/RowHistoryView'
import * as Sentry from '@sentry/browser'
import * as React from 'react'
import { Query } from 'react-apollo'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { InProgressTab } from './tabs/inProgress/inProgressTab'
import { PrintTab } from './tabs/print/printTab'
import { RejectTab } from './tabs/reject/rejectTab'
import { ReviewTab } from './tabs/review/reviewTab'
import { ApprovalTab } from './tabs/approvals/approvalTab'
import { errorMessages } from '@register/i18n/messages'
import { messages } from '@register/i18n/messages/views/registrarHome'
import { messages as certificateMessage } from '@register/i18n/messages/views/certificate'

export interface IProps extends IButtonProps {
  active?: boolean
  disabled?: boolean
  id: string
}

export const IconTab = styled(Button).attrs<IProps>({})`
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
    outline: 0;
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
  tabId: string
  selectorId: string
  drafts: IApplication[]
  applications: IApplication[]
  goToEvents: typeof goToEventsAction
  outboxApplications: IApplication[]
}

interface IRegistrationHomeState {
  reviewCurrentPage: number
  updatesCurrentPage: number
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
      reviewCurrentPage: 1,
      updatesCurrentPage: 1,
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

  renderInProgressTabWithCount = (
    tabId: string,
    drafts: IApplication[],
    registrarLocationId: string
  ) => {
    const { intl } = this.props

    return (
      <Query
        query={COUNT_EVENT_REGISTRATION_BY_STATUS}
        variables={{
          locationIds: [registrarLocationId],
          status: EVENT_STATUS.IN_PROGRESS
        }}
      >
        {({
          loading,
          error,
          data
        }: {
          loading: any
          error?: any
          data: any
        }) => {
          if (error) {
            Sentry.captureException(error)
            return (
              <ErrorText id="search-result-error-text-count">
                {intl.formatMessage(errorMessages.queryError)}
              </ErrorText>
            )
          }

          return (
            <IconTab
              id={`tab_${TAB_ID.inProgress}`}
              key={TAB_ID.inProgress}
              active={tabId === TAB_ID.inProgress}
              align={ICON_ALIGNMENT.LEFT}
              icon={() => <StatusProgress />}
              onClick={() => this.props.goToRegistrarHomeTab(TAB_ID.inProgress)}
            >
              {intl.formatMessage(messages.inProgress)} (
              {(drafts &&
                drafts.filter(
                  draft =>
                    draft.submissionStatus ===
                    SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
                ).length +
                  ((data &&
                    data.countEventRegistrationsByStatus &&
                    data.countEventRegistrationsByStatus.count) ||
                    0)) ||
                0}
              )
            </IconTab>
          )
        }}
      </Query>
    )
  }

  onPageChange = (newPageNumber: number) => {
    if (this.props.tabId === TAB_ID.readyForReview) {
      this.setState({ reviewCurrentPage: newPageNumber })
    }
    if (this.props.tabId === TAB_ID.sentForUpdates) {
      this.setState({ updatesCurrentPage: newPageNumber })
    }
  }

  renderExpandedComponent = (itemId: string) => {
    return <RowHistoryView eventId={itemId} />
  }

  count(count: number, status: string[]) {
    const outboxCount = this.props.outboxApplications.filter(
      app => app.submissionStatus && status.includes(app.submissionStatus)
    ).length
    return count - outboxCount
  }
  render() {
    const { theme, intl, userDetails, tabId, selectorId, drafts } = this.props
    const registrarLocationId = userDetails && getUserLocation(userDetails).id

    let parentQueryLoading = false

    return (
      <>
        <Header />
        <Query
          query={COUNT_REGISTRATION_QUERY}
          variables={{
            locationIds: [registrarLocationId]
          }}
        >
          {({
            loading,
            error,
            data
          }: {
            loading: any
            error?: any
            data: any
          }) => {
            if (loading) {
              parentQueryLoading = true
              return (
                <StyledSpinner
                  id="search-result-spinner"
                  baseColor={theme.colors.background}
                />
              )
            }
            parentQueryLoading = false
            if (error) {
              Sentry.captureException(error)
              return (
                <ErrorText id="search-result-error-text-count">
                  {intl.formatMessage(errorMessages.queryError)}
                </ErrorText>
              )
            }

            const declaredCount = this.count(data.countEvents.declared, [
              SUBMISSION_STATUS.READY_TO_REGISTER,
              SUBMISSION_STATUS.REGISTERING
            ])

            return (
              <>
                <TopBar>
                  {this.renderInProgressTabWithCount(
                    tabId,
                    drafts,
                    registrarLocationId as string
                  )}
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
                    {this.userHasRegisterScope()
                      ? declaredCount + data.countEvents.validated
                      : declaredCount}
                    )
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
                    {data.countEvents.rejected})
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
                      {data.countEvents.validated})
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
                    {data.countEvents.registered})
                  </IconTab>
                </TopBar>
              </>
            )
          }}
        </Query>
        {tabId === TAB_ID.inProgress && (
          <InProgressTab
            drafts={drafts}
            selectorId={selectorId}
            registrarLocationId={registrarLocationId}
            parentQueryLoading={parentQueryLoading}
          />
        )}
        {tabId === TAB_ID.readyForReview && (
          <ReviewTab
            registrarLocationId={registrarLocationId}
            parentQueryLoading={parentQueryLoading}
          />
        )}
        {tabId === TAB_ID.sentForUpdates && (
          <RejectTab
            registrarLocationId={registrarLocationId}
            parentQueryLoading={parentQueryLoading}
          />
        )}
        {tabId === TAB_ID.sentForApproval && (
          <ApprovalTab
            registrarLocationId={registrarLocationId}
            parentQueryLoading={parentQueryLoading}
          />
        )}
        {tabId === TAB_ID.readyForPrint && (
          <PrintTab
            registrarLocationId={registrarLocationId}
            parentQueryLoading={parentQueryLoading}
          />
        )}
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
    outboxApplications: state.applicationsState.applications,
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
    goToPrintCertificate: goToPrintCertificateAction
  }
)(injectIntl(withTheme(RegistrationHomeView)))
