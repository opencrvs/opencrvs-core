import * as React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { IApplication, SUBMISSION_STATUS } from '@register/applications'
import {
  goToPage as goToPageAction,
  goBack as goBackAction,
  goToPrintCertificate as goToPrintCertificateAction
} from '@register/navigation'
import { getUserDetails, getScope } from '@register/profile/profileSelectors'
import { IStoreState } from '@register/store'
import { IUserDetails } from '@register/utils/userUtils'
import {
  StatusProgress,
  StatusOrange,
  StatusGreen,
  StatusCollected,
  StatusRejected,
  StatusFailed
} from '@opencrvs/components/lib/icons'
import { SubPage, Spinner } from '@opencrvs/components/lib/interface'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { getDraftApplicantFullName } from '@register/utils/draftUtils'
import styled, { withTheme, ITheme } from '@register/styledComponents'
import {
  createNamesMap,
  extractCommentFragmentValue
} from '@register/utils/data-formatting'
import { formatLongDate } from '@register/utils/date-formatting'
import {
  GQLHumanName,
  GQLQuery,
  GQLPerson,
  GQLRegStatus,
  GQLComment
} from '@opencrvs/gateway/src/graphql/schema.d'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { Event } from '@opencrvs/register/src/forms'
import {
  DRAFT_BIRTH_PARENT_FORM_PAGE,
  DRAFT_DEATH_FORM_PAGE,
  REVIEW_EVENT_PARENT_FORM_PAGE
} from '@register/navigation/routes'
import { Query } from 'react-apollo'
import { FETCH_REGISTRATION_BY_COMPOSITION } from '@register/views/Home/queries'
import * as Sentry from '@sentry/browser'
import {
  userMessages,
  constantsMessages as messages,
  buttonMessages,
  errorMessages
} from '@register/i18n/messages'
import {
  REJECTED,
  IN_PROGRESS,
  DECLARED,
  REJECT_REASON,
  REJECT_COMMENTS,
  REGISTERED,
  VALIDATED
} from '@register/utils/constants'
import { Scope } from '@register/utils/authUtils'

const HistoryWrapper = styled.div`
  padding: 10px 0px 10px 10px;
  margin-bottom: 8px;
  flex: 1;
  display: flex;
  flex-direction: row;
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.bodyStyle};
  &:last-of-type {
    margin-bottom: 0;
  }
`
const StyledLabel = styled.label`
  margin-right: 3px;
`
const StyledValue = styled.span`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
`
const Separator = styled.div`
  height: 20px;
  width: 1px;
  margin: 1px 8px;
  background: ${({ theme }) => theme.colors.copy};
`
const ValueContainer = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
`
const StatusContainer = styled.div`
  flex: 1;
  margin-left: 16px;
`
const ActionButton = styled(PrimaryButton)`
  margin: 6px 50px 30px;
`
const QuerySpinner = styled(Spinner)`
  width: 70px;
  height: 70px;
  top: 150px !important;
`
const SpinnerContainer = styled.div`
  min-height: 70px;
  min-width: 70px;
  display: flex;
  justify-content: center;
`
const StatusIcon = styled.div`
  margin-top: 3px;
`

enum DraftStatus {
  DRAFT_STARTED = 'DRAFT_STARTED',
  DRAFT_MODIFIED = 'DRAFT_MODIFIED',
  FAILED = 'FAILED'
}

interface IDetailProps {
  theme: ITheme
  language: string
  applicationId: string
  draft: IApplication | null
  userDetails: IUserDetails | null
  goToPage: typeof goToPageAction
  goBack: typeof goBackAction
  goToPrintCertificate: typeof goToPrintCertificateAction
  scope: Scope | null
}

interface IStatus {
  type: DraftStatus | GQLRegStatus | null
  practitionerName: string
  timestamp: string | null
  practitionerRole: string
  officeName: string | Array<string | null> | null
  trackingId?: string
  contactNumber?: string
  rejectReason?: string
  rejectComment?: string
}

interface IHistoryData {
  title?: string
  history: IStatus[]
  action?: React.ReactElement
}

function LabelValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <StyledLabel>{label}:</StyledLabel>
      <StyledValue>{value}</StyledValue>
    </div>
  )
}
function ValuesWithSeparator(props: {
  strings: string[]
  separator: React.ReactNode
}): JSX.Element {
  return (
    <ValueContainer>
      {props.strings.map((value, index) => {
        return (
          <React.Fragment key={index}>
            {value}
            {index < props.strings.length - 1 && value.length > 0
              ? props.separator
              : null}
          </React.Fragment>
        )
      })}
    </ValueContainer>
  )
}

function generateHistoryEntry(
  type: DraftStatus | GQLRegStatus | null,
  name: GQLHumanName[] | null,
  date: string,
  role: string,
  office: string,
  language: string = 'en',
  trackingId?: string,
  contactNumber?: string,
  rejectReason?: string,
  rejectComment?: string
): IStatus {
  return {
    type,
    practitionerName:
      (name && (createNamesMap(name)[language] as string)) || '',
    timestamp: date && formatLongDate(date, language, 'LL'),
    practitionerRole: role,
    officeName: office,
    trackingId,
    contactNumber,
    rejectReason,
    rejectComment
  }
}

class DetailView extends React.Component<IDetailProps & IntlShapeProps> {
  getWorkflowDateLabel = (status: string) => {
    switch (status) {
      case 'DRAFT_STARTED':
        return messages.applicationStartedOn
      case 'DRAFT_MODIFIED':
        return messages.applicationUpdatedOn
      case 'FAILED':
        return messages.applicationFailedOn
      case 'DECLARED':
        return messages.applicationSubmittedOn
      case 'REGISTERED':
        return messages.applicationRegisteredOn
      case 'REJECTED':
        return messages.applicationRejectedOn
      case 'CERTIFIED':
        return messages.applicationCollectedOn
      default:
        return messages.applicationSubmittedOn
    }
  }
  getWorkflowStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT_STARTED':
        return <StatusProgress />
      case 'DRAFT_MODIFIED':
        return <StatusProgress />
      case 'FAILED':
        return (
          <StatusIcon>
            <StatusFailed />
          </StatusIcon>
        )
      case 'DECLARED':
        return (
          <StatusIcon>
            <StatusOrange />
          </StatusIcon>
        )
      case 'REGISTERED':
        return (
          <StatusIcon>
            <StatusGreen />
          </StatusIcon>
        )
      case 'REJECTED':
        return (
          <StatusIcon>
            <StatusRejected />
          </StatusIcon>
        )
      case 'CERTIFIED':
        return (
          <StatusIcon>
            <StatusCollected />
          </StatusIcon>
        )
      default:
        return (
          <StatusIcon>
            <StatusOrange />
          </StatusIcon>
        )
    }
  }

  userHasRegisterOrValidateScope() {
    return (
      this.props.scope &&
      (this.props.scope.includes('register') ||
        this.props.scope.includes('validate'))
    )
  }

  generateDraftHistoryData = (): IHistoryData => {
    const { draft, userDetails } = this.props
    const history: IStatus[] = []
    let action: React.ReactElement
    if (
      draft &&
      draft.submissionStatus === SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
    ) {
      if (draft.modifiedOn && userDetails) {
        history.push(
          generateHistoryEntry(
            DraftStatus.DRAFT_MODIFIED,
            userDetails.name as GQLHumanName[],
            new Date(draft.modifiedOn).toISOString(),
            userDetails && userDetails.role
              ? this.props.intl.formatMessage(
                  userMessages[userDetails.role as string]
                )
              : '',
            (userDetails &&
              userDetails.primaryOffice &&
              userDetails.primaryOffice.name) ||
              '',
            this.props.language
          )
        )
      }
      if (userDetails) {
        history.push(
          generateHistoryEntry(
            DraftStatus.DRAFT_STARTED,
            userDetails.name as GQLHumanName[],
            (draft.savedOn && new Date(draft.savedOn).toISOString()) || '',
            userDetails && userDetails.role
              ? this.props.intl.formatMessage(
                  userMessages[userDetails.role as string]
                )
              : '',
            (userDetails &&
              userDetails.primaryOffice &&
              userDetails.primaryOffice.name) ||
              '',
            this.props.language
          )
        )
      }
      const pageRoute =
        draft.event === Event.BIRTH
          ? DRAFT_BIRTH_PARENT_FORM_PAGE
          : DRAFT_DEATH_FORM_PAGE
      action = (
        <ActionButton
          id="draft_update"
          onClick={() =>
            this.props.goToPage(
              pageRoute,
              draft.id,
              'preview',
              (draft.event && draft.event.toString()) || ''
            )
          }
        >
          {this.props.intl.formatMessage(messages.update)}
        </ActionButton>
      )
    } else {
      history.push(generateHistoryEntry(DraftStatus.FAILED, null, '', '', ''))
      action = (
        <ActionButton id="failed_retry" disabled>
          {this.props.intl.formatMessage(buttonMessages.retry)}
        </ActionButton>
      )
    }
    let title = ''
    if (draft) {
      title = getDraftApplicantFullName(draft, this.props.language)
    }
    return {
      title: title !== '' ? title : undefined,
      history,
      action
    }
  }

  getActionForStateAndScope = (
    event: string | undefined,
    id: string | undefined,
    applicationState: DraftStatus | GQLRegStatus | null
  ) => {
    if (
      applicationState === REJECTED &&
      !this.userHasRegisterOrValidateScope()
    ) {
      return (
        <ActionButton id="reject_update" disabled>
          {this.props.intl.formatMessage(messages.update)}
        </ActionButton>
      )
    } else if (
      applicationState === REGISTERED.toUpperCase() &&
      this.userHasRegisterOrValidateScope()
    ) {
      return (
        <ActionButton
          id="registrar_print"
          onClick={() =>
            this.props.goToPrintCertificate(
              (id && id.toString()) || '',
              (event && event.toLocaleLowerCase()) || ''
            )
          }
        >
          {this.props.intl.formatMessage(buttonMessages.print)}
        </ActionButton>
      )
    } else if (
      (applicationState === IN_PROGRESS ||
        applicationState === DECLARED ||
        applicationState === VALIDATED ||
        applicationState === REJECTED) &&
      this.userHasRegisterOrValidateScope()
    ) {
      return (
        <ActionButton
          id="registrar_update"
          onClick={() =>
            this.props.goToPage(
              REVIEW_EVENT_PARENT_FORM_PAGE,
              (id && id.toString()) || '',
              'review',
              (event && event.toString()) || ''
            )
          }
        >
          {this.props.intl.formatMessage(buttonMessages.review)}
        </ActionButton>
      )
    } else {
      return undefined
    }
  }

  generateGqlHistorData = (data: GQLQuery): IHistoryData => {
    const registration =
      data.fetchRegistration && data.fetchRegistration.registration
    // @ts-ignore
    const informant = data.fetchRegistration && data.fetchRegistration.informant

    const history: IStatus[] =
      (registration &&
        registration.status &&
        registration.status.map((status, i) => {
          return generateHistoryEntry(
            (status && status.type) || null,
            (status && status.user && (status.user.name as GQLHumanName[])) ||
              null,
            (status && status.timestamp) || '',
            status && status.user && status.user.role
              ? this.props.intl.formatMessage(
                  userMessages[status.user.role as string]
                )
              : '',
            this.props.language === 'en'
              ? (status &&
                  status.office &&
                  status.office.name &&
                  (status.office.name as string)) ||
                  ''
              : (status &&
                  status.office &&
                  status.office.alias &&
                  status.office.alias.toString()) ||
                  '',
            this.props.language,
            registration && registration.trackingId,
            (registration && registration.contactPhoneNumber) ||
              (informant &&
                informant.individual.telecom &&
                informant.individual.telecom[0] &&
                informant.individual.telecom[0].value),
            status && status.type === REJECTED
              ? extractCommentFragmentValue(
                  status.comments as GQLComment[],
                  REJECT_REASON
                )
              : undefined,
            status && status.type === REJECTED
              ? extractCommentFragmentValue(
                  status.comments as GQLComment[],
                  REJECT_COMMENTS
                )
              : undefined
          )
        })) ||
      []
    const applicationState = history.length > 0 ? history[0].type : null
    const applicant: GQLPerson =
      // @ts-ignore
      (data.fetchRegistration && data.fetchRegistration.child) ||
      // @ts-ignore
      (data.fetchRegistration && data.fetchRegistration.deceased) ||
      null

    const event =
      registration && registration.type && (registration.type as string)
    const id =
      data.fetchRegistration &&
      data.fetchRegistration.id &&
      (data.fetchRegistration.id as string)
    return {
      title:
        (applicant &&
          applicant.name &&
          (createNamesMap(applicant.name as GQLHumanName[])[
            this.props.language
          ] as string)) ||
        '',
      history,
      action: applicationState
        ? this.getActionForStateAndScope(event, id, applicationState)
        : undefined
    }
  }

  renderHistory(statuses: IStatus[]): JSX.Element[] | null {
    return (
      (
        statuses &&
        statuses.map((status, i) => {
          const { practitionerName, practitionerRole, officeName } = status
          return (
            <HistoryWrapper key={i} id={`history_row_${i}_${status.type}`}>
              {this.getWorkflowStatusIcon(status.type as string)}
              <StatusContainer>
                <LabelValue
                  label={this.props.intl.formatMessage(
                    this.getWorkflowDateLabel(status.type as string)
                  )}
                  value={status.timestamp || ''}
                />
                {(status.type === DraftStatus.FAILED && (
                  <StyledLabel>
                    {this.props.intl.formatMessage(errorMessages.draftFailed)}
                  </StyledLabel>
                )) || (
                  <ValueContainer>
                    <ValuesWithSeparator
                      strings={[
                        `${this.props.intl.formatMessage(
                          messages.by
                        )}: ${practitionerName}`,
                        practitionerRole,
                        (officeName && (officeName as string)) || ''
                      ]}
                      separator={<Separator />}
                    />
                  </ValueContainer>
                )}
                {status.contactNumber && (
                  <LabelValue
                    label={this.props.intl.formatMessage(
                      messages.applicantContactNumber
                    )}
                    value={status.contactNumber}
                  />
                )}
                {status.trackingId && (
                  <LabelValue
                    label={this.props.intl.formatMessage(messages.trackingId)}
                    value={status.trackingId}
                  />
                )}
                {status.rejectReason && (
                  <LabelValue
                    label={this.props.intl.formatMessage(messages.reason)}
                    value={status.rejectReason}
                  />
                )}
                {status.rejectComment && (
                  <LabelValue
                    label={this.props.intl.formatMessage(messages.comment)}
                    value={status.rejectComment}
                  />
                )}
              </StatusContainer>
            </HistoryWrapper>
          )
        })
      ).reverse() || null
    )
  }

  renderSubPage(historyData: IHistoryData) {
    return (
      <SubPage
        title={historyData.title}
        emptyTitle={this.props.intl.formatMessage(messages.noNameProvided)}
        goBack={this.props.goBack}
      >
        {this.renderHistory(historyData.history)}
        {historyData.action}
      </SubPage>
    )
  }

  render() {
    return (
      (this.props.draft &&
        this.renderSubPage(this.generateDraftHistoryData())) || (
        <>
          <Query
            query={FETCH_REGISTRATION_BY_COMPOSITION}
            variables={{
              id: this.props.applicationId
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
                throw error
              } else if (loading) {
                return (
                  <SpinnerContainer>
                    <QuerySpinner
                      id="query-spinner"
                      baseColor={this.props.theme.colors.background}
                    />
                  </SpinnerContainer>
                )
              }
              return this.renderSubPage(this.generateGqlHistorData(data))
            }}
          </Query>
        </>
      )
    )
  }
}

function mapStateToProps(
  state: IStoreState,
  props: RouteComponentProps<{
    applicationId: string
  }>
) {
  const { match } = props
  return {
    language: state.i18n.language,
    userDetails: getUserDetails(state),
    scope: getScope(state),
    applicationId: match && match.params && match.params.applicationId,
    draft:
      (state.applicationsState.applications &&
        match &&
        match.params &&
        match.params.applicationId &&
        state.applicationsState.applications.find(
          application =>
            application.id === match.params.applicationId &&
            (application.submissionStatus ===
              SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT] ||
              application.submissionStatus ===
                SUBMISSION_STATUS[SUBMISSION_STATUS.FAILED])
        )) ||
      null
  }
}

export const Details = connect(
  mapStateToProps,
  {
    goToPage: goToPageAction,
    goBack: goBackAction,
    goToPrintCertificate: goToPrintCertificateAction
  }
)(injectIntl(withTheme(DetailView)))
